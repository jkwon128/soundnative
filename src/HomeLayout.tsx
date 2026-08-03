import type { ReactNode } from 'react'
import Logo from './Logo'

interface HomeTab {
  key: 'today' | 'decode' | 'notes'
  label: string
  icon: string
  onSelect: () => void
}

interface HomeLayoutProps {
  streak: number
  userEmail: string | null
  onOpenMyPage: () => void
  onOpenDecode: () => void
  onOpenNotes: () => void
  children: ReactNode
}

// Shared shell for the Home ("오늘") screen only — Decode/Notes are still
// separate full screens with their own back button (unchanged), so the tab
// control here only ever needs to render "오늘" as active; picking Decode or
// 노트 just navigates away, same as the in-page nav cards do.
function HomeLayout({
  streak,
  userEmail,
  onOpenMyPage,
  onOpenDecode,
  onOpenNotes,
  children,
}: HomeLayoutProps) {
  const tabs: HomeTab[] = [
    { key: 'today', label: '오늘', icon: 'today', onSelect: () => {} },
    { key: 'decode', label: 'Decode', icon: 'graphic_eq', onSelect: onOpenDecode },
    { key: 'notes', label: '노트', icon: 'bookmark', onSelect: onOpenNotes },
  ]

  const renderTabs = (variant: 'header' | 'floating') => (
    <div
      className={
        variant === 'header'
          ? 'hidden md:flex items-center gap-1 bg-warm-badge-bg rounded-full p-1'
          : 'md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-warm-surface border border-warm-border rounded-full p-1 shadow-warm-card'
      }
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`px-md py-1.5 rounded-full font-label-bold text-label-bold cursor-pointer transition-colors ${
            tab.key === 'today'
              ? 'bg-warm-primary text-warm-on-primary'
              : 'text-warm-text-muted hover:text-warm-text'
          }`}
          onClick={tab.onSelect}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-warm-bg pb-24 md:pb-0">
      <header className="sticky top-0 z-10 bg-warm-bg/95 backdrop-blur border-b border-warm-border flex items-center justify-between px-md md:px-lg py-sm gap-md">
        <div className="flex items-center gap-2 text-warm-text font-label-bold text-lg font-bold">
          <Logo className="h-8 w-8" />
          SoundNative
        </div>

        {renderTabs('header')}

        <div className="flex items-center gap-sm">
          <span className="flex items-center gap-1 bg-warm-badge-bg text-warm-badge-text font-label-bold text-label-bold px-md py-1 rounded-full">
            <span className="material-symbols-outlined text-lg">local_fire_department</span>
            {streak}
          </span>
          {userEmail && (
            <button
              className="text-warm-text-muted cursor-pointer"
              onClick={onOpenMyPage}
              aria-label="마이페이지"
              title={userEmail}
            >
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-[820px] mx-auto p-gutter md:p-lg">{children}</main>

      {renderTabs('floating')}
    </div>
  )
}

export default HomeLayout
