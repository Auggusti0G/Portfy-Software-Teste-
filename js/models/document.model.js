/* =====================================================================
   PORTFY · js/models/document.model.js
   Camada: Model
   Regras dos arquivos (currículo, portfólio, projeto) e seus modelos de layout
   ===================================================================== */

/* --- Modelos: cada tipo de arquivo nasce de um layout pronto --- */
function template(kind, o = {}) {
  const A = o.accent || '#0A1A3F', name = o.name || 'Seu Nome', els = [];
  const T = (x, y, w, h, txt, fs, color, fw = 400, ta = 'left', ff = 'Inter') => els.push({k:'text', x, y, w, h, txt, fs, color, fw, ta, ff});
  const R = (x, y, w, h, bg, r = 0) => els.push({k:'rect', x, y, w, h, bg, r});
  let w = 1280, h = 720, bg = '#ffffff';
  if (kind === 'curriculo') {
    w = 794;
    h = 1123;
    R(0, 0, 794, 190, A);
    T(48, 48, 700, 60, name, 40, '#ffffff', 700, 'left', 'Bricolage Grotesque');
    T(48, 114, 700, 30, 'Profissão · Cidade', 18, '#cfdbff');
    T(48, 150, 700, 24, 'email@exemplo.com · (61) 90000-0000 · linkedin.com/in/voce', 13, '#cfdbff');
    [['Resumo', 'Escreva 2 ou 3 linhas sobre quem você é, o que já fez e o que busca.', 230], ['Experiência', 'Empresa · Cargo · 2024 – atual\nDescreva resultados com números.', 360], ['Educação', 'Instituição · Curso · 2022 – 2026', 560], ['Habilidades', 'Figma · React · Python · Comunicação', 700], ['Projetos', 'Nome do projeto: o problema, o que você fez e o resultado.', 820] ].forEach(([t, b, y]) => {
      T(48, y, 700, 26, t.toUpperCase(), 15, A, 700);
      R(48, y + 30, 698, 2, '#DCE3F2');
      T(48, y + 44, 698, 90, b, 14, '#33415f');
    });
  } else if (kind === 'projeto') {
    R(0, 0, 1280, 18, A);
    T(80, 70, 1120, 80, o.heading || 'Título do projeto', 54, A, 700, 'left', 'Bricolage Grotesque');
    T(80, 160, 1000, 40, 'Resumo de uma linha sobre o projeto', 22, '#55627F');
    [['Problema', 80], ['Solução', 460], ['Resultado', 840]].forEach(([t, x]) => {
      R(x, 260, 360, 320, '#EDF1FB', 16);
      T(x + 28, 288, 300, 36, t, 26, A, 700, 'left', 'Bricolage Grotesque');
      T(x + 28, 340, 304, 220, 'Descreva aqui.', 18, '#33415f');
    });
  } else {
    bg = A;
    T(90, 120, 1000, 110, o.heading || name, 84, '#ffffff', 700, 'left', 'Bricolage Grotesque');
    T(90, 250, 900, 60, o.sub || 'Designer · Desenvolvedor · Criador', 28, '#cfdbff');
    R(90, 330, 200, 56, '#ffffff', 28);
    T(90, 344, 200, 30, 'Ver projetos', 18, A, 600, 'center');
    [0, 1, 2].forEach(i => {
      R(90 + i * 370, 450, 340, 190, '#ffffff22', 18);
      T(116 + i * 370, 476, 290, 36, 'Projeto ' + (i + 1), 24, '#ffffff', 700);
      T(116 + i * 370, 524, 290, 90, 'Descrição curta do que você fez.', 16, '#cfdbff');
    });
  }
  return {w, h, bg, els: els.map((e, i) => ({id: i + 1, ...e}))};
}

const modelDoc = m => template(KIND[m[2]], {accent: ACC[m[0]], name: me.name});

function mkDoc(kind, title, o = {}) {
  return {id: Date.now() + Math.floor(Math.random() * 1e4), kind, title, upd: Date.now(), ...template(kind, {name: me.name, ...o})};
}

function migrateDocs() {
  if (D.seeded) return;
  D.docs = D.docs || [];
  (D.ports || []).forEach(p => D.docs.push(mkDoc('portfolio', p.t, {heading: p.t, sub: p.desc, accent: '#2F5BEA'})));
  D.ports = [];
  if (!D.docs.some(d => d.kind === 'curriculo')) D.docs.unshift(mkDoc('curriculo', 'Meu currículo'));
  D.seeded = 1;
  save();
}
