/* =====================================================================
   PORTFY · js/controllers/ai.controller.js
   Camada: Controller
   Conversa com o Agente de IA
   ===================================================================== */

function ask(e){
  e.preventDefault();
  const v=$('#ci').value.trim();
  if(!v)return false;
  D.chat.push(['me',v]);
  D.chat=D.chat.slice(-40);
  save();
  render();
  const ms=$('#ms');
  ms.insertAdjacentHTML('beforeend','<div class="mg">Digitando…</div>');
  ms.scrollTop=ms.scrollHeight;
  $('#ci').focus();
  setTimeout(()=>{
    D.chat.push(['ai',aiR(v)]);
    save();
    if(page==='ia'){
      render();
      $('#ci').focus()
    }
  },800);
  return false
}
