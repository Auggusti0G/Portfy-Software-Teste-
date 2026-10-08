// =====================================================================
// PORTFY · supabase/functions/_shared/chat.repository.ts
// Camada: Persistence. Todo acesso ao banco do chat passa por aqui.
// =====================================================================
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export async function getQuota(userDb: SupabaseClient) {
  const { data } = await userDb.rpc('ai_quota')
  return { used: data?.used ?? 0, limit: data?.limit ?? 10 }
}

/** Reaproveita a conversa (se for do usuário) ou cria uma nova. */
export async function ensureConversation(
  userDb: SupabaseClient, admin: SupabaseClient, userId: string, conversationId: string | null, firstMessage: string,
): Promise<string> {
  if (conversationId) {
    const { data } = await userDb.from('ai_conversations').select('id').eq('id', conversationId).maybeSingle()
    if (data) return data.id
  }
  const { data, error } = await admin.from('ai_conversations')
    .insert({ user_id: userId, title: firstMessage.slice(0, 60) }).select('id').single()
  if (error) throw error
  return data.id
}

export async function getHistory(userDb: SupabaseClient, conversationId: string) {
  const { data } = await userDb.from('ai_messages').select('role, content')
    .eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(12)
  const history = (data ?? []).reverse().map((m) => ({ role: m.role as string, content: m.content as string }))
  while (history.length && history[0].role !== 'user') history.shift() // a API exige começar por 'user'
  return history
}

export async function getUserContext(userDb: SupabaseClient, userId: string) {
  const { data: profile } = await userDb.from('profiles').select('full_name, profession').eq('id', userId).maybeSingle()
  const { data: diag } = await userDb.from('diagnostics').select('academic_phase, target_market, study_hours').eq('user_id', userId).maybeSingle()
  return { profile, diag }
}

export async function saveExchange(
  admin: SupabaseClient,
  p: { conversationId: string; userId: string; message: string; reply: string; tokensIn: number; tokensOut: number },
) {
  await admin.from('ai_messages').insert([
    { conversation_id: p.conversationId, user_id: p.userId, role: 'user', content: p.message },
    { conversation_id: p.conversationId, user_id: p.userId, role: 'assistant', content: p.reply, tokens_in: p.tokensIn, tokens_out: p.tokensOut },
  ])
  await admin.rpc('ai_register_usage', { p_user: p.userId, p_tokens: p.tokensIn + p.tokensOut })
  await admin.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', p.conversationId)
}
