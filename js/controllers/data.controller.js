/* =====================================================================
   PORTFY · js/controllers/data.controller.js
   Camada: Controller
   Ações sobre tarefas, projetos, arquivos, plano, perfil e janelas modais
   ===================================================================== */

function tog(id){
  const t=D.tasks.find(x=>x.id===id);
  t.done=t.done?0:1;
  if(t.done)lg('Tarefa concluída: '+t.t);
  save();
  render()
}

function del(k,id){
  D[k]=D[k].filter(x=>x.id!==id);
  save();
  render();
  toast('Item excluído.')
}

function prog(id,n){
  const p=D.projs.find(x=>x.id===id);
  p.pr=Math.min(100,Math.max(0,p.pr+n));
  if(p.pr===100)lg('Projeto concluído: '+p.t);
  save();
  render()
}

function setPlan(k){
  D.plan=k;
  lg('Plano alterado para '+PL[k][0]);
  save();
  render();
  toast(`Plano ${PL[k][0]} ativado (simulação, sem cobrança).`)
}

function savePf(e){
  e.preventDefault();
  D.prof={role:$('#p1').value.trim(),phone:$('#p2').value.trim(),link:$('#p3').value.trim(),bio:$('#p4').value.trim()};
  lg('Perfil atualizado');
  save();
  render();
  toast('Perfil salvo.');
  return false
}

function okM(e){
  e.preventDefault();
  const v=$('#m1').value.trim(),a=$('#m2')?.value||'',b=$('#m3')?.value||'',id=Date.now();
  if(!v){
    const x=$('#e-m');
    x.textContent='Preencha o título para salvar.';
    x.classList.add('on');
    return false
  }
  if(mk==='file'){
    const doc=mkDoc(a||'portfolio',v);
    D.docs.unshift(doc);
    lg('Novo arquivo criado: '+v);
    save();
    closeM();
    render();
    openEditor(doc.id);
    return false
  }
  if(mk==='task')D.tasks.push({id,t:v,d:a||today(),done:0});
  if(mk==='event'){
    D.events.push({id,t:v,d:a||today(),h:b||'09:00'});
    lg('Compromisso agendado: '+v)
  }
  if(mk==='port'){
    D.ports.push({id,t:v,desc:a});
    lg('Você publicou um novo portfólio: '+v)
  }
  if(mk==='proj'){
    D.projs.push({id,t:v,desc:a,pr:Math.min(100,Math.max(0,+b||0))});
    lg('Novo projeto criado: '+v)
  }
  if(mk==='note'){
    if(mid){
      const n=D.notes.find(x=>x.id===mid);
      n.t=v;
      n.c=a
    }else{
      D.notes.unshift({id,t:v,c:a});
      lg('Nova nota: '+v)
    }
  }
  if(mk==='name'){
    const l=users();
    l.find(x=>x.email===me.email).name=v;
    ls.set('pf_users',l);
    me.name=v;
    $('#u-nm').textContent=v;
    $('#u-av').textContent=$('#u-av2').textContent=ini(v)
  }
  save();
  closeM();
  render();
  toast('Salvo com sucesso.');
  return false
}

function dupDoc(id) {
  const c = JSON.parse(JSON.stringify(D.docs.find(x => x.id === id)));
  c.id = Date.now();
  c.title += ' (cópia)';
  c.upd = Date.now();
  D.docs.unshift(c);
  save();
  render();
  toast('Arquivo duplicado.');
}

function delDoc(id) {
  D.docs = D.docs.filter(x => x.id !== id);
  save();
  render();
  toast('Arquivo excluído.');
}

function useM(n, pl) {
  if (pl === 'Pro' && D.plan === 'A') return toast('Este modelo faz parte do plano Pro. Veja os planos.');
  const m = MODS.find(x => x[0] === n), doc = mkDoc(KIND[m[2]], n, {accent: ACC[n]});
  D.docs.unshift(doc);
  lg('Novo arquivo criado: ' + n);
  save();
  openEditor(doc.id);
}
