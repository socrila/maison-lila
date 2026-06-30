-- Maison Lila - synchronisation personnelle
-- Ce fichier est volontairement additif :
-- il cree uniquement une table dediee a Maison Lila et ne modifie pas
-- les autres tables ou donnees du projet Supabase.

create table if not exists public.maison_lila_app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.maison_lila_app_states enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maison_lila_app_states'
      and policyname = 'maison_lila_select_own_state'
  ) then
    create policy "maison_lila_select_own_state"
    on public.maison_lila_app_states
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maison_lila_app_states'
      and policyname = 'maison_lila_insert_own_state'
  ) then
    create policy "maison_lila_insert_own_state"
    on public.maison_lila_app_states
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maison_lila_app_states'
      and policyname = 'maison_lila_update_own_state'
  ) then
    create policy "maison_lila_update_own_state"
    on public.maison_lila_app_states
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

grant select, insert, update on public.maison_lila_app_states to authenticated;
