import { supabase } from '@/lib/supabaseClient'

// ── Types (unchanged from the original — the shape of a pitch result) ──────

export interface PitchOption {
  title: string
  pitch: string
  explanation: string
}

export interface PitchResult {
  options: [PitchOption, PitchOption, PitchOption]
  coachingFeedback: string
  revisedPitch: PitchOption
  recommendedOption: {
    selectedTitle: string
    selectedPitchType: 'option_a' | 'option_b' | 'option_c' | 'revised'
    reason: string
  }
}

export interface GeneratePitchResponse {
  result: PitchResult
  pitchId: string | null
}

export class PitchLimitError extends Error {
  code: 'USAGE_LIMIT_REACHED' | 'ANONYMOUS_LIMIT_REACHED'
  constructor(message: string, code: 'USAGE_LIMIT_REACHED' | 'ANONYMOUS_LIMIT_REACHED') {
    super(message)
    this.code = code
  }
}

/**
 * Calls the generate-pitch Netlify Function instead of blink.ai directly.
 * The function itself handles: auth verification, the usage-limit check,
 * the actual AI call, and saving the result — all server-side. This is a
 * single network call either way (anonymous or authenticated).
 */
export async function generatePitch(
  jobPost: string,
  clientName: string | undefined,
  anonymousSessionId: string | undefined,
): Promise<GeneratePitchResponse> {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  const response = await fetch('/.netlify/functions/generate-pitch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ jobPost, clientName, anonymousSessionId }),
  })

  const body = await response.json().catch(() => ({ error: 'Unexpected server response.' }))

  if (!response.ok) {
    if (body.code === 'USAGE_LIMIT_REACHED' || body.code === 'ANONYMOUS_LIMIT_REACHED') {
      throw new PitchLimitError(body.error, body.code)
    }
    // Server-safe message only — the function never leaks raw error details.
    throw new Error(body.error || 'Something went wrong generating your pitch.')
  }

  return body as GeneratePitchResponse
}
