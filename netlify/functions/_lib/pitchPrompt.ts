/**
 * Server-side pitch generation logic. Ported from the old src/lib/pitchGenerator.ts,
 * which called blink.ai.generateText() from the BROWSER. That's no longer
 * possible (and was never safe long-term — it exposed the generation call
 * to anyone with dev tools open). This version runs inside a Netlify
 * Function and calls Anthropic's API directly with a server-only key.
 *
 * NOTE ON MODEL CHOICE: the original Blink build used 'gpt-4.1-mini' (one of
 * Blink's proxied models). This version uses Claude (claude-sonnet-4-6) to
 * match the model originally specified throughout this project's build
 * docs. If you'd rather keep using OpenAI's models, this is the one place
 * that needs to change — everything else (schema, validation, retry logic)
 * stays the same either way.
 *
 * Required environment variable: ANTHROPIC_API_KEY
 */

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

function buildSystemPrompt(clientName?: string): string {
  const nameContext = clientName
    ? `\nThe client's name is "${clientName}". Use it naturally in the pitches where it feels right.`
    : ''

  return `You are an encouraging, supportive pitch coach for BEGINNER freelancers — people landing their first few clients, with little to no portfolio or track record. Your tone is warm, motivating, and confidence-building, like a trusted mentor who believes in them.

CONTEXT ABOUT THIS USER:
- They are NEW to freelancing. They may have zero portfolio, zero past clients, zero testimonials.
- They need pitches that sound competent and professional WITHOUT inventing fake experience.
- Every piece of feedback should feel like "here's how to shine" not "here's what's wrong."

CRITICAL RULES:
1. NEVER invent experience, past clients, results, credentials, portfolio examples, or testimonials the freelancer hasn't provided.
2. All three pitch options should sound like they come from a real person — conversational, warm, and human.
3. Vary the tone across the three options:
   - Option A: Warm and personal (relationship-focused)
   - Option B: Task-focused and capable (shows they understand the work)
   - Option C: Curious and consultative (asks smart questions, positions them as a thoughtful partner)
4. Each pitch should be 3-6 sentences. Short enough to read quickly, long enough to feel substantive.
5. Always end pitches with a clear, friendly call to action (e.g. "Would love to chat more about this!").
6. The coaching feedback section should be constructive and encouraging — point out areas to strengthen AND note what's already working.
7. The revised pitch should combine the best elements from all three options into one strengthened version.
8. All explanations should highlight strengths first — what the pitch does well for THIS specific job.${nameContext}

OUTPUT: Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "options": [
    { "title": "...", "pitch": "...", "explanation": "..." },
    { "title": "...", "pitch": "...", "explanation": "..." },
    { "title": "...", "pitch": "...", "explanation": "..." }
  ],
  "coachingFeedback": "...",
  "revisedPitch": { "title": "...", "pitch": "...", "explanation": "..." },
  "recommendedOption": {
    "selectedTitle": "...",
    "selectedPitchType": "option_a|option_b|option_c|revised",
    "reason": "..."
  }
}`
}

function buildUserPrompt(jobPost: string, clientName?: string): string {
  const nameLine = clientName ? `Client name: ${clientName}\n\n` : ''
  return `${nameLine}Here is the job post / gig description:\n\n"""\n${jobPost}\n"""\n\nGenerate exactly 3 different pitch options, coaching feedback, one revised pitch, and a recommended option — all for a beginner freelancer with no portfolio to speak of.`
}

function extractJson(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    const end = cleaned.indexOf('\n')
    const fenceTag = cleaned.substring(3, end).trim()
    cleaned = cleaned.substring(end + 1)
    const closeIdx = cleaned.lastIndexOf('```')
    if (closeIdx !== -1) cleaned = cleaned.substring(0, closeIdx)
  }
  return cleaned.trim()
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY environment variable.')

  // Generating 3 full pitch options + coaching feedback + a revised pitch +
  // a recommendation in one call is a genuinely large request — this
  // routinely takes longer than 20s, which is NOT a hang or a network
  // problem, just how long that much generation actually takes. 45s gives
  // real room to finish rather than cutting off legitimate work.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45_000)

  let response: Response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        temperature: 0.8,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new TimeoutMarkerError('Anthropic API request timed out after 45 seconds.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${errBody.slice(0, 300)}`)
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text?: string }>
  }
  const textBlock = data.content.find((b) => b.type === 'text')
  if (!textBlock?.text) throw new Error('Anthropic response had no text content.')
  return textBlock.text
}

/** Marks an error as a genuine timeout, so the retry logic below can treat
 *  it differently from a "malformed JSON" style failure — retrying a slow
 *  request just doubles the wait, it doesn't help. */
class TimeoutMarkerError extends Error {}

function validateAndParse(text: string): PitchResult {
  const json = extractJson(text)
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error(
      `The AI returned text that couldn't be parsed as JSON. Response preview: "${text.slice(0, 200)}..."`,
    )
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.options) || obj.options.length < 3) {
    throw new Error('AI response is missing the required "options" array with 3 entries.')
  }
  if (typeof obj.coachingFeedback !== 'string') {
    throw new Error('AI response is missing the required "coachingFeedback" field.')
  }
  if (!obj.revisedPitch || typeof (obj.revisedPitch as Record<string, unknown>).pitch !== 'string') {
    throw new Error('AI response is missing the required "revisedPitch" object.')
  }
  if (
    !obj.recommendedOption ||
    typeof (obj.recommendedOption as Record<string, unknown>).selectedPitchType !== 'string'
  ) {
    throw new Error('AI response is missing the required "recommendedOption" object.')
  }

  return obj as unknown as PitchResult
}

/**
 * Generates a pitch. Retries once on failure — but ONLY for fast,
 * cheap-to-retry failures (e.g. the AI returned malformed JSON). A genuine
 * timeout is NOT retried, since the request already took the full 45s;
 * retrying would just wait another 45s for something that isn't actually
 * broken, dragging total latency well past a minute for no benefit.
 * Throws a clean, user-safe error message on final failure — callers
 * should NOT leak raw error details to the client (see Beta Report Issues
 * 12/17/18 — this was the original bug).
 */
export async function generatePitchServerSide(
  jobPost: string,
  clientName?: string,
): Promise<PitchResult> {
  const systemPrompt = buildSystemPrompt(clientName)
  const userPrompt = buildUserPrompt(jobPost, clientName)

  const attempt = async () => validateAndParse(await callAnthropic(systemPrompt, userPrompt))

  try {
    return await attempt()
  } catch (firstError) {
    console.error('[generate-pitch] First attempt failed:', firstError)

    if (firstError instanceof TimeoutMarkerError) {
      // Don't retry a timeout — fail fast with a clear message instead of
      // making the user wait another 45s for the same likely outcome.
      throw new Error(
        'This is taking longer than usual. Please try again in a moment.',
      )
    }

    try {
      return await attempt()
    } catch (secondError) {
      console.error('[generate-pitch] Second attempt failed:', secondError)
      // User-safe message only — no raw error codes/stack details.
      throw new Error(
        "We couldn't generate your pitches just now. Please try again in a moment.",
      )
    }
  }
}
