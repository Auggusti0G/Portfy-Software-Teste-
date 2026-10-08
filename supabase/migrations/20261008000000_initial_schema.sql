-- =====================================================================
-- PORTFY · Esquema do banco de dados (Supabase / PostgreSQL)
--
-- COMO USAR
--   1. Supabase Dashboard > SQL Editor > New query
--   2. Cole este arquivo inteiro e clique em Run
--   3. O script é idempotente: pode ser executado de novo sem erro.
--
-- MAPA EM RELAÇÃO AO DOCUMENTO DE ARQUITETURA (seção 12)
--   Usuário  -> auth.users (gerenciada pelo Supabase) + public.profiles
--   Perfil   -> public.profiles
--   Configuração -> public.user_settings
--   Agente_IA -> ai_conversations, ai_messages, ai_usage_daily
--   Evento / Calendário -> public.events (o calendário é uma visão dos eventos)
--   Nota     -> public.notes
--   Plano de Pagamento -> plans, subscriptions, payments
--   Publicação / Projeto / Templates -> documents, projects, templates
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. TIPOS
-- ---------------------------------------------------------------------
do $$ begin create type public.doc_kind   as enum ('curriculo', 'portfolio', 'projeto');            exception when duplicate_object then null; end $$;
do $$ begin create type public.sub_status as enum ('active', 'canceled', 'past_due');               exception when duplicate_object then null; end $$;
do $$ begin create type public.pay_status as enum ('pending', 'paid', 'failed', 'refunded');        exception when duplicate_object then null; end $$;
do $$ begin create type public.ai_role    as enum ('user', 'assistant');                            exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. PLANOS E ASSINATURAS (Planos A, B e C do documento)
-- ---------------------------------------------------------------------
create table if not exists public.plans (
  code            text primary key,                    -- 'A', 'B', 'C'
  name            text    not null,
  price_cents     integer not null default 0 check (price_cents >= 0),
  ai_daily_limit  integer not null default 10 check (ai_daily_limit >= 0),
  features        jsonb   not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

insert into public.plans (code, name, price_cents, ai_daily_limit, features) values
  ('A', 'Gratuito', 0,    10,  '["Modelos gratuitos","Agenda e tarefas","Notas e projetos"]'),
  ('B', 'Pro',      2900, 100, '["Tudo do plano Gratuito","Modelos Pro","Agente de IA ampliado"]'),
  ('C', 'Premium',  5900, 500, '["Tudo do plano Pro","Suporte prioritário","Exportação sem marca"]')
on conflict (code) do update
  set name = excluded.name, price_cents = excluded.price_cents,
      ai_daily_limit = excluded.ai_daily_limit, features = excluded.features;

-- ---------------------------------------------------------------------
-- 3. PERFIL, CONFIGURAÇÕES E DIAGNÓSTICO (1 linha por usuário)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null default '',
  email          text,
  avatar_url     text,
  profession     text,
  phone          text,
  portfolio_url  text,
  bio            text check (char_length(bio) <= 500),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  theme                text not null default 'system' check (theme in ('system', 'light', 'dark')),
  language             text not null default 'pt-BR'  check (language in ('pt-BR', 'en', 'es')),
  privacy              text not null default 'public' check (privacy in ('public', 'link', 'private')),
  email_notifications  boolean not null default true,
  two_factor_enabled   boolean not null default false,   -- espelho informativo; o MFA real fica em auth.mfa
  updated_at           timestamptz not null default now()
);

create table if not exists public.diagnostics (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  study_hours     text,
  academic_phase  text,
  target_market   text,
  created_at      timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users (id) on delete cascade,
  plan_code            text not null default 'A' references public.plans (code),
  status               public.sub_status not null default 'active',
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  subscription_id  uuid references public.subscriptions (id) on delete set null,
  plan_code        text not null references public.plans (code),
  amount_cents     integer not null check (amount_cents >= 0),
  currency         text not null default 'BRL',
  status           public.pay_status not null default 'pending',
  provider         text,                 -- 'stripe', 'mercadopago'...
  provider_ref     text,                 -- id da cobrança no provedor
  created_at       timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 4. MODELOS (templates gratuitos e pagos)
--    O layout visual é gerado pelo front-end a partir de kind + accent.
--    O campo layout (jsonb) fica livre para modelos personalizados no futuro.
-- ---------------------------------------------------------------------
create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  category     text not null check (category in ('curriculo', 'portfolio', 'linkedin', 'projeto')),
  kind         public.doc_kind not null,
  min_plan     text not null default 'A' references public.plans (code),   -- 'A' = gratuito
  accent       text not null default '#0A1A3F',
  layout       jsonb,
  is_active    boolean not null default true,
  sort_order   integer not null default 0
);

insert into public.templates (slug, name, description, category, kind, min_plan, accent, sort_order) values
  ('curriculo-profissional', 'Currículo Profissional', 'Limpo e objetivo para o mercado tradicional',   'curriculo', 'curriculo', 'A', '#0A1A3F', 1),
  ('portfolio-criativo',     'Portfólio Criativo',     'Destaque seus projetos com visual impactante',  'portfolio', 'portfolio', 'A', '#2F5BEA', 2),
  ('perfil-linkedin',        'Perfil LinkedIn',        'Otimize seu perfil para recrutadores',          'linkedin',  'portfolio', 'A', '#1F44C9', 3),
  ('case-de-projeto',        'Case de Projeto',        'Documente um projeto de ponta a ponta',         'projeto',   'projeto',   'B', '#0A1A3F', 4),
  ('curriculo-moderno',      'Currículo Moderno',      'Design contemporâneo para áreas criativas',     'curriculo', 'curriculo', 'B', '#3A5BD9', 5),
  ('portfolio-tech',         'Portfólio Tech',         'Ideal para desenvolvedores e engenheiros',      'portfolio', 'portfolio', 'B', '#101B3D', 6)
on conflict (slug) do update
  set name = excluded.name, description = excluded.description, category = excluded.category,
      kind = excluded.kind, min_plan = excluded.min_plan, accent = excluded.accent, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------
-- 5. ARQUIVOS DO EDITOR (currículos, portfólios e cases de projeto)
--    elements = lista de elementos do canvas: texto, formas e imagens.
--    Imagens ficam no Storage; aqui só guardamos a URL.
-- ---------------------------------------------------------------------
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  kind          public.doc_kind not null,
  title         text not null default 'Sem título' check (char_length(title) between 1 and 120),
  width         integer not null default 1280 check (width between 200 and 4000),
  height        integer not null default 720  check (height between 200 and 4000),
  background    text not null default '#ffffff',
  elements      jsonb not null default '[]'::jsonb check (jsonb_typeof(elements) = 'array'),
  template_id   uuid references public.templates (id) on delete set null,
  cover_url     text,
  is_published  boolean not null default false,
  slug          text unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,60}$'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists documents_user_idx on public.documents (user_id, updated_at desc);

-- ---------------------------------------------------------------------
-- 6. PRODUTIVIDADE: projetos, tarefas, eventos e notas
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 120),
  description  text,
  progress     integer not null default 0 check (progress between 0 and 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists projects_user_idx on public.projects (user_id, created_at desc);

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  due_date    date not null default current_date,
  done        boolean not null default false,
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists tasks_user_idx on public.tasks (user_id, done, due_date);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  event_date  date not null,
  event_time  time not null default '09:00',
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists events_user_idx on public.events (user_id, event_date);

create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  content     text not null default '' check (char_length(content) <= 20000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists notes_user_idx on public.notes (user_id, updated_at desc);

create table if not exists public.activity_log (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  message     text not null check (char_length(message) <= 300),
  created_at  timestamptz not null default now()
);
create index if not exists activity_user_idx on public.activity_log (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 7. AGENTE DE IA
--    Mensagens e uso são gravados SOMENTE pela Edge Function (service role).
--    O cliente só lê. Assim ninguém burla a cota apagando ou forjando linhas.
-- ---------------------------------------------------------------------
create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'Nova conversa',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ai_conv_user_idx on public.ai_conversations (user_id, updated_at desc);

create table if not exists public.ai_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.ai_conversations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             public.ai_role not null,
  content          text not null check (char_length(content) <= 8000),
  tokens_in        integer,
  tokens_out       integer,
  created_at       timestamptz not null default now()
);
create index if not exists ai_msg_conv_idx on public.ai_messages (conversation_id, created_at);

create table if not exists public.ai_usage_daily (
  user_id   uuid not null references auth.users (id) on delete cascade,
  day       date not null,
  messages  integer not null default 0,
  tokens    bigint  not null default 0,
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------
-- 8. FUNÇÕES E GATILHOS
-- ---------------------------------------------------------------------

-- 8.1 Mantém updated_at sempre correto
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','user_settings','subscriptions','documents','projects','tasks','events','notes','ai_conversations']
  loop
    execute format('drop trigger if exists trg_touch on public.%I', t);
    execute format('create trigger trg_touch before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- 8.2 Preenche done_at ao concluir uma tarefa
create or replace function public.set_task_done_at()
returns trigger language plpgsql as $$
begin
  if new.done and not coalesce(old.done, false) then new.done_at = now();
  elsif not new.done then new.done_at = null;
  end if;
  return new;
end $$;
drop trigger if exists trg_task_done on public.tasks;
create trigger trg_task_done before update on public.tasks for each row execute function public.set_task_done_at();

-- 8.3 Ao criar a conta no Supabase Auth, cria perfil, configurações e plano gratuito
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
    on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  insert into public.subscriptions (user_id, plan_code) values (new.id, 'A') on conflict do nothing;
  insert into public.activity_log (user_id, message) values (new.id, 'Conta criada no Portfy');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8.4 Cota diária da IA conforme o plano do usuário (fuso de Brasília)
create or replace function public.ai_quota()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'used',  coalesce((select u.messages from public.ai_usage_daily u
                       where u.user_id = auth.uid()
                         and u.day = (now() at time zone 'America/Sao_Paulo')::date), 0),
    'limit', coalesce((select p.ai_daily_limit from public.subscriptions s
                       join public.plans p on p.code = s.plan_code
                       where s.user_id = auth.uid() and s.status = 'active'), 10)
  );
$$;

-- 8.5 Registra o uso da IA (chamada só pelo servidor)
create or replace function public.ai_register_usage(p_user uuid, p_tokens integer)
returns void language sql security definer set search_path = public as $$
  insert into public.ai_usage_daily (user_id, day, messages, tokens)
  values (p_user, (now() at time zone 'America/Sao_Paulo')::date, 1, greatest(p_tokens, 0))
  on conflict (user_id, day) do update
    set messages = public.ai_usage_daily.messages + 1,
        tokens   = public.ai_usage_daily.tokens + greatest(p_tokens, 0);
$$;
revoke all on function public.ai_register_usage(uuid, integer) from public, anon, authenticated;
grant execute on function public.ai_register_usage(uuid, integer) to service_role;

-- 8.6 Números do dashboard em uma só chamada
create or replace function public.dashboard_stats()
returns jsonb language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'projects_in_progress', (select count(*) from public.projects  where user_id = auth.uid() and progress < 100),
    'published_portfolios', (select count(*) from public.documents where user_id = auth.uid() and kind = 'portfolio'),
    'tasks_due',            (select count(*) from public.tasks     where user_id = auth.uid() and not done and due_date <= current_date),
    'achievements',
        (exists (select 1 from public.tasks       where user_id = auth.uid() and done))::int
      + (exists (select 1 from public.documents   where user_id = auth.uid()))::int
      + (exists (select 1 from public.notes       where user_id = auth.uid()))::int
      + (exists (select 1 from public.projects    where user_id = auth.uid()))::int
      + (exists (select 1 from public.events      where user_id = auth.uid()))::int
      + (exists (select 1 from public.profiles    where id = auth.uid() and coalesce(bio, '') <> ''))::int
      + (exists (select 1 from public.subscriptions where user_id = auth.uid() and plan_code <> 'A'))::int
      + (exists (select 1 from public.diagnostics where user_id = auth.uid()))::int
  );
$$;

-- ---------------------------------------------------------------------
-- 9. SEGURANÇA: ROW LEVEL SECURITY (cada usuário só enxerga o que é dele)
-- ---------------------------------------------------------------------

-- 9.1 Tabelas em que o usuário tem controle total sobre as próprias linhas
do $$
declare t text;
begin
  foreach t in array array['tasks','events','notes','projects','documents']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists owner_all on public.%I', t);
    execute format($p$create policy owner_all on public.%I for all to authenticated
                      using (user_id = (select auth.uid()))
                      with check (user_id = (select auth.uid()))$p$, t);
  end loop;
end $$;

-- 9.2 Perfil: lê e edita o próprio (a criação é feita pelo gatilho)
alter table public.profiles enable row level security;
drop policy if exists own_select on public.profiles;
drop policy if exists own_update on public.profiles;
create policy own_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy own_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- 9.3 Configurações e diagnóstico
alter table public.user_settings enable row level security;
drop policy if exists owner_all on public.user_settings;
create policy owner_all on public.user_settings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.diagnostics enable row level security;
drop policy if exists owner_all on public.diagnostics;
create policy owner_all on public.diagnostics for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 9.4 Histórico de atividades: o usuário lê e cria o próprio
alter table public.activity_log enable row level security;
drop policy if exists own_select on public.activity_log;
drop policy if exists own_insert on public.activity_log;
create policy own_select on public.activity_log for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on public.activity_log for insert to authenticated with check (user_id = (select auth.uid()));

-- 9.5 Planos e modelos: catálogo público (somente leitura)
alter table public.plans enable row level security;
drop policy if exists catalog_read on public.plans;
create policy catalog_read on public.plans for select to anon, authenticated using (true);

alter table public.templates enable row level security;
drop policy if exists catalog_read on public.templates;
create policy catalog_read on public.templates for select to anon, authenticated using (is_active);

-- 9.6 Assinaturas, pagamentos, IA: o usuário só LÊ. Escrita apenas pelo servidor (service role).
do $$
declare t text;
begin
  foreach t in array array['subscriptions','payments','ai_usage_daily']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists own_select on public.%I', t);
    execute format('create policy own_select on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

alter table public.ai_conversations enable row level security;
drop policy if exists own_select on public.ai_conversations;
drop policy if exists own_delete on public.ai_conversations;
create policy own_select on public.ai_conversations for select to authenticated using (user_id = (select auth.uid()));
create policy own_delete on public.ai_conversations for delete to authenticated using (user_id = (select auth.uid()));

alter table public.ai_messages enable row level security;
drop policy if exists own_select on public.ai_messages;
create policy own_select on public.ai_messages for select to authenticated using (user_id = (select auth.uid()));

-- 9.7 Arquivos publicados podem ser vistos por qualquer visitante (página pública do portfólio)
drop policy if exists published_read on public.documents;
create policy published_read on public.documents for select to anon, authenticated using (is_published);

-- ---------------------------------------------------------------------
-- 10. PERMISSÕES DA API (o RLS acima continua valendo sobre elas)
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.plans, public.templates to anon, authenticated;
grant select on public.documents to anon;
grant select, insert, update, delete on
  public.tasks, public.events, public.notes, public.projects, public.documents,
  public.user_settings, public.diagnostics to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.activity_log to authenticated;
grant select on public.subscriptions, public.payments, public.ai_usage_daily, public.ai_messages to authenticated;
grant select, delete on public.ai_conversations to authenticated;
grant execute on function public.ai_quota(), public.dashboard_stats() to authenticated;

-- ---------------------------------------------------------------------
-- 11. STORAGE: fotos de perfil e imagens usadas nos arquivos do editor
--     Convenção de caminho: <id-do-usuário>/<nome-do-arquivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',    'avatars',    true, 2097152, array['image/png', 'image/jpeg', 'image/webp']),
  ('doc-images', 'doc-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

do $$
declare b text;
begin
  foreach b in array array['avatars', 'doc-images']
  loop
    execute format('drop policy if exists "%s_read"   on storage.objects', b);
    execute format('drop policy if exists "%s_insert" on storage.objects', b);
    execute format('drop policy if exists "%s_update" on storage.objects', b);
    execute format('drop policy if exists "%s_delete" on storage.objects', b);
    execute format($p$create policy "%s_read" on storage.objects for select using (bucket_id = %L)$p$, b, b);
    execute format($p$create policy "%s_insert" on storage.objects for insert to authenticated
                      with check (bucket_id = %L and (storage.foldername(name))[1] = (select auth.uid())::text)$p$, b, b);
    execute format($p$create policy "%s_update" on storage.objects for update to authenticated
                      using (bucket_id = %L and (storage.foldername(name))[1] = (select auth.uid())::text)$p$, b, b);
    execute format($p$create policy "%s_delete" on storage.objects for delete to authenticated
                      using (bucket_id = %L and (storage.foldername(name))[1] = (select auth.uid())::text)$p$, b, b);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 12. (OPCIONAL, SÓ PARA TESTES) trocar de plano sem pagamento
--     Rode no SQL Editor, trocando o e-mail. Em produção o plano só muda
--     pelo webhook de pagamento (service role).
-- ---------------------------------------------------------------------
-- update public.subscriptions set plan_code = 'B'
--   where user_id = (select id from auth.users where email = 'voce@exemplo.com');
