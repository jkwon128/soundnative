import type { ReactNode } from 'react'
import Logo from './Logo'

interface HomeTab {
  key: 'today' | 'decode' | 'notes'
  label: string
  icon: string
  onSelect: () => void
}

interface HomeLayoutProps {
  activeTab: 'today' | 'decode' | 'notes'
  streak: number
  // Only Home renders the account icon (see the Decode redesign — its
  // screenshots have no account icon in the header), so these are optional
  // rather than every embedding screen needing to fake a handler.
  userEmail?: string | null
  onOpenMyPage?: () => void
  onOpenHome: () => void
  onOpenDecode: () => void
  onOpenNotes: () => void
  children: ReactNode
}

// Shared shell reused by every screen that has the "오늘 | Decode | 노트" tab
// control — Home and Decode so far. Whichever screen embeds this passes its
// own key as `activeTab`; the other two tabs just navigate away (their
// target screens are unchanged, separate full-screen components).
function HomeLayout({
  activeTab,
  streak,
  userEmail = null,
  onOpenMyPage,
  onOpenHome,
  onOpenDecode,
  onOpenNotes,
  children,
}: HomeLayoutProps) {
  const tabs: HomeTab[] = [
    { key: 'today', label: '오늘', icon: 'today', onSelect: onOpenHome },
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
            tab.key === activeTab
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
          {userEmail && onOpenMyPage && (
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
