import type { NoteEntry } from './types'
import type { QuizQuestion } from './quizData'

const NOTES_KEY = 'soundnative:notes'

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function loadNotes(): NoteEntry[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveNotes(notes: NoteEntry[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

// The sentence a saved note should show as its "phrase" — the correct
// answer's text, whether that's the question's own phrase or (for tone-type
// questions) whichever of phraseA/phraseB is correct. Shared by addAutoNote
// and the quest screen's save-preview so they can't drift apart.
export function getNotePhrase(question: QuizQuestion): string | undefined {
  return question.type === 'tone'
    ? question.answer === 'A'
      ? question.phraseA
      : question.phraseB
    : question.phrase
}

export function hasNoteForQuestion(questionId: string): boolean {
  return loadNotes().some((note) => note.questionId === questionId)
}

// Saves a note for a correctly-answered quiz question, with an optional
// user-written memo on top. No-ops if this question was already saved, so
// replaying a session doesn't duplicate it.
export function addAutoNote(question: QuizQuestion, memo?: string): void {
  const existing = loadNotes()
  if (existing.some((note) => note.questionId === question.id)) return

  const trimmedMemo = memo?.trim()

  const entry: NoteEntry = {
    id: generateId(),
    type: 'auto',
    createdAt: new Date().toISOString(),
    questionId: question.id,
    phrase: getNotePhrase(question),
    meaning: question.explanation,
    category: question.category,
    ...(trimmedMemo ? { memo: trimmedMemo } : {}),
  }

  saveNotes([entry, ...existing])
}

export function addManualNote(content: string): void {
  const trimmed = content.trim()
  if (!trimmed) return

  const entry: NoteEntry = {
    id: generateId(),
    type: 'manual',
    createdAt: new Date().toISOString(),
    content: trimmed,
  }

  saveNotes([entry, ...loadNotes()])
}

export function deleteNote(id: string): void {
  saveNotes(loadNotes().filter((note) => note.id !== id))
}

export function clearNotes(): void {
  try {
    localStorage.removeItem(NOTES_KEY)
  } catch {
    // localStorage unavailable (e.g. private browsing) — ignore
  }
}

// Mirrors DecodeScreen.tsx's DecodeResult shape. Declared inline rather than
// imported — DecodeScreen imports from this module, so importing its type
// back would be a circular import.
interface DecodeNoteResult {
  literal: string
  realMeaning: string
  tone: string
  howToRespond: string
}

export function normalizePhrase(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Decode-specific dedup — unlike addAutoNote's questionId check, a freely
// typed phrase has no stable id, so this compares normalized phrase text
// instead. Checks across all notes regardless of `source`.
export function hasNoteForPhrase(phrase: string): boolean {
  const normalized = normalizePhrase(phrase)
  return loadNotes().some((note) => note.phrase && normalizePhrase(note.phrase) === normalized)
}

// Saves a note for a Decode result, with an optional user-written memo on
// top. No-ops (returning false) if this phrase was already saved, so
// re-decoding the same sentence doesn't duplicate it.
export function addDecodeNote(phrase: string, result: DecodeNoteResult, memo?: string): boolean {
  if (hasNoteForPhrase(phrase)) return false

  const trimmedMemo = memo?.trim()

  const entry: NoteEntry = {
    id: generateId(),
    type: 'auto',
    source: 'decode',
    createdAt: new Date().toISOString(),
    phrase: phrase.trim(),
    meaning: result.realMeaning,
    decodeExtra: {
      literal: result.literal,
      tone: result.tone,
      howToRespond: result.howToRespond,
    },
    ...(trimmedMemo ? { memo: trimmedMemo } : {}),
  }

  saveNotes([entry, ...loadNotes()])
  return true
}
