/* =====================================================================
   PORTFY · js/models/activity.model.js
   Camada: Model
   Registro da linha do tempo de atividades
   ===================================================================== */

const lg=t=>{
  D.log.unshift({t,ts:Date.now()});
  D.log=D.log.slice(0,20)
};
