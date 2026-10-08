/* =====================================================================
   PORTFY · js/main.js
   Camada: Inicialização
   Liga o Supabase (se configurado) e abre o site
   ===================================================================== */

/* Conecta ao Supabase quando o config.js estiver preenchido; senão usa o localStorage */
if (USE_SUPABASE) PortfyAPI.init(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeM()
});

(function init(){
  const t=ls.get('pf_theme',null);
  if(t)document.documentElement.dataset.theme=t;
  if(ls.get('pf_session',null))enter()
})();
