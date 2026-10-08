/* =====================================================================
   PORTFY · js/controllers/auth.controller.js
   Camada: Controller
   Cadastro, login, recuperação de senha, diagnóstico e saída
   ===================================================================== */

const pwOk=p=>p.length>=8&&/[A-Z]/.test(p)&&/\d/.test(p);

async function login(e){
  e.preventDefault();
  const em=$('#l-em').value.trim().toLowerCase(),pw=$('#l-pw').value;
  if(!em||!pw)return err('login','Preencha e-mail e senha.'),false;
  const u=users().find(x=>x.email===em);
  if(!u||u.h!==await hash(pw))return err('login','E-mail ou senha incorretos. Confira os dados ou recupere sua senha.'),false;
  ls.set('pf_session',em);
  enter();
  return false
}

async function reg(e){
  e.preventDefault();
  const nm=$('#r-nm').value.trim(),em=$('#r-em').value.trim().toLowerCase(),pw=$('#r-pw').value,cf=$('#r-cf').value;
  if(!nm||!em||!pw||!cf)return err('reg','Preencha todos os campos.'),false;
  if(!/^\S+@\S+\.\S+$/.test(em))return err('reg','Digite um e-mail válido.'),false;
  if(!pwOk(pw))return err('reg','A senha precisa ter 8 ou mais caracteres, uma letra maiúscula e um número.'),false;
  if(pw!==cf)return err('reg','As senhas não coincidem.'),false;
  if(users().some(x=>x.email===em))return err('reg','Este e-mail já tem conta. Entre ou recupere a senha.'),false;
  ls.set('pf_users',[...users(),{name:nm,email:em,h:await hash(pw)}]);
  ls.set('pf_d_'+em,{tasks:[{id:1,t:'Atualizar meu currículo',d:today(),done:0},{id:2,t:'Escolher um modelo de portfólio',d:addD(1),done:0}],events:[{id:1,t:'Reunião de alinhamento',d:addD(1),h:'10:00'}],ports:[{id:1,t:'App Mobile UI/UX',desc:'Design completo para aplicativo de delivery'},{id:2,t:'Sistema de Gestão',desc:'Dashboard com React e Node.js'},{id:3,t:'Data Analytics',desc:'Análise de dados com Python'}],projs:[{id:1,t:'App Mobile',desc:'Protótipo de alta fidelidade',pr:60},{id:2,t:'Portfólio pessoal',desc:'Publicar até sexta',pr:30}],log:[{t:'Conta criada no Portfy',ts:Date.now()}],notif:1,diag:null});
  ls.set('pf_session',em);
  me=users().find(x=>x.email===em);
  auth('diag');
  return false
}

async function forgot(e){
  e.preventDefault();
  const em=$('#f-em').value.trim().toLowerCase(),pw=$('#f-pw').value,cf=$('#f-cf').value;
  if(!em||!pw||!cf)return err('forgot','Preencha todos os campos.'),false;
  if(!pwOk(pw))return err('forgot','A senha precisa ter 8 ou mais caracteres, uma letra maiúscula e um número.'),false;
  if(pw!==cf)return err('forgot','As senhas não coincidem.'),false;
  const l=users(),u=l.find(x=>x.email===em);
  if(!u)return err('forgot','Não encontramos uma conta com este e-mail.'),false;
  u.h=await hash(pw);
  ls.set('pf_users',l);
  ls.set('pf_session',null);
  auth('login');
  toast('Senha alterada. Entre com a nova senha.');
  return false
}

function diag(e){
  e.preventDefault();
  const v=['d1','d2','d3'].map(i=>$('#'+i).value);
  if(v.some(x=>!x))return err('diag','Responda as três perguntas para continuar.'),false;
  D=ls.get('pf_d_'+me.email);
  D.diag=v;
  save();
  enter();
  return false
}

function enter(){
  const em=ls.get('pf_session',null);
  me=users().find(x=>x.email===em);
  if(!me){
    show('land');
    return
  }
  D=Object.assign({tasks:[],events:[],ports:[],notif:1,notes:[],projs:[],plan:'A',prof:{},lang:'Português (Brasil)',priv:'Público',fa:0,log:[],chat:[['ai','Oi! Sou o Agente Portfy. Posso ajudar com currículo, portfólio, entrevistas e rotina de estudos. Por onde começamos?']]},ls.get('pf_d_'+em,{}));
  migrateDocs();
  const ini=me.name.split(' ').filter(Boolean).map(n=>n[0]).join('').slice(0,2).toUpperCase();
  ['#u-av','#u-av2'].forEach(s=>$(s).textContent=ini);
  $('#u-nm').textContent=me.name;
  $('#u-em').textContent=me.email;
  show('app');
  go('dash')
}

function logout(){
  ls.set('pf_session',null);
  me=D=null;
  show('land');
  toast('Você saiu da conta.')
}
