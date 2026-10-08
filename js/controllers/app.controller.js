/* =====================================================================
   PORTFY · js/controllers/app.controller.js
   Camada: Controller
   Navegação entre páginas, menu lateral, busca e calendário
   ===================================================================== */

function menu(){
  if(innerWidth>700)document.body.classList.toggle('nc');
  else $('#sb').classList.toggle('on')
}

function go(p,k){
  page=p;
  if(!k)$('#q').value='';
  $('#sb').classList.remove('on');
  $('#nv').innerHTML=NAV.map(n=>`<button class="ni ${n[0]===p?'on':''}" onclick="go('${n[0]}')">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${n[2]}"/>
    </svg>${n[1]}</button>`).join('');
  render();
  scrollTo(0,0)
}

function mon(n){
  cal.setDate(1);
  cal.setMonth(cal.getMonth()+n);
  render()
}

function search(){
  if(!['mod','notas','proj','por'].includes(page))return go('mod',1);
  render()
}

function notif(){
  const n=D.tasks.filter(t=>!t.done&&t.d<=today()).length;
  toast(n?`Você tem ${n} tarefa(s) para hoje ou atrasada(s).`:'Nenhuma tarefa para hoje. Bom trabalho!')
}
