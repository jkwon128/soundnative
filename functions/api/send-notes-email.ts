import { groupNotesByDate, sortNotesNewestFirst } from '../../src/noteGrouping'
import type { NoteEntry } from '../../src/types'

interface Env {
  RESEND_API_KEY: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isNoteEntry(value: unknown): value is NoteEntry {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    (v.type === 'auto' || v.type === 'manual') &&
    typeof v.createdAt === 'string'
  )
}

function renderNoteHtml(note: NoteEntry): string {
  if (note.type === 'auto') {
    const memoHtml = note.memo
      ? `<p style="margin:6px 0 0;padding-top:6px;border-top:1px solid #e2e8f0;color:#0040df;font-size:13px;"><strong>내 메모:</strong> ${escapeHtml(note.memo)}</p>`
      : ''
    return `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:10px;">
        <p style="margin:0;font-weight:700;color:#161a32;">"${escapeHtml(note.phrase ?? '')}"</p>
        <p style="margin:4px 0 0;color:#434656;font-size:14px;">${escapeHtml(note.meaning ?? '')}</p>
        ${memoHtml}
      </div>`
  }

  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:10px;">
      <p style="margin:0;color:#161a32;white-space:pre-wrap;">${escapeHtml(note.content ?? '')}</p>
    </div>`
}

function renderEmailHtml(notes: NoteEntry[]): string {
  const groups = groupNotesByDate(sortNotesNewestFirst(notes))
  const groupsHtml = groups
    .map(
      (group) => `
        <h2 style="font-size:15px;color:#161a32;margin:24px 0 8px;">${escapeHtml(group.label)}</h2>
        ${group.notes.map(renderNoteHtml).join('')}`,
    )
    .join('')

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;color:#0040df;margin:0 0 4px;">SoundNative</h1>
      <p style="color:#434656;margin:0 0 20px;">지금까지 배운 표현 ${notes.length}개</p>
      ${groupsHtml}
    </div>`
}

// POST /api/send-notes-email — emails the caller's current note list via
// Resend. Body: { email: string, notes: NoteEntry[] }.
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.RESEND_API_KEY) {
    return jsonResponse({ success: false, error: 'Server is missing RESEND_API_KEY.' }, 500)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, error: 'Request body must be valid JSON.' }, 400)
  }

  const { email, notes } = (body ?? {}) as { email?: unknown; notes?: unknown }

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
    return jsonResponse({ success: false, error: '올바른 이메일 주소를 입력해주세요.' }, 400)
  }
  if (!Array.isArray(notes) || notes.length === 0 || !notes.every(isNoteEntry)) {
    return jsonResponse({ success: false, error: '보낼 노트가 없습니다.' }, 400)
  }

  let resendResponse: Response
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        // TODO: switch to a verified sending domain once one is set up on
        // Resend — onboarding@resend.dev only works for testing/dev sends.
        from: 'SoundNative <onboarding@resend.dev>',
        to: [email],
        subject: 'SoundNative — 지금까지 배운 표현 노트',
        html: renderEmailHtml(notes),
      }),
    })
  } catch {
    return jsonResponse({ success: false, error: 'Failed to reach Resend API.' }, 502)
  }

  if (!resendResponse.ok) {
    const details = await resendResponse.text().catch(() => '')
    return jsonResponse(
      { success: false, error: '이메일 발송에 실패했습니다.', details },
      502,
    )
  }

  return jsonResponse({ success: true }, 200)
}
