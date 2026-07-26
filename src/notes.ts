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

// Called when a quiz question is answered correctly. No-ops if this
// question was already saved, so replaying a session doesn't duplicate it.
export function addAutoNote(question: QuizQuestion): void {
  const existing = loadNotes()
  if (existing.some((note) => note.questionId === question.id)) return

  const phrase = question.type === 'tone' ? (question.answer === 'A' ? question.phraseA : question.phraseB) : question.phrase

  const entry: NoteEntry = {
    id: generateId(),
    type: 'auto',
    createdAt: new Date().toISOString(),
    questionId: question.id,
    phrase,
    meaning: question.explanation,
    category: question.category,
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
