import { getUserFromRequest, type SupabaseEnv } from './_supabase'
import { getDecodeUsage } from './_decodeUsage'

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

// GET /api/decode-usage — lets DecodeScreen show "N of M left today" before
// the user types anything, using the same limit/lookup logic decode.ts
// enforces (see _decodeUsage.ts).
export const onRequestGet: PagesFunction<SupabaseEnv> = async (context) => {
  const { request, env } = context

  const user = await getUserFromRequest(request, env)
  if (!user) {
    return jsonResponse({ error: '로그인이 필요합니다.' }, 401)
  }

  try {
    const usage = await getDecodeUsage(env, user.id)
    return jsonResponse(usage, 200)
  } catch (err) {
    return jsonResponse(
      { error: 'Failed to check usage.', details: err instanceof Error ? err.message : String(err) },
      502,
    )
  }
}
