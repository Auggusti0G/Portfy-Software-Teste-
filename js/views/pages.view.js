/* =====================================================================
   PORTFY · js/views/pages.view.js
   Camada: View
   Desenho de todas as páginas do aplicativo
   ===================================================================== */

function render(){
  const q=($('#q').value||'').toLowerCase(),td=today(),pend=D.tasks.filter(t=>!t.done),due=pend.filter(t=>t.d<=td),up=D.events.filter(e=>e.d>=td).sort((a,b)=>(a.d+a.h).localeCompare(b.d+b.h)), ach=[D.tasks.some(t=>t.done),D.docs.length,D.notes.length,D.projs.length,D.events.length,D.prof.bio,D.plan!=='A',D.diag].filter(Boolean).length, ph=(t,b='')=>`<div class="ph"><h2>${t}</h2>${b}</div>`,emp=t=>`<p class="emp">${t}</p>`,btn=(t,k)=>`<button class="btn p" onclick="openM('${k}')">${t}</button>`, logs=n=>D.log.slice(0,n).map(l=>`<div class="ai2"><i>📌</i><span>${esc(l.t)}</span><small>${ago(l.ts)}</small></div>`).join('')||emp('Suas ações vão aparecer aqui.');
  let h='';
  if(page==='dash'){
    const tl=[...D.tasks].sort((a,b)=>a.d.localeCompare(b.d)).slice(0,8).map(t=>`<div class="tk ${t.done?'d':''}">
      <button class="ck ${t.done?'d':''}" onclick="tog(${t.id})" aria-label="Concluir">${t.done?'✓':''}</button>
      <span>${esc(t.t)}</span>
      <small>${lbl(t.d)}</small>
      <button class="x" onclick="del('tasks',${t.id})" aria-label="Excluir">×</button>
      </div>`).join('')||emp('Nenhuma tarefa ainda. Adicione a primeira.');
    h=`${ph(`Olá, ${esc(me.name.split(' ')[0])} 👋`)}<div class="bn">
      <span>✨ Agende uma sessão com o Agente de IA para turbinar seu portfólio</span>
      <button class="btn sm" onclick="go('ia')">Acessar Agente de IA</button>
      </div>
 <div class="gr g4">${[['📁','Projetos em andamento',D.projs.filter(p=>p.pr<100).length],['💼','Portfólios publicados',D.docs.filter(d=>d.kind==='portfolio').length],['✅','Tarefas para hoje',due.length],['🏆','Conquistas desbloqueadas',ach]].map(s=>`<div class="cd st"><div class="si">${s[0]}</div><div><b>${s[2]}</b><span>${s[1]}</span></div></div>`).join('')}</div>
 <div class="gr g2">
      <div>
      <div class="cd cr">
      <div>
      <h3 style="font-size:18px">Seja criativo! 💡</h3>
      <p>Use nossos modelos prontos para criar portfólios incríveis e se destacar no mercado de trabalho.</p>
      <button class="btn sm p" onclick="go('mod')">Explorar modelos</button>
      </div>
      <div class="lap">${LAPTOP}</div>
      </div>
 <div class="cd" style="margin-bottom:16px">
      <h3>Próximas tarefas<span style="display:flex;gap:12px;align-items:center">
      <button class="btn sm" onclick="openM('task')">Nova tarefa</button>
      <a class="lk" href="#" onclick="go('age');return false">Ver todas</a>
      </span>
      </h3>${tl}</div>
 <div class="cd">
      <h3>Atividade recente</h3>${logs(4)}</div>
      </div>
 <div>
      <div class="cd">
      <h3>Plano ${PL[D.plan][0]}</h3>
      <p style="font-size:13px;color:var(--tx2);margin-bottom:14px">Faça upgrade para acessar recursos exclusivos!</p>
      <button class="btn p bl" onclick="go('plan')">Ver planos</button>
      </div>
 <div class="tip">
      <span>🚀</span>
      <div>
      <h4>Dica do dia</h4>
      <p>Mantenha seu portfólio sempre atualizado e destaque suas melhores conquistas!</p>
      </div>
      </div>
      </div>
      </div>`
  }
  if(page==='proj')h=ph('Projetos',btn('Novo projeto','proj'))+`<div class="gr g3">${D.projs.filter(p=>p.t.toLowerCase().includes(q)).map(p=>`<div class="cd"><h3>${esc(p.t)}<button class="x" onclick="del('projs',${p.id})" aria-label="Excluir">×</button></h3><p style="font-size:13px;color:var(--tx2);margin-bottom:14px">${esc(p.desc||'Sem descrição')}</p><div class="pl"><span>${p.pr>=100?'Concluído':'Em andamento'}</span><span>${p.pr}%</span></div><div class="pg"><i style="width:${p.pr}%;animation:none"></i></div><div style="display:flex;gap:8px;margin-top:14px"><button class="btn sm" onclick="prog(${p.id},-10)">−10%</button><button class="btn sm" onclick="prog(${p.id},10)">+10%</button></div></div>`).join('')||emp('Nenhum projeto encontrado. Crie o primeiro.')}</div>`;
  if(page==='mod'){
    const L=MODS.filter(m=>(filt==='todos'||m[2]===filt)&&(m[0]+m[1]).toLowerCase().includes(q));
    h=ph('Modelos')+`<div class="fb">${[['todos','Todos'],['curriculo','Currículo'],['portfolio','Portfólio'],['linkedin','LinkedIn'],['projeto','Projeto']].map(f=>`<button class="${filt===f[0]?'on':''}" onclick="filt='${f[0]}';render()">${f[1]}</button>`).join('')}</div>
      <div class="gr g3">${L.map(m=>`<div class="cd mc"><div class="mt"><div><i></i><i></i><i></i><i></i></div></div><div class="mi"><h4>${m[0]}</h4><p>${m[1]}</p><div style="display:flex;justify-content:space-between;align-items:center"><span class="chip">${m[3]}</span><button class="btn sm p" onclick="useM('${m[0]}','${m[3]}')">Usar modelo</button></div></div></div>`).join('')||emp('Nenhum modelo encontrado para essa busca.')}</div>`
  }
  if(page==='por')h=filesPage(q,ph,btn);
  if(page==='notas')h=ph('Notas',btn('Nova nota','note'))+`<div class="gr g3">${D.notes.filter(n=>(n.t+n.c).toLowerCase().includes(q)).map(n=>`<div class="cd nt"><h4>${esc(n.t)}</h4><p>${esc(n.c||'Sem conteúdo')}</p><div style="display:flex;gap:8px"><button class="btn sm" onclick="openM('note',0,${n.id})">Editar</button><button class="btn sm dg" onclick="del('notes',${n.id})">Excluir</button></div></div>`).join('')||emp('Nenhuma nota. Registre ideias, estudos e lembretes.')}</div>`;
  if(page==='cal'){
    const y=cal.getFullYear(),m=cal.getMonth(),f=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),pv=new Date(y,m,0).getDate(),MN=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    let c=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<small>${d}</small>`).join('');
    for(let i=f-1;i>=0;i--)c+=`<div class="cl o">${pv-i}</div>`;
    for(let d=1;d<=n;d++){
      const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      c+=`<button class="cl ${ds===td?'t':''} ${D.events.some(e=>e.d===ds)?'e':''}" onclick="openM('event','${ds}')">${d}</button>`
    }
    h=ph('Calendário',btn('Novo compromisso','event'))+`<div class="cd">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <button class="btn sm" onclick="mon(-1)" aria-label="Mês anterior">‹</button>
      <h3 style="margin:0;min-width:170px;text-align:center">${MN[m]} ${y}</h3>
      <button class="btn sm" onclick="mon(1)" aria-label="Próximo mês">›</button>
      </div>
      <div class="cal">${c}</div>
      </div>`
  }
  if(page==='age'){
    const all=[...D.events].sort((a,b)=>(a.d+a.h).localeCompare(b.d+b.h));
    h=ph('Agenda',btn('Novo compromisso','event'))+(all.map(e=>`<div class="cd ag">
      <b>${e.h}</b>
      <div style="flex:1">${esc(e.t)}<small>${lbl(e.d)}${e.d<td?' · passou':''}</small>
      </div>
      <button class="x" onclick="del('events',${e.id})" aria-label="Excluir">×</button>
      </div>`).join('')||`<div class="cd">${emp('Sua agenda está vazia. Marque estudos, prazos e entrevistas.')}</div>`)
  }
  if(page==='ia')h=ph('Agente de IA')+`<div class="cd chat">
    <div class="msgs" id="ms">${D.chat.map(m=>`<div class="mg ${m[0]==='me'?'me':''}">${esc(m[1])}</div>`).join('')}</div>
    <form class="cin" onsubmit="return ask(event)">
    <input class="inp" id="ci" placeholder="Pergunte sobre currículo, portfólio ou entrevistas" autocomplete="off">
    <button class="btn p">Enviar</button>
    </form>
    </div>`;
  if(page==='plan')h=ph('Planos')+`<div class="gr g3">${Object.entries(PL).map(([k,p])=>`<div class="cd pcn ${D.plan===k?'hot':''}"><h3>Plano ${k} · ${p[0]}</h3><b>${p[1]}<small style="font:500 14px var(--f2);color:var(--tx2)">/mês</small></b><ul>${p[2].map(i=>`<li>${i}</li>`).join('')}</ul><button class="btn bl ${D.plan===k?'':'p'}" ${D.plan===k?'disabled':''} onclick="setPlan('${k}')">${D.plan===k?'Plano atual':'Assinar '+p[0]}</button></div>`).join('')}</div>`;
  if(page==='perf'){
    const P=D.prof,fl=(l,i,v,t='text')=>`<div class="fd">
      <label for="${i}">${l}</label>
      <input class="inp" id="${i}" type="${t}" value="${esc(v||'')}">
      </div>`;
    h=ph('Perfil')+`<div class="pf">
      <div class="cd" style="text-align:center">
      <div class="av">${ini(me.name)}</div>
      <h3 style="justify-content:center">${esc(me.name)}</h3>
      <p style="color:var(--tx2);font-size:14px">${esc(P.role||'Sua profissão')}</p>
      <p style="color:var(--tx2);font-size:13px">${esc(me.email)}</p>
      </div>
      <form class="cd" onsubmit="return savePf(event)">
      <h3>Informações públicas</h3>${fl('Profissão','p1',P.role)}${fl('Telefone','p2',P.phone,'tel')}${fl('Link do portfólio','p3',P.link,'url')}<div class="fd">
      <label for="p4">Biografia</label>
      <textarea class="inp" id="p4" rows="4" maxlength="500">${esc(P.bio||'')}</textarea>
      </div>
      <button class="btn p">Salvar perfil</button>
      </form>
      </div>
      <div class="cd" style="margin-top:16px">
      <h3>Linha do tempo</h3>${logs(20)}</div>`
  }
  if(page==='cfg'){
    const sel=(k,o)=>`<select class="inp" style="width:auto" onchange="D.${k}=this.value;save();toast('Preferência salva.')">${o.map(x=>`<option ${D[k]===x?'selected':''}>${x}</option>`).join('')}</select>`,tg=(on,fn,l)=>`<button class="tg ${on?'on':''}" onclick="${fn}" aria-label="${l}"></button>`;
    h=ph('Configurações')+`<div class="gr" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
      <div class="cd">
      <h3>Conta</h3>
      <div class="sr2">
      <div>Nome<small>${esc(me.name)}</small>
      </div>
      <button class="btn sm" onclick="openM('name')">Editar</button>
      </div>
      <div class="sr2">
      <div>E-mail<small>${esc(me.email)}</small>
      </div>
      </div>
      <div class="sr2">
      <div>Sair da conta<small>Encerrar a sessão neste dispositivo</small>
      </div>
      <button class="btn sm dg" onclick="logout()">Sair</button>
      </div>
      </div>
  <div class="cd">
      <h3>Aparência e preferências</h3>
      <div class="sr2">
      <div>Modo escuro<small>Alternar o tema da interface</small>
      </div>${tg(isDark(),'theme()','Modo escuro')}</div>
      <div class="sr2">
      <div>Notificações por e-mail<small>Receber lembretes de tarefas</small>
      </div>${tg(D.notif,"D.notif=D.notif?0:1;save();render();toast('Preferência salva.')",'Notificações')}</div>
      <div class="sr2">
      <div>Idioma<small>Idioma da interface</small>
      </div>${sel('lang',['Português (Brasil)','English','Español'])}</div>
      <div class="sr2">
      <div>Privacidade do perfil<small>Quem pode ver seu portfólio</small>
      </div>${sel('priv',['Público','Somente com link','Privado'])}</div>
      </div>
  <div class="cd">
      <h3>Segurança</h3>
      <div class="sr2">
      <div>Autenticação de dois fatores<small>Código por e-mail ao entrar (opcional)</small>
      </div>${tg(D.fa,"D.fa=D.fa?0:1;save();render();toast(D.fa?'2FA ativado.':'2FA desativado.')",'2FA')}</div>
      <div class="sr2">
      <div>Alterar senha<small>Defina uma nova senha</small>
      </div>
      <button class="btn sm" onclick="auth('forgot')">Alterar</button>
      </div>
      </div>
      </div>`
  }
  $('#pc').innerHTML=`<section>${h}</section>`;
  fitThumbs();
  if(page==='ia'){
    const m=$('#ms');
    m.scrollTop=m.scrollHeight
  }
}

const LAPTOP = `<svg viewBox="0 0 360 236" role="img" aria-label="Notebook mostrando o painel do Portfy, com uma planta e uma xícara de café">
  <defs>
    <linearGradient id="lpBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F8FB"/><stop offset=".6" stop-color="#D6DBE5"/><stop offset="1" stop-color="#A7AFC0"/></linearGradient>
    <linearGradient id="lpDeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4E8EF"/><stop offset="1" stop-color="#C6CCD8"/></linearGradient>
    <linearGradient id="lpBezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3452"/><stop offset="1" stop-color="#0E1325"/></linearGradient>
    <linearGradient id="lpBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4C86FF"/><stop offset="1" stop-color="#2352E8"/></linearGradient>
    <linearGradient id="lpGlare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="lpLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FE0B5"/><stop offset="1" stop-color="#139E83"/></linearGradient>
    <linearGradient id="lpCup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9EDF4"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#D5DBE6"/></linearGradient>
    <pattern id="lpKeys" width="13" height="5" patternUnits="userSpaceOnUse"><rect x="1" y=".8" width="11" height="3.4" rx="1" fill="#2D3548"/></pattern>
    <clipPath id="lpClip"><rect x="76" y="20" width="208" height="128" rx="3"/></clipPath>
    <filter id="lpBlur"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <ellipse cx="180" cy="212" rx="170" ry="11" fill="#000" opacity=".3" filter="url(#lpBlur)"/>
  <rect x="322" y="170" width="28" height="34" rx="5" fill="#F1F3F8"/><rect x="322" y="170" width="28" height="7" rx="3" fill="#DDE2EC"/>
  <path d="M336 170C322 158 322 138 336 120c14 18 14 38 0 50z" fill="url(#lpLeaf)"/>
  <path d="M336 172c12-8 24-8 22-22-14 0-24 8-22 22z" fill="#17A98B"/>
  <path d="M336 172c-12-7-22-6-26-19 13-1 24 7 26 19z" fill="#32D1AA"/>
  <path d="M336 168V128" stroke="#0E7F69" stroke-width="1" opacity=".5"/>
  <rect x="66" y="10" width="228" height="148" rx="12" fill="url(#lpBezel)" stroke="#4A5473" stroke-width=".8"/>
  <circle cx="180" cy="15" r="1.6" fill="#59638A"/>
  <rect x="76" y="20" width="208" height="128" rx="3" fill="#fff"/>
  <g clip-path="url(#lpClip)">
    <rect x="76" y="20" width="208" height="12" fill="#F2F5FB"/><circle cx="84" cy="26" r="2" fill="#FF6B6B"/><circle cx="91" cy="26" r="2" fill="#FFC145"/><circle cx="98" cy="26" r="2" fill="#3DDC97"/>
    <rect x="200" y="23" width="70" height="6" rx="3" fill="#E1E7F3"/>
    <rect x="76" y="32" width="34" height="116" fill="#F7F9FD"/>
    <rect x="82" y="40" width="22" height="4" rx="2" fill="#2F6BFF"/><rect x="82" y="50" width="18" height="3" rx="1.5" fill="#CBD5E8"/><rect x="82" y="58" width="20" height="3" rx="1.5" fill="#CBD5E8"/><rect x="82" y="66" width="14" height="3" rx="1.5" fill="#CBD5E8"/>
    <rect x="118" y="40" width="100" height="40" rx="6" fill="url(#lpBlue)"/><rect x="127" y="50" width="42" height="4" rx="2" fill="#fff"/><rect x="127" y="60" width="62" height="3" rx="1.5" fill="#BCD0FF"/><rect x="127" y="67" width="40" height="3" rx="1.5" fill="#BCD0FF"/>
    <rect x="118" y="90" width="32" height="32" rx="7" fill="#2EC4B6"/><rect x="125" y="99" width="18" height="3" rx="1.5" fill="#fff"/><rect x="125" y="106" width="12" height="3" rx="1.5" fill="#CFF5F0"/>
    <rect x="160" y="108" width="7" height="14" fill="#7FA2FF"/><rect x="171" y="98" width="7" height="24" fill="#2F6BFF"/><rect x="182" y="112" width="7" height="10" fill="#7FA2FF"/>
    <rect x="228" y="48" width="9" height="14" rx="1" fill="#2F6BFF"/><rect x="241" y="40" width="9" height="22" rx="1" fill="#2F6BFF"/><rect x="254" y="32" width="9" height="30" rx="1" fill="#2F6BFF"/>
    <circle cx="250" cy="100" r="16" fill="#2F6BFF"/><path d="M250 100V84a16 16 0 0 1 16 16z" fill="#fff"/>
    <rect x="118" y="130" width="130" height="3" rx="1.5" fill="#E1E7F3"/><rect x="118" y="137" width="88" height="3" rx="1.5" fill="#E1E7F3"/>
    <polygon points="76,20 186,20 128,148 76,148" fill="url(#lpGlare)"/>
  </g>
  <rect x="128" y="157" width="104" height="4" rx="2" fill="#8892A7"/>
  <path d="M66 160H294L330 190H30Z" fill="url(#lpDeck)"/>
  <polygon points="94,164 266,164 290,180 70,180" fill="#1F2638" opacity=".92"/>
  <polygon points="94,164 266,164 290,180 70,180" fill="url(#lpKeys)"/>
  <polygon points="154,183 206,183 210,188 150,188" fill="#CDD3DF" stroke="#B3BBCB" stroke-width=".6"/>
  <path d="M30 190H330a3 3 0 0 1 2.9 3.6c-.7 3.2-3 4.4-6.4 4.4H33.5c-3.4 0-5.7-1.2-6.4-4.4A3 3 0 0 1 30 190z" fill="url(#lpBody)"/>
  <path d="M158 190h44v3a5 5 0 0 1-5 3h-34a5 5 0 0 1-5-3z" fill="#98A1B4"/>
  <ellipse cx="288" cy="214" rx="32" ry="7" fill="#EEF1F7"/><ellipse cx="288" cy="213" rx="22" ry="4.5" fill="#DDE2EC"/>
  <path d="M272 192h32v9a16 13 0 0 1-32 0z" fill="url(#lpCup)"/>
  <path d="M304 195h5a5.5 5.5 0 0 1 0 11h-6.5" fill="none" stroke="#E3E8F1" stroke-width="3"/>
  <ellipse cx="288" cy="193" rx="16" ry="4" fill="#5B3A29"/><ellipse cx="285" cy="192.5" rx="7" ry="1.6" fill="#8A5A3F" opacity=".7"/>
  <path d="M281 186c-4-5 4-8 0-14M290 186c-4-5 4-8 0-14" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>
</svg>`;

const kindSel = () => `<div class="fd">
  <label for="m2">Tipo de arquivo</label>
  <select class="inp" id="m2">
  <option value="portfolio">Portfólio</option>
  <option value="curriculo">Currículo</option>
  <option value="projeto">Projeto</option>
  </select>
  </div>`;

/* --- Miniaturas reais dos arquivos --- */
function elHTML(e, edit) {
  const sel = edit && Ed.sel === e.id;
  let css = `left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;`, inner = '';
  if (e.k === 'text') {
    css += `font:${e.fw} ${e.fs}px/1.3 '${e.ff}',sans-serif;color:${e.color};text-align:${e.ta};`;
    inner = esc(e.txt);
  } else if (e.k === 'img') {
    inner = `<img src="${e.src}" alt="">`;
  } else {
    css += `background:${e.bg};border-radius:${e.k === 'ellipse' ? '50%' : (e.r || 0) + 'px'};`;
  }
  return `<div class="el ${sel ? 'sel' : ''}" data-id="${e.id}" style="${css}">${inner}${sel ? '<i class="hd"></i>' : ''}</div>`;
}

function thumb(doc) {
  return `<div class="th2" data-w="${doc.w}" style="--ar:${doc.w / doc.h}">
    <div class="th2-in" style="width:${doc.w}px;height:${doc.h}px;background:${doc.bg}">${doc.els.map(e => elHTML(e)).join('')}</div>
    </div>`;
}

/* --- Página "Meus arquivos" --- */
function filesPage(q, ph, btn) {
  const L = D.docs.filter(d => (fk === 'todos' || d.kind === fk) && d.title.toLowerCase().includes(q));
  const chips = [['todos', 'Todos'], ['curriculo', 'Currículos'], ['portfolio', 'Portfólios'], ['projeto', 'Projetos']]
    .map(f => `<button class="${fk === f[0] ? 'on' : ''}" onclick="fk='${f[0]}';render()">${f[1]}</button>`).join('');
  const cards = L.map(d => `<div class="cd mc fc">
      <div class="cv" role="button" tabindex="0" onclick="openEditor(${d.id})" aria-label="Abrir ${esc(d.title)}" style="background:${COV[d.id % 3]}"><span class="kd">${KIND_LABEL[d.kind]}</span></div>
      <div class="mi">
        <h4>${esc(d.title)}</h4>
        <p>Editado ${ago(d.upd)}</p>
        <div class="row2">
          <button class="btn sm p" onclick="openEditor(${d.id})">Abrir</button>
          <button class="btn sm" onclick="dupDoc(${d.id})">Duplicar</button>
          <button class="btn sm dg" onclick="delDoc(${d.id})">Excluir</button>
        </div>
      </div>
    </div>`).join('');
  return ph('Meus arquivos', btn('Novo arquivo', 'file'))
    + `<div class="fb">${chips}</div><div class="gr g3">${cards}<button class="cd addc" onclick="openM('file')">+ Adicionar arquivo</button></div>`;
}
