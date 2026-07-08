interface Env {
  OPENAI_API_KEY: string
  OPENAI_MODEL?: string
}

interface DecodeResult {
  literal: string
  realMeaning: string
  tone: string
  howToRespond: string
}

const DEVELOPER_PROMPT = `너는 영어권 문화와 화용(pragmatics) 전문가야. 비원어민이 영어 표현의 숨은 뜻·뉘앙스·톤을 이해하도록 도와줘.

사용자는 원어민이 자신에게 한 영어 문장 하나를 줄 거야. 그 문장을 분석해서 답해줘.

한국어로 응답하고, 다른 설명이나 마크다운, 코드펜스 없이 아래 형식의 순수한 JSON 객체만 출력해:
{
  "literal": "표면적인 직역 의미",
  "realMeaning": "원어민이 실제로 담은 속뜻",
  "tone": "이 말의 톤/뉘앙스 (예: 친근함, 완곡한 거절, 약간의 짜증 등)",
  "howToRespond": "이럴 때 자연스럽게 답하는 예시 문장과 간단한 설명"
}

규칙:
- 각 필드는 간결하게 (1~2문장).
- 문장이 정말로 직역 그대로이고 숨은 뜻이 없다면, realMeaning에 그렇게 적어.
- howToRespond에는 실제 사용할 수 있는 영어 예문을 포함해.`

const DEFAULT_MODEL = 'gpt-5.4-mini'

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function extractOutputText(data: any): string | undefined {
  const message = data?.output?.find((item: any) => item.type === 'message')
  const textPart = message?.content?.find((part: any) => part.type === 'output_text')
  return textPart?.text
}

function isDecodeResult(value: unknown): value is DecodeResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.literal === 'string' &&
    typeof v.realMeaning === 'string' &&
    typeof v.tone === 'string' &&
    typeof v.howToRespond === 'string'
  )
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: 'Server is missing OPENAI_API_KEY.' }, 500)
  }

  let phrase: unknown
  try {
    const body = await request.json()
    phrase = (body as { phrase?: unknown })?.phrase
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400)
  }

  if (typeof phrase !== 'string' || phrase.trim().length === 0) {
    return jsonResponse({ error: '"phrase" must be a non-empty string.' }, 400)
  }

  let openaiResponse: Response
  try {
    openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || DEFAULT_MODEL,
        input: [
          {
            role: 'developer',
            content: [{ type: 'input_text', text: DEVELOPER_PROMPT }],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: phrase.trim() }],
          },
        ],
        text: {
          format: { type: 'json_object' },
        },
        reasoning: { effort: 'medium' },
        store: false,
      }),
    })
  } catch {
    return jsonResponse({ error: 'Failed to reach OpenAI API.' }, 502)
  }

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text().catch(() => '')
    return jsonResponse(
      { error: 'OpenAI API request failed.', details: errorText },
      502,
    )
  }

  const data = await openaiResponse.json().catch(() => undefined)
  const outputText = data ? extractOutputText(data) : undefined

  if (!outputText) {
    return jsonResponse({ error: 'OpenAI API returned an unexpected response.' }, 502)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(outputText)
  } catch {
    return jsonResponse({ error: 'Failed to parse OpenAI API output as JSON.' }, 502)
  }

  if (!isDecodeResult(parsed)) {
    return jsonResponse({ error: 'OpenAI API output was missing expected fields.' }, 502)
  }

  return jsonResponse(parsed, 200)
}
