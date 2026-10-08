/* =====================================================================
   PORTFY · js/views/modal.view.js
   Camada: View
   Janela modal para criar e editar itens
   ===================================================================== */

let mk='',mid=0;

function openM(k,d,id){
  mk=k;
  mid=id||0;
  const n=id&&D.notes.find(x=>x.id===id),f=(l,i,t='text',v='')=>`<div class="fd">
    <label for="${i}">${l}</label>${t==='ta'?`<textarea class="inp" id="${i}" rows="4">${esc(v)}</textarea>`:`<input class="inp" id="${i}" type="${t}" value="${esc(v)}">`}</div>`, T={task:'Nova tarefa',event:'Novo compromisso',port:'Novo portfólio',name:'Editar nome',proj:'Novo projeto',file:'Novo arquivo',note:n?'Editar nota':'Nova nota'}[k], B={task:f('Título','m1')+f('Data','m2','date',d||today()),event:f('Título','m1')+f('Data','m2','date',d||today())+f('Horário','m3','time','09:00'),file:f('Título','m1')+kindSel(),port:f('Título','m1')+f('Descrição','m2'),name:f('Nome completo','m1','text',me.name),proj:f('Título','m1')+f('Descrição','m2')+f('Progresso (%)','m3','number','0'),note:f('Título','m1','text',n?n.t:'')+f('Conteúdo','m2','ta',n?n.c:'')}[k];
  $('#md').innerHTML=`<h3>${T}</h3>
    <div class="err" id="e-m">
    </div>${B}<div class="ma">
    <button type="button" class="btn" onclick="closeM()">Cancelar</button>
    <button class="btn p" type="submit">Salvar</button>
    </div>`;
  $('#ov').classList.add('on');
  setTimeout(()=>$('#m1').focus(),50)
}

function closeM(){
  $('#ov').classList.remove('on')
}
