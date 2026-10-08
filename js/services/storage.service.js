/* =====================================================================
   PORTFY · js/services/storage.service.js
   Camada: Service / Persistence
   Armazenamento local (localStorage). No back-end será trocado pelo Supabase
   ===================================================================== */

const M={},ls={get(k,d){
  if(k in M)return M[k];
  try{
    const v=JSON.parse(localStorage.getItem(k));
    return v??d
  }catch(e){
    return d
  }
},set(k,v){
  M[k]=v;
  try{
    localStorage.setItem(k,JSON.stringify(v))
  }catch(e){
  }
}

};

const hash=async s=>{
  try{
    return[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('')
  }catch(e){
    return btoa(s)
  }
};

const save=()=>ls.set('pf_d_'+me.email,D);

const users=()=>ls.get('pf_users',[]);
