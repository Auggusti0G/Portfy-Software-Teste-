/* =====================================================================
   PORTFY · js/controllers/editor.controller.js
   Camada: Controller
   Lógica do editor: adicionar, mover, redimensionar, salvar e atalhos
   ===================================================================== */

/* --- Editor visual --- */
const Ed = {doc: null, sel: null, scale: 1, op: null, timer: null};

const edEl = () => Ed.doc && Ed.doc.els.find(e => e.id === Ed.sel);

const edNextId = () => Math.max(0, ...Ed.doc.els.map(e => e.id)) + 1;

function openEditor(id) {
  const d = D.docs.find(x => x.id === id);
  if (!d) return;
  Ed.doc = d;
  Ed.sel = null;
  $('#ed-title').value = d.title;
  $('#ed-st').textContent = 'Salvo';
  $('#ed').classList.add('on');
  document.body.style.overflow = 'hidden';
  edFit();
  edProps();
}

function closeEditor() {
  clearTimeout(Ed.timer);
  edFlush();
  $('#ed').classList.remove('on');
  document.body.style.overflow = '';
  Ed.doc = null;
  Ed.sel = null;
  render();
}

function edSelect(id) {
  Ed.sel = id;
  edRender();
  edProps();
}

function edSet(k, v) {
  const e = edEl();
  if (!e) return;
  e[k] = v;
  edRender();
  edSave();
}

function edAdd(k) {
  const id = edNextId(), b = {id, x: Ed.doc.w / 2 - 150, y: Ed.doc.h / 2 - 60};
  Ed.doc.els.push({ text: {...b, k: 'text', w: 300, h: 60, txt: 'Novo texto', fs: 32, color: '#0A1A3F', fw: 600, ta: 'left', ff: 'Inter'}, rect: {...b, k: 'rect', w: 240, h: 140, bg: '#2F5BEA', r: 12}, ellipse: {...b, k: 'ellipse', w: 160, h: 160, bg: '#2EC4B6'} }[k]);
  edSelect(id);
  edSave();
}

function edImage(inp) {
  const f = inp.files[0];
  if (!f) return;
  if (f.size > 1.5e6) {
    inp.value = '';
    return toast('Use uma imagem de até 1,5 MB.');
  }
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(400, img.width), id = edNextId();
      Ed.doc.els.push({id, k: 'img', x: 100, y: 100, w, h: Math.round(w * img.height / img.width), src: r.result});
      edSelect(id);
      edSave();
    };
    img.src = r.result;
  };
  r.readAsDataURL(f);
  inp.value = '';
}

function edDup() {
  const e = edEl();
  if (!e) return;
  const c = {...e, id: edNextId(), x: e.x + 24, y: e.y + 24};
  Ed.doc.els.push(c);
  edSelect(c.id);
  edSave();
}

function edDel() {
  Ed.doc.els = Ed.doc.els.filter(e => e.id !== Ed.sel);
  Ed.sel = null;
  edRender();
  edProps();
  edSave();
}

function edOrder(n) {
  const a = Ed.doc.els, i = a.findIndex(e => e.id === Ed.sel), j = i + n;
  if (j < 0 || j >= a.length) return;
  [a[i], a[j]] = [a[j], a[i]];
  edRender();
  edSave();
}

function edSave() {
  $('#ed-st').textContent = 'Salvando…';
  clearTimeout(Ed.timer);
  Ed.timer = setTimeout(edFlush, 400);
}

function edFlush() {
  if (!Ed.doc) return;
  Ed.doc.upd = Date.now();
  save();
  $('#ed-st').textContent = 'Salvo';
}

/* --- Interação: arrastar, redimensionar, editar texto, teclado --- */
$('#ed-page').addEventListener('pointerdown', ev => {
  if (ev.target.isContentEditable) return;
  const t = ev.target.closest('.el');
  if (!t) {
    Ed.sel = null;
    edRender();
    edProps();
    return;
  }
  const id = +t.dataset.id, size = ev.target.classList.contains('hd');
  if (Ed.sel !== id) edSelect(id);
  const e = edEl();
  Ed.op = {type: size ? 'size' : 'move', x: ev.clientX, y: ev.clientY, ox: e.x, oy: e.y, ow: e.w, oh: e.h};
  ev.preventDefault();
});

document.addEventListener('pointermove', ev => {
  const o = Ed.op;
  if (!o) return;
  const e = edEl(), dx = (ev.clientX - o.x) / Ed.scale, dy = (ev.clientY - o.y) / Ed.scale;
  if (o.type === 'move') {
    e.x = Math.round(o.ox + dx);
    e.y = Math.round(o.oy + dy);
  } else {
    e.w = Math.max(20, Math.round(o.ow + dx));
    e.h = Math.max(20, Math.round(o.oh + dy));
  }
  const n = $(`#ed-page [data-id="${e.id}"]`);
  n.style.left = e.x + 'px';
  n.style.top = e.y + 'px';
  n.style.width = e.w + 'px';
  n.style.height = e.h + 'px';
});

document.addEventListener('pointerup', () => {
  if (Ed.op) {
    Ed.op = null;
    edSave();
  }
});

$('#ed-page').addEventListener('dblclick', ev => {
  const t = ev.target.closest('.el'), e = t && Ed.doc.els.find(x => x.id === +t.dataset.id);
  if (!e || e.k !== 'text') return;
  t.contentEditable = 'true';
  t.focus();
  getSelection().selectAllChildren(t);
  t.addEventListener('blur', () => {
    e.txt = t.innerText;
    t.contentEditable = 'false';
    edSave();
    edRender();
  }, {once: true});
});

document.addEventListener('keydown', ev => {
  if (!Ed.doc || ev.target.closest('input,select,textarea,[contenteditable="true"]')) return;
  const e = edEl();
  if (!e) return;
  const s = ev.shiftKey ? 10 : 1, m = {ArrowLeft: ['x', -s], ArrowRight: ['x', s], ArrowUp: ['y', -s], ArrowDown: ['y', s]}[ev.key];
  if (m) {
    e[m[0]] += m[1];
    edRender();
    edSave();
    ev.preventDefault();
  } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
    edDel();
    ev.preventDefault();
  }
});

addEventListener('resize', () => {
  if (Ed.doc) edFit();
});
