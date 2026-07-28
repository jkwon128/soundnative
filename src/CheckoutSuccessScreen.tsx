import { useEffect, useState } from 'react'
import { saveCustomerEmail } from './customerEmail'

interface CheckoutStatusInfo {
  status: 'open' | 'expired' | 'confirmed' | 'succeeded' | 'failed'
  productName: string | null
  customerEmail: string | null
  amount: number
  currency: string
}

interface CheckoutSuccessScreenProps {
  checkoutId: string
  onDone: () => void
}

const STATUS_COPY: Record<
  CheckoutStatusInfo['status'],
  { icon: string; title: string; body: string }
> = {
  succeeded: {
    icon: 'check_circle',
    title: '구매가 완료됐어요!',
    body: '이제 모든 프리미엄 콘텐츠를 이용할 수 있어요.',
  },
  confirmed: {
    icon: 'check_circle',
    title: '결제가 확인됐어요',
    body: '프리미엄 이용 권한이 곧 활성화됩니다.',
  },
  open: {
    icon: 'hourglass_empty',
    title: '결제가 아직 완료되지 않았어요',
    body: '결제를 완료하지 않고 돌아오셨네요. 다시 시도하려면 프리미엄 페이지로 이동해주세요.',
  },
  expired: {
    icon: 'error',
    title: '결제 세션이 만료됐어요',
    body: '프리미엄 페이지에서 다시 시도해주세요.',
  },
  failed: {
    icon: 'error',
    title: '결제에 실패했어요',
    body: '카드사에 문의하시거나 다른 결제 수단으로 다시 시도해주세요.',
  },
}

function CheckoutSuccessScreen({ checkoutId, onDone }: CheckoutSuccessScreenProps) {
  const [info, setInfo] = useState<CheckoutStatusInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/checkout-status?checkout_id=${encodeURIComponent(checkoutId)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || '결제 상태를 확인하지 못했습니다.')
        const statusInfo = data as CheckoutStatusInfo
        // The email the user typed at checkout is the only address we ever
        // send them anything to — capture it once here instead of asking
        // again anywhere else in the app.
        if (statusInfo.customerEmail) saveCustomerEmail(statusInfo.customerEmail)
        if (!cancelled) setInfo(statusInfo)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '결제 상태를 확인하지 못했습니다.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [checkoutId])

  const copy = info ? STATUS_COPY[info.status] : null

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-gutter md:p-lg">
      <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg flex flex-col items-center text-center gap-sm shadow">
        {error && (
          <div className="bg-error-container border border-error rounded-lg px-md py-sm font-body-md text-body-md text-on-error-container w-full">
            {error}
          </div>
        )}

        {!error && !copy && (
          <div className="font-body-md text-body-md text-on-surface-variant">확인하는 중...</div>
        )}

        {copy && (
          <>
            <span
              className={`material-symbols-outlined text-4xl ${
                info?.status === 'succeeded' || info?.status === 'confirmed'
                  ? 'text-secondary'
                  : 'text-error'
              }`}
            >
              {copy.icon}
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface">{copy.title}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">{copy.body}</p>
          </>
        )}

        <button
          className="btn-primary w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg cursor-pointer mt-2"
          onClick={onDone}
        >
          홈으로
        </button>
      </div>
    </div>
  )
}

export default CheckoutSuccessScreen
