/* =====================================================================
   PORTFY · js/main.js
   Camada: Inicialização
   Liga o Supabase (se configurado) e abre o site
   ===================================================================== */

/* Conecta ao Supabase quando o config.js estiver preenchido; senão usa o localStorage */
// Na abertura do sistema:
if (window.PortfyAPI) {
  PortfyAPI.init(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  
  const session = await PortfyAPI.session();
  if (session) {
    // Se o usuário tem sessão ativa, carrega todos os dados do banco
    const loadedData = await PortfyAPI.load();
    enter(loadedData);
  }
}
