/* =====================================================================
   PORTFY · js/utils.js
   Camada: Utilitário
   Funções pequenas usadas em todo o projeto
   ===================================================================== */

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const iso=d=>d.toLocaleDateString('sv'),today=()=>iso(new Date());

const addD=n=>{
  const d=new Date();
  d.setDate(d.getDate()+n);
  return iso(d)
};

const ini=n=>n.split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();

const ago=ts=>{
  const m=Math.round((Date.now()-ts)/6e4);
  return m<1?'agora':m<60?m+'min atrás':m<1440?Math.round(m/60)+'h atrás':new Date(ts).toLocaleDateString('pt-BR')
};

const lbl=d=>d===today()?'Hoje':d===addD(1)?'Amanhã':d.split('-').reverse().slice(0,2).join('/');
