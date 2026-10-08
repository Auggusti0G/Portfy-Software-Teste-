/* =====================================================================
   PORTFY · js/models/constants.js
   Camada: Model
   Catálogos fixos: menu, planos, modelos, fontes e cores
   ===================================================================== */

const GEAR='M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z';

const NAV=[['dash','Início','M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'],['proj','Projetos','M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'],['mod','Modelos','M2 3h20v14H2zM8 21h8M12 17v4'],['por','Meus arquivos','M2 7h20v14H2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'],['notas','Notas','M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6M8 13h8M8 17h5'],['cal','Calendário','M3 4h18v18H3zM16 2v4M8 2v4M3 10h18'],['age','Agenda','M12 6v6l4 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'],['ia','Agente de IA','M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'],['plan','Planos','M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z'],['perf','Perfil','M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],['cfg','Configurações',GEAR]];

const PL={A:['Gratuito','R$ 0',['Modelos gratuitos','Agenda e tarefas','Notas e projetos']],B:['Pro','R$ 29',['Tudo do plano Gratuito','Modelos Pro','Agente de IA ampliado']],C:['Premium','R$ 59',['Tudo do plano Pro','Suporte prioritário','Exportação sem marca']]};

const MODS=[['Currículo Profissional','Limpo e objetivo para o mercado tradicional','curriculo','Gratuito'],['Portfólio Criativo','Destaque seus projetos com visual impactante','portfolio','Gratuito'],['Perfil LinkedIn','Otimize seu perfil para recrutadores','linkedin','Gratuito'],['Case de Projeto','Documente um projeto de ponta a ponta','projeto','Pro'],['Currículo Moderno','Design contemporâneo para áreas criativas','curriculo','Pro'],['Portfólio Tech','Ideal para desenvolvedores e engenheiros','portfolio','Pro']];

const COV=['linear-gradient(135deg,#2F5BEA,#0A1A3F)','linear-gradient(135deg,#6C93FF,#2F5BEA)','linear-gradient(135deg,#0A1A3F,#355f94)'];

const ACC = {'Currículo Profissional':'#0A1A3F','Portfólio Criativo':'#2F5BEA','Perfil LinkedIn':'#1F44C9','Case de Projeto':'#0A1A3F','Currículo Moderno':'#3A5BD9','Portfólio Tech':'#101B3D'};

const KIND = {curriculo:'curriculo', portfolio:'portfolio', linkedin:'portfolio', projeto:'projeto'};

const KIND_LABEL = {curriculo:'Currículo', portfolio:'Portfólio', projeto:'Projeto'};

const FONTS = ['Inter', 'Bricolage Grotesque', 'Georgia', 'Courier New'];
