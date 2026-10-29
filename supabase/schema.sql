-- ==========================================================================
-- SOCIAL MEDIA BALANCE — Supabase / PostgreSQL schema
-- Run this whole file in Supabase Studio → SQL Editor → New query → Run.
-- Safe to re-run: drops and recreates all public tables (data is wiped),
-- then re-seeds reference data.
-- ==========================================================================

drop policy if exists "profiles: own read"   on public.profiles;
drop policy if exists "profiles: own insert" on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;
drop policy if exists "settings: own crud"   on public.user_settings;
drop policy if exists "usage: own crud"      on public.usage_logs;
drop policy if exists "barriers: own crud"   on public.barrier_challenges;
drop policy if exists "overrides: own crud"  on public.emergency_overrides;
drop policy if exists "widgetcfg: own crud"  on public.widget_configs;
drop policy if exists "notes: own crud"      on public.widget_notes;
drop policy if exists "schedule: own crud"   on public.schedule_events;
drop policy if exists "apps: read for auth"       on public.apps;
drop policy if exists "campus: read for everyone" on public.campus_metrics_daily;
drop policy if exists "zones: read for everyone"  on public.focus_zones;

drop table if exists public.focus_zones cascade;
drop table if exists public.campus_metrics_daily cascade;
drop table if exists public.schedule_events cascade;
drop table if exists public.widget_notes cascade;
drop table if exists public.widget_configs cascade;
drop table if exists public.emergency_overrides cascade;
drop table if exists public.barrier_challenges cascade;
drop table if exists public.usage_logs cascade;
drop table if exists public.apps cascade;
drop table if exists public.user_settings cascade;
drop table if exists public.profiles cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 1. IDENTITY & PREFERENCES -------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Student',
  locale text not null default 'ru' check (locale in ('ru', 'en')),
  sound_enabled boolean not null default true,
  high_contrast boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  daily_limit_minutes int not null default 240 check (daily_limit_minutes between 5 and 1440),
  nudge_threshold_percent int not null default 80 check (nudge_threshold_percent between 50 and 95),
  sleep_protection_start time not null default '22:30',
  mono_mode_enabled boolean not null default true
);

-- 2. USAGE TRACKING ---------------------------------------------------------

create table public.apps (
  id int primary key,
  name text not null,
  category text not null default 'social' check (category in ('social', 'short_video', 'messenger', 'edu')),
  icon text,
  brand_color text not null default '#00d4b2'
);

-- One row per (user, day, app). app_id NULL is reserved for simulator totals
-- without a platform attribution.
create table public.usage_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  app_id int references public.apps (id) on delete set null,
  usage_date date not null default current_date,
  minutes int not null check (minutes >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, usage_date, app_id)
);

create index usage_logs_user_date_idx on public.usage_logs (user_id, usage_date);

-- 3. BARRIERS & REFLECTION ----------------------------------------------------

create table public.barrier_challenges (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  barrier_type text not null check (barrier_type in ('pushups', 'math', 'breathing', 'emergency')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  reps_done int,
  goal_reps int default 10,
  completed_at timestamptz not null default now()
);

create table public.emergency_overrides (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  granted_minutes int not null default 15 check (granted_minutes between 5 and 60),
  requested_at timestamptz not null default now()
);

-- 4. LOCK SCREEN STUDIO -------------------------------------------------------

create table public.widget_configs (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  wallpaper text not null default 'wallpaper-obsidian'
    check (wallpaper in ('wallpaper-obsidian', 'wallpaper-library', 'wallpaper-sunset', 'wallpaper-focus')),
  layout text not null default 'gauge' check (layout in ('gauge', 'sticky', 'pill')),
  smart_scrim boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.widget_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  body text not null default '' check (char_length(body) <= 120),
  updated_at timestamptz not null default now()
);

-- 5. SCHEDULE (AITU) ----------------------------------------------------------

create table public.schedule_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  event_date date not null default current_date,
  starts_at time not null,
  ends_at time not null,
  location text,
  source text not null default 'manual' check (source in ('manual', 'moodle'))
);

create index schedule_events_user_date_idx on public.schedule_events (user_id, event_date);

-- 6. CAMPUS OBSERVATORY (institution-level, anonymized aggregates) ------------

create table public.campus_metrics_daily (
  id bigint generated always as identity primary key,
  metric_date date not null unique,
  active_focus_students int not null default 0,
  hours_saved numeric not null default 0,
  override_reduction_pct numeric not null default 0,
  week_over_week_pct numeric not null default 0
);

create table public.focus_zones (
  id int generated always as identity primary key,
  name text not null,
  focus_load_percent int not null check (focus_load_percent between 0 and 100),
  description text
);

-- 7. NEW-USER BOOTSTRAP TRIGGER ------------------------------------------------
-- Creates profile, settings, widget config, note, today's schedule and today's
-- usage rows automatically when a student signs up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Student'));

  insert into public.user_settings (user_id) values (new.id);

  insert into public.widget_configs (user_id) values (new.id);

  insert into public.widget_notes (user_id, body)
  values (new.id, 'Подготовить слайды по HCI к 18:00' || E'\n' || 'Лабораторная по архитектуре');

  insert into public.schedule_events (user_id, title, starts_at, ends_at, location) values
    (new.id, 'ICT: Лекция по человеко-компьютерному взаимодействию', '14:00', '15:50', 'Аудитория C1.2.240'),
    (new.id, 'Самостоятельная работа в библиотеке AITU', '16:10', '18:00', 'Научная библиотека AITU'),
    (new.id, 'Лабораторная работа: Архитектура ПО', '18:30', '20:00', 'Онлайн-лаборатория');

  insert into public.usage_logs (user_id, app_id, minutes) values
    (new.id, 1, 0), (new.id, 2, 0), (new.id, 3, 0), (new.id, 4, 0), (new.id, 5, 0);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8. ROW LEVEL SECURITY ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.apps enable row level security;
alter table public.usage_logs enable row level security;
alter table public.barrier_challenges enable row level security;
alter table public.emergency_overrides enable row level security;
alter table public.widget_configs enable row level security;
alter table public.widget_notes enable row level security;
alter table public.schedule_events enable row level security;
alter table public.campus_metrics_daily enable row level security;
alter table public.focus_zones enable row level security;

-- Own-row policies
create policy "profiles: own read"   on public.profiles   for select   using (auth.uid() = id);
create policy "profiles: own insert" on public.profiles   for insert   with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles   for update   using (auth.uid() = id) with check (auth.uid() = id);

create policy "settings: own crud"  on public.user_settings  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "usage: own crud"     on public.usage_logs      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "barriers: own crud"  on public.barrier_challenges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "overrides: own crud" on public.emergency_overrides for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "widgetcfg: own crud" on public.widget_configs  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes: own crud"     on public.widget_notes    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "schedule: own crud"  on public.schedule_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared read-only reference data
create policy "apps: read for auth"        on public.apps for select to authenticated using (true);
create policy "campus: read for everyone"  on public.campus_metrics_daily for select using (true);
create policy "zones: read for everyone"   on public.focus_zones for select using (true);

-- 9. SEED DATA -------------------------------------------------------------------

insert into public.apps (id, name, category, icon, brand_color) values
  (1, 'Instagram (Reels)',          'short_video', '📷', '#e1306c'),
  (2, 'TikTok',                    'short_video', '🎵', '#00f2fe'),
  (3, 'YouTube Shorts',            'short_video', '▶️', '#ff0000'),
  (4, 'Telegram (Учебные группы)', 'messenger',   '✈️', '#229ed9'),
  (5, 'Moodle AITU',               'edu',         '🎓', '#f59e0b')
on conflict (id) do nothing;

insert into public.campus_metrics_daily
  (metric_date, active_focus_students, hours_saved, override_reduction_pct, week_over_week_pct)
values
  (current_date, 1420, 3850, 44, 18)
on conflict (metric_date) do nothing;

insert into public.focus_zones (name, focus_load_percent, description) values
  ('Коворкинг Block C1', 88, 'Автоматическое включение режима «Глубокая учеба» при подключении к eduroam Wi-Fi.'),
  ('Медиатека & Библиотека AITU', 94, 'Строгий режим мягких барьеров: блокировка коротких видео (Reels, TikTok, Shorts).'),
  ('Лаборатории Факультета IT', 76, 'Интеграция с GitHub и средами разработки для отслеживания времени коммитов.')
on conflict do nothing;
