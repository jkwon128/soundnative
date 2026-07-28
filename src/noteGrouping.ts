import { getTodayDateString, getYesterdayDateString } from './dateUtils'
import type { NoteEntry } from './types'

// Framework-agnostic (no DOM/React deps) so it can be shared between the
// Notes screen and the send-notes-email Pages Function.

export interface NoteGroup {
  key: string
  label: string
  notes: NoteEntry[]
}

export function sortNotesNewestFirst(notes: NoteEntry[]): NoteEntry[] {
  return [...notes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

// Local-date key ("YYYY-MM-DD") for a note's createdAt, in the same shape
// dailyQuest's getTodayDateString/getYesterdayDateString use — so today/
// yesterday comparisons line up exactly.
export function dateKey(iso: string): string {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function groupHeaderLabel(key: string, todayKey: string, yesterdayKey: string): string {
  const [, monthStr, dayStr] = key.split('-')
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (key === todayKey) return `오늘 (${month}/${day}) 배운 표현`
  if (key === yesterdayKey) return `어제 (${month}/${day}) 배운 표현`
  return `${month}월 ${day}일 배운 표현`
}

// notes is expected newest-first already, so grouping while iterating keeps
// both the groups and each group's notes in that same order.
export function groupNotesByDate(sorted: NoteEntry[]): NoteGroup[] {
  const todayKey = getTodayDateString()
  const yesterdayKey = getYesterdayDateString(todayKey)
  const groups: NoteGroup[] = []
  const groupIndexByKey = new Map<string, number>()

  for (const note of sorted) {
    const key = dateKey(note.createdAt)
    let index = groupIndexByKey.get(key)
    if (index === undefined) {
      index = groups.length
      groupIndexByKey.set(key, index)
      groups.push({ key, label: groupHeaderLabel(key, todayKey, yesterdayKey), notes: [] })
    }
    groups[index].notes.push(note)
  }

  return groups
}
