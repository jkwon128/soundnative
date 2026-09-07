export interface BilingualTextValue {
  ko: string
  en?: string
}

export type BilingualDisplayMode = 'bilingual' | 'ko' | 'en'

interface BilingualTextProps extends BilingualTextValue {
  mode?: BilingualDisplayMode
  as?: 'span' | 'div' | 'p'
  className?: string
  koClassName?: string
  enClassName?: string
}

// Stacks a Korean primary line over a smaller, muted English line. `mode`
// exists so a future ko-only/en-only/bilingual display toggle can reuse this
// component without touching call sites — only 'bilingual' (the default) is
// wired up today.
function BilingualText({
  ko,
  en,
  mode = 'bilingual',
  as: Tag = 'span',
  className,
  koClassName,
  enClassName,
}: BilingualTextProps) {
  const showKo = mode !== 'en'
  const showEn = mode !== 'ko' && Boolean(en)

  return (
    <Tag className={`flex flex-col${className ? ` ${className}` : ''}`}>
      {showKo && <span className={koClassName}>{ko}</span>}
      {showEn && (
        <span
          className={`leading-tight tracking-tight text-warm-text-muted/75${enClassName ? ` ${enClassName}` : ''}`}
        >
          {en}
        </span>
      )}
    </Tag>
  )
}

export default BilingualText
