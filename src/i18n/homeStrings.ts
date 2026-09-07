export interface BilingualString {
  ko: string
  en: string
}

// Home screen's three sidebar cards (streak, Decode entry, Notes entry) —
// Korean stays the primary copy, English is a secondary line rendered via
// <BilingualText />. Kept as a plain object rather than an i18n library:
// this app has no router and a handful of strings, so a dictionary is
// enough, and it's still ready for a future ko/en/bilingual display toggle
// since BilingualText already accepts a `mode` prop per instance.
export const homeStrings = {
  streakUnit: { ko: '일 연속', en: 'Day streak' },
  streakSubtext: {
    zero: { ko: '오늘 첫 불씨를 붙여볼까요?', en: 'Start your first streak today' },
    playedToday: {
      ko: '오늘도 지켰어요. 내일 또 만나요 👋',
      en: 'Nice, streak kept! See you tomorrow 👋',
    },
    continue: { ko: '오늘 한 문장이면 이어져요', en: 'One sentence keeps it going' },
  },
  decodeCard: {
    title: { ko: '지금 급한 말이 있어요', en: 'Need something decoded right now?' },
    subtitle: { ko: '원어민이 한 말, 진짜 속뜻 바로 풀기', en: 'Decode what they really meant' },
  },
  notesCard: {
    title: { ko: '표현 노트', en: 'My Phrasebook' },
    subtitle: {
      ko: '저장한 표현 {count}개 · 이번 달 {monthCount}개',
      en: '{count} saved · {monthCount} this month',
    },
  },
}

// Fills {placeholder} tokens in both languages of a pair — e.g. notesCard's
// subtitle needs the note count and this month's count substituted in.
export function formatBilingual(
  pair: BilingualString,
  params: Record<string, string | number>,
): BilingualString {
  const fill = (text: string) => text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''))
  return { ko: fill(pair.ko), en: fill(pair.en) }
}
