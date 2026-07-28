// Pure date-string math, no localStorage — kept separate from dailyQuest.ts
// so it can be imported from a Cloudflare Pages Function (Workers runtime
// has no `localStorage` global, and TypeScript checks a module's full body
// even for functions that end up unused after tree-shaking).

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayDateString(): string {
  return formatDate(new Date())
}

export function getDayIndex(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000)
}

export function getYesterdayDateString(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() - 1)
  return formatDate(date)
}
