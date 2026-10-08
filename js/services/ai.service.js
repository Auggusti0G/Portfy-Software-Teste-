/* =====================================================================
   PORTFY · js/services/ai.service.js
   Camada: Service
   IA simulada. A IA real fica na Edge Function ai-chat
   ===================================================================== */

const aiR=v=>{
  v=v.toLowerCase();
  return /curr[ií]culo|cv/.test(v)?'Para o currículo:\n• Uma página, com objetivo em 2 linhas\n• Resultados com números (ex.: "reduzi o tempo em 30%")\n• Habilidades da vaga logo no topo':/portf[óo]lio|projeto/.test(v)?'No portfólio, mostre de 3 a 5 projetos. Para cada um conte o problema, o que você fez e o resultado. Veja os modelos na aba Modelos.':/entrevista/.test(v)?'Antes da entrevista: pesquise a empresa, prepare duas histórias com resultado e marque o horário na Agenda.':/estud|prova|tempo|rotina/.test(v)?'Estude em blocos de 50 minutos com pausas de 10. Crie uma tarefa por bloco e acompanhe no Início.':'Posso ajudar com currículo, portfólio, entrevistas e rotina de estudos. Sobre qual deles você quer falar?'
};
