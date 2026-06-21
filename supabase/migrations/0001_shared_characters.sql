-- Compartilhamento de fichas: leitura pública por id; escrita só via funções
-- RPC que validam um owner_token secreto (guardado em tabela separada, nunca
-- exposto). Sem login (uso entre amigos). Idempotente — pode reaplicar.

-- Dados públicos da ficha compartilhada (lidos por qualquer um com o id).
create table if not exists public.shared_characters (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Segredo do dono, isolado para nunca ser lido pelo cliente.
create table if not exists public.shared_secrets (
  id uuid primary key references public.shared_characters(id) on delete cascade,
  owner_token text not null
);

alter table public.shared_characters enable row level security;
alter table public.shared_secrets enable row level security;

-- shared_characters: leitura pública. Sem policies de insert/update/delete =>
-- acesso direto negado (só as funções security definer escrevem).
drop policy if exists "public read" on public.shared_characters;
create policy "public read" on public.shared_characters for select using (true);

-- shared_secrets: sem nenhuma policy => totalmente inacessível ao anon.

-- Token de dono: dois UUIDs concatenados (64 hex), sem depender de pgcrypto.
create or replace function public.publish_character(p_data jsonb)
returns table(id uuid, owner_token text)
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := gen_random_uuid();
  v_token text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
begin
  insert into public.shared_characters(id, data) values (v_id, p_data);
  insert into public.shared_secrets(id, owner_token) values (v_id, v_token);
  return query select v_id, v_token;
end;
$$;

-- Atualiza (link vivo) se o token confere.
create or replace function public.update_character(p_id uuid, p_token text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.shared_secrets where id = p_id and owner_token = p_token) then
    raise exception 'Token inválido ou ficha inexistente.';
  end if;
  update public.shared_characters set data = p_data, updated_at = now() where id = p_id;
end;
$$;

-- Despublica se o token confere (cascade remove o segredo).
create or replace function public.unpublish_character(p_id uuid, p_token text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.shared_characters
  where id = p_id
    and exists (select 1 from public.shared_secrets where id = p_id and owner_token = p_token);
end;
$$;

grant execute on function public.publish_character(jsonb) to anon, authenticated;
grant execute on function public.update_character(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.unpublish_character(uuid, text) to anon, authenticated;

-- Realtime: emite mudanças de shared_characters para os assinantes (idempotente).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shared_characters'
  ) then
    alter publication supabase_realtime add table public.shared_characters;
  end if;
end $$;
