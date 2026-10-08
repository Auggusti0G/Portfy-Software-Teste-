/* =====================================================================
   PORTFY · js/config.js
   Camada: Configuração
   Dados de conexão com o Supabase. Deixe vazio para usar o modo local (localStorage).
   ===================================================================== */

const CONFIG = {
  SUPABASE_URL: '',       // ex.: https://abcdefgh.supabase.co
  SUPABASE_ANON_KEY: '',  // chave PÚBLICA (anon / publishable). NUNCA coloque a service_role aqui.
};
const USE_SUPABASE = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
