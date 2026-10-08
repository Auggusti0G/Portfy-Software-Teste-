/* =====================================================================
   PORTFY · portfy-api.js
   Camada única de acesso ao Supabase. O front-end chama estas funções
   no lugar do localStorage. Os dados voltam no MESMO formato que o
   objeto D já usa (tasks, events, notes, projs, docs, prof...).

   Antes deste arquivo, carregue a biblioteca do Supabase:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="portfy-api.js"></script>
   ===================================================================== */
const PortfyAPI = (() => {
  let sb = null;

  const db = () => {
    if (!sb) throw new Error('Chame PortfyAPI.init(url, chave) antes de usar a API.');
    return sb;
  };
  const ok = ({ data, error }) => { if (error) throw error; return data; };
  const uid = async () => (await db().auth.getUser()).data.user.id;

  /* Tradução entre o que o banco guarda e o que o front mostra */
  const LANG = { 'pt-BR': 'Português (Brasil)', en: 'English', es: 'Español' };
  const PRIV = { public: 'Público', link: 'Somente com link', private: 'Privado' };
  const invert = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));

  /* Conversores: formato do front <-> colunas do banco */
  const MAP = {
    tasks: {
      to:   (t) => ({ title: t.t, due_date: t.d, done: !!t.done }),
      from: (r) => ({ id: r.id, t: r.title, d: r.due_date, done: r.done ? 1 : 0 }),
    },
    events: {
      to:   (e) => ({ title: e.t, event_date: e.d, event_time: e.h }),
      from: (r) => ({ id: r.id, t: r.title, d: r.event_date, h: String(r.event_time).slice(0, 5) }),
    },
    notes: {
      to:   (n) => ({ title: n.t, content: n.c }),
      from: (r) => ({ id: r.id, t: r.title, c: r.content }),
    },
    projects: {
      to:   (p) => ({ title: p.t, description: p.desc, progress: p.pr }),
      from: (r) => ({ id: r.id, t: r.title, desc: r.description, pr: r.progress }),
    },
    documents: {
      to:   (d) => ({ kind: d.kind, title: d.title, width: d.w, height: d.h, background: d.bg, elements: d.els }),
      from: (r) => ({ id: r.id, kind: r.kind, title: r.title, w: r.width, h: r.height, bg: r.background, els: r.elements, upd: Date.parse(r.updated_at) }),
    },
  };

  /* CRUD genérico: add / update / remove para cada tabela */
  const crud = (table) => ({
    async add(item)       { return MAP[table].from(ok(await db().from(table).insert(MAP[table].to(item)).select().single())); },
    async update(id, item) { return MAP[table].from(ok(await db().from(table).update(MAP[table].to(item)).eq('id', id).select().single())); },
    async remove(id)      { ok(await db().from(table).delete().eq('id', id)); },
  });

  /* Mensagens de erro em português */
  const friendly = (err) => {
    const m = String(err?.message || err);
    if (/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
    if (/Email not confirmed/i.test(m)) return 'Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.';
    if (/already registered|already been registered/i.test(m)) return 'Este e-mail já tem conta. Entre ou recupere a senha.';
    if (/Password should be|weak/i.test(m)) return 'A senha precisa ter 8 ou mais caracteres, uma letra maiúscula e um número.';
    if (/rate limit|too many/i.test(m)) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
    if (/Failed to fetch|NetworkError/i.test(m)) return 'Sem conexão com o servidor. Verifique sua internet.';
    return m;
  };

  return {
    friendly,

    /** Inicia o cliente. Use a URL do projeto e a chave pública (anon / publishable). */
    init(url, publicKey) {
      sb = window.supabase.createClient(url, publicKey);
      return sb;
    },
    get client() { return db(); },

    /* ------------------------- Autenticação ------------------------- */
    async signUp(name, email, password) {
      const { data, error } = await db().auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      return data;                       // data.session = null se a confirmação por e-mail estiver ligada
    },
    async signIn(email, password) {
      return ok(await db().auth.signInWithPassword({ email, password }));
    },
    async signOut() { ok(await db().auth.signOut()); },
    async session() { return (await db().auth.getSession()).data.session; },
    onAuth(callback) { return db().auth.onAuthStateChange((event, session) => callback(event, session)); },
    async requestReset(email, redirectTo) {
      ok(await db().auth.resetPasswordForEmail(email, { redirectTo }));
    },
    async setNewPassword(password) { ok(await db().auth.updateUser({ password })); },

    /* ------------------- Carregar tudo ao entrar --------------------- */
    /** Devolve um objeto no formato do D atual do front-end. */
    async load() {
      const id = await uid();
      const [prof, set, sub, diag, tasks, events, notes, projs, docs, log, msgs] = await Promise.all([
        db().from('profiles').select('*').eq('id', id).single(),
        db().from('user_settings').select('*').eq('user_id', id).single(),
        db().from('subscriptions').select('plan_code').eq('user_id', id).single(),
        db().from('diagnostics').select('*').eq('user_id', id).maybeSingle(),
        db().from('tasks').select('*').order('due_date'),
        db().from('events').select('*').order('event_date').order('event_time'),
        db().from('notes').select('*').order('updated_at', { ascending: false }),
        db().from('projects').select('*').order('created_at', { ascending: false }),
        db().from('documents').select('*').order('updated_at', { ascending: false }),
        db().from('activity_log').select('message, created_at').order('created_at', { ascending: false }).limit(20),
        db().from('ai_messages').select('conversation_id, role, content').order('created_at', { ascending: false }).limit(40),
      ]);
      const p = ok(prof), s = ok(set), d = ok(diag), chatRows = ok(msgs).reverse();
      return {
        name: p.full_name, email: p.email,
        prof: { role: p.profession || '', phone: p.phone || '', link: p.portfolio_url || '', bio: p.bio || '' },
        lang: LANG[s.language], priv: PRIV[s.privacy], notif: s.email_notifications ? 1 : 0, fa: s.two_factor_enabled ? 1 : 0,
        plan: ok(sub).plan_code,
        diag: d ? [d.study_hours, d.academic_phase, d.target_market] : null,
        tasks: ok(tasks).map(MAP.tasks.from), events: ok(events).map(MAP.events.from),
        notes: ok(notes).map(MAP.notes.from), projs: ok(projs).map(MAP.projects.from),
        docs: ok(docs).map(MAP.documents.from),
        log: ok(log).map((r) => ({ t: r.message, ts: Date.parse(r.created_at) })),
        chat: chatRows.length ? chatRows.map((r) => [r.role === 'user' ? 'me' : 'ai', r.content])
                              : [['ai', 'Oi! Sou o Agente Portfy. Posso ajudar com currículo, portfólio, entrevistas e rotina de estudos. Por onde começamos?']],
        conv: chatRows.length ? chatRows[chatRows.length - 1].conversation_id : null,
        seeded: 1,
      };
    },

    /* ----------------------- Dados do usuário ------------------------ */
    tasks: crud('tasks'),
    events: crud('events'),
    notes: crud('notes'),
    projects: crud('projects'),
    documents: crud('documents'),

    async saveProfile(name, prof) {
      ok(await db().from('profiles').update({
        full_name: name, profession: prof.role, phone: prof.phone, portfolio_url: prof.link, bio: prof.bio,
      }).eq('id', await uid()));
    },
    async saveSettings({ lang, priv, notif, fa }) {
      ok(await db().from('user_settings').update({
        language: invert(LANG)[lang], privacy: invert(PRIV)[priv],
        email_notifications: !!notif, two_factor_enabled: !!fa,
      }).eq('user_id', await uid()));
    },
    async saveDiagnostic([hours, phase, market]) {
      ok(await db().from('diagnostics').upsert({
        user_id: await uid(), study_hours: hours, academic_phase: phase, target_market: market,
      }));
    },
    async log(message) {
      ok(await db().from('activity_log').insert({ user_id: await uid(), message }));
    },
    async stats() { return ok(await db().rpc('dashboard_stats')); },

    /* ----------------- Imagens (Storage) para o editor ---------------- */
    /** Envia a imagem e devolve a URL pública para guardar no elemento. */
    async uploadImage(file, bucket = 'doc-images') {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${await uid()}/${crypto.randomUUID()}.${ext}`;
      ok(await db().storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false }));
      return db().storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },

    /* --------------------------- Agente de IA ------------------------- */
    async quota() { return ok(await db().rpc('ai_quota')); },
    /** Devolve { reply, conversation_id, quota }. Em caso de erro, lança Error com mensagem amigável. */
    async askAI(message, conversationId) {
      const { data, error } = await db().functions.invoke('ai-chat', {
        body: { message, conversation_id: conversationId },
      });
      if (error) {
        let detail = null;
        try { detail = await error.context.json(); } catch (_) { /* resposta sem corpo */ }
        const e = new Error(detail?.message || 'A IA não respondeu. Tente de novo.');
        e.quota = detail?.quota;
        throw e;
      }
      return data;
    },
  };
})();

/* =====================================================================
   COMO LIGAR NO FRONT-END (exemplos que o guia explica passo a passo)

   // Início do script do index.html
   PortfyAPI.init('https://SEU-PROJETO.supabase.co', 'SUA_CHAVE_PUBLICA');

   // Login
   await PortfyAPI.signIn(email, senha);
   D = await PortfyAPI.load();

   // Cadastro (depois do diagnóstico)
   await PortfyAPI.signUp(nome, email, senha);
   await PortfyAPI.saveDiagnostic([horas, fase, mercado]);

   // Tarefa criada / concluída / excluída
   const t = await PortfyAPI.tasks.add({ t: 'Estudar', d: '2026-10-10', done: 0 });
   await PortfyAPI.tasks.update(t.id, { ...t, done: 1 });
   await PortfyAPI.tasks.remove(t.id);

   // Salvar o arquivo aberto no editor
   await PortfyAPI.documents.update(Ed.doc.id, Ed.doc);

   // Chat com IA
   const r = await PortfyAPI.askAI(texto, D.conv); D.conv = r.conversation_id;
   ===================================================================== */
