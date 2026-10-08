/* =====================================================================
   PORTFY · js/views/ui.view.js
   Camada: View
   Elementos de interface: avisos, troca de telas, tema e mensagens de erro
   ===================================================================== */

function toast(m){
  const t=$('#ts');
  t.textContent=m;
  t.classList.add('on');
  clearTimeout(tm);
  tm=setTimeout(()=>t.classList.remove('on'),2800)
}

function show(id){
  $$('.scr').forEach(s=>s.classList.remove('on'));
  $('#'+id).classList.add('on');
  scrollTo(0,0)
}

function auth(t){
  show('auth');
  $$('.ac').forEach(c=>c.classList.toggle('on',c.id==='a-'+t));
  $$('.err').forEach(e=>e.classList.remove('on'))
}

function err(id,m){
  const e=$('#e-'+id);
  e.textContent=m;
  e.classList.add('on')
}

function eye(id){
  const i=$('#'+id);
  i.type=i.type==='password'?'text':'password'
}

function rule(){
  const h=$('#r-h'),ok=pwOk($('#r-pw').value);
  h.classList.toggle('ok',ok);
  h.textContent=ok?'Senha forte.':'Use 8 ou mais caracteres, com uma letra maiúscula e um número.'
}

function stp(){
  const n=['d1','d2','d3'].filter(i=>$('#'+i).value).length;
  $('#s2').classList.toggle('on',n>=1);
  $('#s3').classList.toggle('on',n>=2)
}

function theme(){
  const r=document.documentElement,dk=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  r.dataset.theme=dk?'light':'dark';
  ls.set('pf_theme',r.dataset.theme);
  if(page==='cfg'&&me)render()
}

const isDark=()=>{
  const t=document.documentElement.dataset.theme;
  return t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches
};

function fitThumbs() {
  $$('.th2').forEach(t => {
    t.firstChild.style.transform = `scale(${t.clientWidth / +t.dataset.w})`;
  });
}
