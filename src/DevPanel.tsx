import { useState } from 'react'
import PricingScreen from './PricingScreen'

// Dev-only tooling — never rendered in production builds (see the
// import.meta.env.DEV guard in the default export below). Lets developers
// preview screens that are currently disconnected from the live routing
// flow, without affecting real user navigation.
function DevPanel() {
  const [open, setOpen] = useState(false)
  const [previewingPricing, setPreviewingPricing] = useState(false)

  if (previewingPricing) {
    return (
      <div className="fixed inset-0 z-50">
        <PricingScreen onBack={() => setPreviewingPricing(false)} />
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-sm flex flex-col gap-2 text-sm">
          <span className="font-label-bold text-on-surface-variant px-1">Dev Panel</span>
          <button
            className="btn-secondary text-left px-md py-sm rounded-lg border border-outline bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer"
            onClick={() => setPreviewingPricing(true)}
          >
            결제 화면 미리보기
          </button>
        </div>
      )}
      <button
        className="rounded-full h-12 w-12 flex items-center justify-center bg-primary text-on-primary shadow-lg cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-label="Dev Panel"
        title="Dev Panel"
      >
        <span className="material-symbols-outlined">build</span>
      </button>
    </div>
  )
}

export default function DevPanelGate() {
  if (!import.meta.env.DEV) return null
  return <DevPanel />
}
