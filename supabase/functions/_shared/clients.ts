// =====================================================================
// PORTFY · supabase/functions/_shared/clients.ts
// Camada: acesso ao Supabase (Persistence)
//   userClient  -> age COMO o usuário logado (o RLS vale)
//   adminClient -> privilégio de servidor (ignora o RLS). Use só no back-end.
// =====================================================================
import { createClient } from 'jsr:@supabase/supabase-js@2'

export const userClient = (req: Request) =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })

export const adminClient = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
