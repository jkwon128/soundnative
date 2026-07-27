import { useState } from 'react'
import { loadNotes, addManualNote, deleteNote } from './notes'
import { CATEGORY_META } from './categoryMeta'
import { getTodayDateString, getYesterdayDateString } from './dailyQuest'
import type { QuizCategory } from './quizData'
import type { NoteEntry } from './types'

interface NoteScreenProps {
  onBack: () => void
}

interface NoteGroup {
  key: string
  label: string
  notes: NoteEntry[]
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// Local-date key ("YYYY-MM-DD") for a note's createdAt, in the same shape
// dailyQuest's getTodayDateString/getYesterdayDateString use — so today/
// yesterday comparisons line up exactly.
function dateKey(iso: string): string {
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function groupHeaderLabel(key: string, todayKey: string, yesterdayKey: string): string {
  const [, monthStr, dayStr] = key.split('-')
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (key === todayKey) return `오늘 (${month}/${day}) 배운 표현`
  if (key === yesterdayKey) return `어제 (${month}/${day}) 배운 표현`
  return `${month}월 ${day}일 배운 표현`
}

// notes is expected newest-first already, so grouping while iterating keeps
// both the groups and each group's notes in that same order.
function groupNotesByDate(sorted: NoteEntry[]): NoteGroup[] {
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

function NoteScreen({ onBack }: NoteScreenProps) {
  const [notes, setNotes] = useState<NoteEntry[]>(() => loadNotes())
  const [isWriting, setIsWriting] = useState(false)
  const [draft, setDraft] = useState('')

  const sortedNotes = [...notes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const noteGroups = groupNotesByDate(sortedNotes)

  const handleSaveDraft = () => {
    if (!draft.trim()) return
    addManualNote(draft)
    setNotes(loadNotes())
    setDraft('')
    setIsWriting(false)
  }

  const handleCancelDraft = () => {
    setDraft('')
    setIsWriting(false)
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    setNotes(loadNotes())
  }

  return (
    <div className="min-h-screen bg-surface flex justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[560px] flex flex-col gap-md py-lg">
        <button
          className="flex items-center gap-1 text-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          홈으로
        </button>

        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">노트</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            지금까지 배운 표현 {notes.length}개
          </p>
        </div>

        {!isWriting ? (
          <button
            className="flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-md font-label-bold text-label-bold text-primary cursor-pointer"
            onClick={() => setIsWriting(true)}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            직접 메모 추가
          </button>
        ) : (
          <div className="flex flex-col gap-sm bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
            <textarea
              autoFocus
              className="w-full min-h-20 bg-surface border-2 border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 transition-colors resize-y"
              placeholder="배운 표현이나 느낀 점을 자유롭게 적어보세요"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex gap-sm justify-end">
              <button
                className="font-label-bold text-label-bold text-on-surface-variant py-sm px-md rounded-lg cursor-pointer"
                onClick={handleCancelDraft}
              >
                취소
              </button>
              <button
                className="btn-primary bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default"
                onClick={handleSaveDraft}
                disabled={!draft.trim()}
              >
                저장
              </button>
            </div>
          </div>
        )}

        {sortedNotes.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              아직 배운 표현이 없어요. 퀘스트를 풀면 여기에 자동으로 쌓여요!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {noteGroups.map((group) => (
              <div key={group.key} className="flex flex-col gap-sm">
                <h2 className="font-label-bold text-label-bold text-on-surface mt-sm">
                  {group.label}
                </h2>

                <div className="flex flex-col gap-sm">
                  {group.notes.map((note) => {
                    const meta = note.category
                      ? CATEGORY_META[note.category as QuizCategory]
                      : undefined
                    return (
                      <div
                        key={note.id}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow flex flex-col gap-sm"
                      >
                        <div className="flex items-center justify-between gap-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-label-bold text-xs px-2 py-0.5 rounded-full ${
                                note.type === 'auto'
                                  ? 'bg-secondary-container/40 text-on-secondary-container'
                                  : 'bg-primary-fixed text-on-primary-fixed-variant'
                              }`}
                            >
                              {note.type === 'auto' ? '자동' : '메모'}
                            </span>
                            {meta && (
                              <span
                                className="flex items-center gap-1 font-label-bold text-xs"
                                style={{ color: meta.color }}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {meta.icon}
                                </span>
                                {meta.label}
                              </span>
                            )}
                          </div>
                          <button
                            className="text-on-surface-variant cursor-pointer shrink-0"
                            onClick={() => handleDelete(note.id)}
                            aria-label="삭제"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>

                        {note.type === 'auto' ? (
                          <div className="flex flex-col gap-1">
                            <p className="font-headline-md text-body-lg text-on-surface">
                              "{note.phrase}"
                            </p>
                            <p className="font-body-md text-body-md text-on-surface-variant">
                              {note.meaning}
                            </p>
                            {note.memo && (
                              <div className="mt-1 pt-2 border-t border-outline-variant flex flex-col gap-0.5">
                                <span className="font-label-bold text-xs text-primary">
                                  내 메모
                                </span>
                                <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                                  {note.memo}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                            {note.content}
                          </p>
                        )}

                        <span className="font-body-md text-xs text-on-surface-variant">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteScreen
