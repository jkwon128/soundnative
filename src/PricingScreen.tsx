import { useEffect, useState } from 'react'

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
      const response = await fetch('/api/checkout', { method: 'POST' })
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
    <div className="min-h-screen bg-surface flex justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[480px] flex flex-col gap-md py-lg">
        <button
          className="flex items-center gap-1 text-primary font-label-bold text-label-bold w-fit cursor-pointer"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {skipLabel}
        </button>

        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">프리미엄 이용하기</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            모든 학습 콘텐츠와 Decode 기능을 제한 없이 이용하세요
          </p>
        </div>

        {loadError && (
          <div className="bg-error-container border border-error rounded-lg px-md py-sm font-body-md text-body-md text-on-error-container">
            {loadError}
          </div>
        )}

        {!loadError && !pricing && (
          <div className="font-body-md text-body-md text-on-surface-variant">
            가격 정보를 불러오는 중...
          </div>
        )}

        {pricing && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow flex flex-col gap-sm">
            <div className="font-label-bold text-body-lg text-on-surface">{pricing.name}</div>
            {pricing.description && (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {pricing.description}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="font-display-lg text-display-lg text-primary">
                {formatAmount(pricing.amount, pricing.currency)}
              </span>
              {pricing.recurringInterval && (
                <span className="font-body-md text-body-md text-on-surface-variant">
                  / {INTERVAL_LABEL[pricing.recurringInterval]}
                </span>
              )}
            </div>

            <button
              className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:cursor-default mt-2"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? '이동 중...' : pricing.recurringInterval ? '구독하기' : '구매하기'}
            </button>

            {checkoutError && (
              <div className="bg-error-container border border-error rounded-lg px-md py-sm font-body-md text-body-md text-on-error-container">
                {checkoutError}
              </div>
            )}

            <p className="font-body-md text-xs text-on-surface-variant text-center">
              {pricing.recurringInterval
                ? '결제는 Polar가 안전하게 처리합니다. 디지털 구독 콘텐츠이며 언제든지 해지할 수 있어요.'
                : '결제는 Polar가 안전하게 처리합니다. 일회성 결제이며, 결제 후 바로 이용할 수 있어요.'}
            </p>
            <p className="font-body-md text-xs text-on-surface-variant text-center">
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
