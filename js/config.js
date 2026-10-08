/* =====================================================================
   PORTFY · js/config.js
   Camada: Configuração
   Dados de conexão com o Supabase. Deixe vazio para usar o modo local (localStorage).
   ===================================================================== */

// - Desenvolvendo 

const CONFIG = {
  SUPABASE_URL: 'https://viybfblkpnlrsirjoctv.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeWJmYmxrcG5scnNpcmpvY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTk3NjAsImV4cCI6MjEwNzAzNTc2MH0.EuXjg8lMn1_8tvMfku0RtK89D2o29GerHMZUaWNjm0c'
};
const USE_SUPABASE = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
