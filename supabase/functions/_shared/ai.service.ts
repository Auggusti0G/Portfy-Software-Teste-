// =====================================================================
// PORTFY · supabase/functions/_shared/ai.service.ts
// Camada: serviço externo. É o ÚNICO arquivo que conhece o provedor de IA.
// Para trocar de provedor (OpenAI, Gemini...), altere somente este arquivo.
// =====================================================================
const MODEL = Deno.env.get('AI_MODEL') ?? 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 700

export class AiUnavailableError extends Error {}

export async function askModel(system: string, messages: { role: string; content: string }[]) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) throw new AiUnavailableError('IA não configurada no servidor.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages }),
  })
  if (!res.ok) {
    console.error('Erro da IA:', res.status, await res.text())
    throw new AiUnavailableError('A IA está indisponível agora. Tente de novo em instantes.')
  }

  const out = await res.json()
  const reply = (out.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text).join('\n').trim() || 'Não consegui responder agora. Pode reformular?'
  return { reply, tokensIn: out.usage?.input_tokens ?? 0, tokensOut: out.usage?.output_tokens ?? 0 }
}
