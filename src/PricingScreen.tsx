// TODO: This screen is currently disconnected from routing (unused in the
// live app flow). It's slated to be reconnected once the 3-day streak
// milestone (soft paywall) is implemented. Do not delete until then.
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

interface PricingInfo {
  name: string
  description: string | null
  amount: number
  currency: string
  recurringInterval: 'month' | 'year' | null
}

interface PricingScreenProps {
  onBack: () => void
  skipLabel?: string
}

const INTERVAL_LABEL: Record<'month' | 'year', string> = {
  month: '월',
  year: '년',
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
  }).format(amount / 100)
}

function PricingScreen({ onBack, skipLabel = '홈으로' }: PricingScreenProps) {
  const [pricing, setPricing] = useState<PricingInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/pricing')
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || '가격 정보를 불러오지 못했습니다.')
        if (!cancelled) setPricing(data as PricingInfo)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : '가격 정보를 불러오지 못했습니다.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleCheckout = async () => {
    if (checkoutLoading) return
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('로그인이 필요합니다.')

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || '결제 페이지를 여는 데 실패했습니다.')
      }
      window.location.href = data.url
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : '결제 페이지를 여는 데 실패했습니다.')
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-bg flex justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[480px] flex flex-col gap-md py-lg">
        <button
          className="flex items-center gap-1 text-warm-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {skipLabel}
        </button>

        <div>
          <h1 className="font-warm-serif text-headline-md text-warm-text">SoundNative 구독하기</h1>
          <p className="font-body-md text-body-md text-warm-text-muted">
            모든 학습 콘텐츠와 Decode 기능을 제한 없이 이용하세요
          </p>
        </div>

        {loadError && (
          <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-error-text">
            {loadError}
          </div>
        )}

        {!loadError && !pricing && (
          <div className="font-body-md text-body-md text-warm-text-muted">
            가격 정보를 불러오는 중...
          </div>
        )}

        {pricing && (
          <div className="bg-warm-surface border border-warm-border rounded-warm-card shadow-warm-card p-md flex flex-col gap-sm">
            <div className="font-label-bold text-body-lg text-warm-text">{pricing.name}</div>
            {pricing.description && (
              <p className="font-body-md text-body-md text-warm-text-muted">
                {pricing.description}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="font-warm-serif text-display-lg text-warm-primary">
                {formatAmount(pricing.amount, pricing.currency)}
              </span>
              {pricing.recurringInterval && (
                <span className="font-body-md text-body-md text-warm-text-muted">
                  / {INTERVAL_LABEL[pricing.recurringInterval]}
                </span>
              )}
            </div>

            <button
              className="btn-warm-primary w-full bg-warm-primary text-warm-on-primary font-label-bold text-label-bold py-sm px-md rounded-full cursor-pointer disabled:bg-warm-badge-bg disabled:text-warm-text-muted mt-2"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? '이동 중...' : pricing.recurringInterval ? '구독하기' : '구매하기'}
            </button>

            {checkoutError && (
              <div className="bg-warm-error-bg border border-warm-error-border rounded-warm-lg px-md py-sm font-body-md text-body-md text-warm-error-text">
                {checkoutError}
              </div>
            )}

            <p className="font-body-md text-xs text-warm-text-muted text-center">
              {pricing.recurringInterval
                ? '결제는 Polar가 안전하게 처리합니다. 디지털 구독 콘텐츠이며 언제든지 해지할 수 있어요.'
                : '결제는 Polar가 안전하게 처리합니다. 일회성 결제이며, 결제 후 바로 이용할 수 있어요.'}
            </p>
            <p className="font-body-md text-xs text-warm-text-muted text-center">
              결제 시 입력하신 이메일로 학습 노트를 보내드려요. 이메일 주소를 정확히
              입력해주세요 — 주소를 잘못 입력해 노트를 받지 못한 경우는 환불 대상이 아니에요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PricingScreen
