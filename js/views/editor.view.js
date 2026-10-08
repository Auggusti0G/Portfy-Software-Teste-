/* =====================================================================
   PORTFY · js/views/editor.view.js
   Camada: View
   Desenho do editor visual (tela, painel de propriedades e ajuste de zoom)
   ===================================================================== */

function edFit() {
  const d = Ed.doc, st = $('#ed-stage');
  if (!d) return;
  Ed.scale = Math.min((st.clientWidth - 48) / d.w, (st.clientHeight - 48) / d.h, 1);
  const w = $('#ed-wrap');
  w.style.width = d.w * Ed.scale + 'px';
  w.style.height = d.h * Ed.scale + 'px';
  edRender();
}

function edRender() {
  const d = Ed.doc, pg = $('#ed-page');
  pg.style.cssText = `width:${d.w}px;height:${d.h}px;background:${d.bg};transform:scale(${Ed.scale})`;
  pg.innerHTML = d.els.map(e => elHTML(e, true)).join('');
  $('#pgsz').textContent = `@page{size:${d.w}px ${d.h}px;margin:0}`;
}

function edProps() {
  const e = edEl(), d = Ed.doc;
  const row = (l, c) => `<div class="pr"><label>${l}</label>${c}</div>`;
  const col = (k, v) => `<input type="color" value="${v.slice(0, 7)}" oninput="edSet('${k}',this.value)">`;
  let h = '';
  if (!e) {
    h = row('Cor de fundo da página', `<input type="color" value="${d.bg.slice(0, 7)}" oninput="Ed.doc.bg=this.value;edRender();edSave()">`) + '<p class="hint">Clique em um elemento para editar. Dê dois cliques em um texto para digitar. Arraste o canto azul para redimensionar.</p>';
  } else {
    if (e.k === 'text') {
      h += row('Fonte', `<select class="inp" onchange="edSet('ff',this.value)">${FONTS.map(f => `<option ${f === e.ff ? 'selected' : ''}>${f}</option>`).join('')}</select>`) + row('Tamanho', `<input class="inp" type="number" min="8" max="200" value="${e.fs}" onchange="edSet('fs',+this.value)">`) + row('Cor do texto', col('color', e.color)) + row('Estilo', `<div class="seg">
        <button onclick="edSet('fw',${e.fw >= 700 ? 400 : 700})">Negrito</button>
        <button onclick="edSet('ta','left')">Esq.</button>
        <button onclick="edSet('ta','center')">Centro</button>
        <button onclick="edSet('ta','right')">Dir.</button>
        </div>`);
    }
    if (e.k === 'rect' || e.k === 'ellipse') {
      h += row('Preenchimento', col('bg', e.bg));
      if (e.k === 'rect') h += row('Arredondamento', `<input type="range" min="0" max="120" value="${e.r || 0}" oninput="edSet('r',+this.value)">`);
    }
    h += '<div class="seg col"><button onclick="edDup()">Duplicar</button><button onclick="edOrder(1)">Trazer para frente</button><button onclick="edOrder(-1)">Enviar para trás</button><button class="dg" onclick="edDel()">Excluir</button></div>';
  }
  $('#ed-props').innerHTML = `<h4>${e ? 'Propriedades' : 'Página'}</h4>` + h;
}
