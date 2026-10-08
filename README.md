# Portfy

Plataforma para organizar a carreira: currículos, portfólios, agenda, notas e Agente de IA.

## Estrutura (MVC)

```
portfy-mvc/
├── index.html                 View: esqueleto das telas
├── css/                       View: estilos (base, landing, auth, app)
├── js/
│   ├── config.js              Configuração (chaves públicas do Supabase)
│   ├── utils.js               Funções utilitárias
│   ├── models/                Model: estado, catálogos e regras dos arquivos
│   ├── services/              Persistência e serviços (localStorage, Supabase, IA)
│   ├── views/                 View: desenho das páginas, modais e editor
│   ├── controllers/           Controller: ações do usuário
│   └── main.js                Inicialização
├── supabase/
│   ├── migrations/            Persistence: tabelas, segurança (RLS), funções
│   └── functions/
│       ├── _shared/           Código compartilhado (serviço de IA, repositório, prompt)
│       └── ai-chat/           Controller da API de IA
└── docs/                      Documentação
```

## Rodar no computador

Abra a pasta no VS Code e use a extensão Live Server (botão Go Live). Não abra o index.html com duplo clique, porque alguns recursos exigem um servidor local.
Alternativa: `npx serve .` dentro da pasta.

## Modo local x Supabase

Com `js/config.js` vazio, o site funciona com localStorage (demonstração).
Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` para conectar ao banco real. Veja o guia de integração.

## Segurança

Nunca versione chaves secretas (service_role, chave da IA). Elas ficam somente nos secrets do Supabase.
