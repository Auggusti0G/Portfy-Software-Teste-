// =====================================================================
// PORTFY · supabase/functions/ai-chat/index.ts
// Camada: CONTROLLER. Só orquestra: valida, confere cota, chama os serviços.
// Deploy:  npx supabase functions deploy ai-chat
// Secret:  npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// =====================================================================
import { cors, json } from '../_shared/cors.ts'
import { adminClient, userClient } from '../_shared/clients.ts'
import { buildContext, SYSTEM_PROMPT } from '../_shared/prompt.ts'
import { AiUnavailableError, askModel } from '../_shared/ai.service.ts'
import { ensureConversation, getHistory, getQuota, getUserContext, saveExchange } from '../_shared/chat.repository.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)

  try {
    // 1. Quem é o usuário?
    const userDb = userClient(req)
    const { data: { user }, error: authError } = await userDb.auth.getUser()
    if (authError || !user) return json({ error: 'Não autenticado.' }, 401)
    const admin = adminClient()

    // 2. A mensagem é válida?
    const body = await req.json().catch(() => ({}))
    const message = String(body.message ?? '').trim()
    if (!message || message.length > 2000) {
      return json({ error: 'invalid', message: 'Escreva uma mensagem de até 2000 caracteres.' }, 400)
    }

    // 3. Ainda tem cota hoje?
    const quota = await getQuota(userDb)
    if (quota.used >= quota.limit) {
      return json({ error: 'quota', message: `Você usou as ${quota.limit} mensagens de hoje no seu plano.`, quota }, 429)
    }

    // 4. Conversa, histórico e contexto
    const conversationId = await ensureConversation(userDb, admin, user.id, body.conversation_id ?? null, message)
    const history = await getHistory(userDb, conversationId)
    const { profile, diag } = await getUserContext(userDb, user.id)

    // 5. Pergunta à IA
    const { reply, tokensIn, tokensOut } = await askModel(
      `${SYSTEM_PROMPT}\n\n${buildContext(profile, diag)}`,
      [...history, { role: 'user', content: message }],
    )

    // 6. Grava e responde
    await saveExchange(admin, { conversationId, userId: user.id, message, reply, tokensIn, tokensOut })
    return json({ reply, conversation_id: conversationId, quota: { used: quota.used + 1, limit: quota.limit } })
  } catch (err) {
    if (err instanceof AiUnavailableError) return json({ error: 'ai_unavailable', message: err.message }, 502)
    console.error(err)
    return json({ error: 'internal', message: 'Erro interno. Tente novamente.' }, 500)
  }
})
