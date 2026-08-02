-- Dozify core schema. Run with Supabase CLI: supabase db push
create extension if not exists pgcrypto;

create type public.dose_status as enum ('taken', 'skipped', 'missed');
create type public.relationship_status as enum ('pending', 'active');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age integer check (age between 0 and 120),
  gender text,
  height numeric check (height > 0),
  weight numeric check (weight > 0),
  user_type text,
  is_plus boolean not null default false,
  trial_ends_at timestamptz not null default (now() + interval '3 days'),
  created_at timestamptz not null default now()
);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null,
  form text not null check (form in ('Tablet', 'Kapsül', 'Şurup', 'Damla', 'İnsülin/Enjeksiyon')),
  dosage text not null,
  meal_status text,
  total_count integer not null check (total_count >= 0),
  remaining_count integer not null check (remaining_count >= 0),
  daily_frequency numeric not null check (daily_frequency > 0),
  is_insulin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.dose_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  scheduled_time timestamptz,
  taken_at timestamptz,
  status public.dose_status not null,
  injection_site text,
  created_at timestamptz not null default now()
);

create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  test_name text not null,
  value numeric not null,
  unit text not null,
  ref_min numeric not null,
  ref_max numeric not null,
  test_date date not null default current_date,
  created_at timestamptz not null default now(),
  check (ref_min <= ref_max)
);

create table public.family_relationships (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  status public.relationship_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique(patient_id, caregiver_id),
  check (patient_id <> caregiver_id)
);

-- Supports one-use links. Never expose tokens except to their creator.
create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index medications_user_id_idx on public.medications(user_id);
create index dose_logs_user_scheduled_idx on public.dose_logs(user_id, scheduled_time);
create index lab_results_user_date_idx on public.lab_results(user_id, test_date desc);
create index family_relationships_patient_idx on public.family_relationships(patient_id);
create index family_relationships_caregiver_idx on public.family_relationships(caregiver_id);

alter table public.profiles enable row level security;
alter table public.medications enable row level security;
alter table public.dose_logs enable row level security;
alter table public.lab_results enable row level security;
alter table public.family_relationships enable row level security;
alter table public.family_invites enable row level security;

-- SECURITY DEFINER avoids a self-referencing RLS policy while enforcing plan limits.
create or replace function public.lab_result_count(target_user_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$ select count(*)::integer from public.lab_results where user_id = target_user_id; $$;

create policy "profiles: own or linked" on public.profiles for select using (
  auth.uid() = id or exists (select 1 from public.family_relationships r where r.status = 'active' and ((r.patient_id = profiles.id and r.caregiver_id = auth.uid()) or (r.caregiver_id = profiles.id and r.patient_id = auth.uid())))
);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);

create policy "medications: owner all" on public.medications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dose logs: owner or active caregiver reads" on public.dose_logs for select using (auth.uid() = user_id or exists (select 1 from public.family_relationships r where r.status = 'active' and r.patient_id = dose_logs.user_id and r.caregiver_id = auth.uid()));
create policy "dose logs: owner write" on public.dose_logs for insert with check (auth.uid() = user_id);
create policy "dose logs: owner update" on public.dose_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dose logs: owner delete" on public.dose_logs for delete using (auth.uid() = user_id);

-- Trial cap: 2 results during trial, then Free users retain a single record; Plus is unlimited.
create policy "lab results: allowed reads" on public.lab_results for select using (auth.uid() = user_id);
create policy "lab results: plan limits" on public.lab_results for insert with check (
  auth.uid() = user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and (
      p.is_plus or (p.trial_ends_at > now() and public.lab_result_count(auth.uid()) < 2) or (p.trial_ends_at <= now() and public.lab_result_count(auth.uid()) < 1)
    )
  )
);
create policy "lab results: owner update" on public.lab_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lab results: owner delete" on public.lab_results for delete using (auth.uid() = user_id);

create policy "relationships: participant reads" on public.family_relationships for select using (auth.uid() = patient_id or auth.uid() = caregiver_id);
create policy "relationships: patient creates" on public.family_relationships for insert with check (auth.uid() = patient_id);
create policy "relationships: participant updates" on public.family_relationships for update using (auth.uid() = patient_id or auth.uid() = caregiver_id) with check (auth.uid() = patient_id or auth.uid() = caregiver_id);
create policy "relationships: participant deletes" on public.family_relationships for delete using (auth.uid() = patient_id or auth.uid() = caregiver_id);
create policy "invites: patient manages" on public.family_invites for all using (auth.uid() = patient_id) with check (auth.uid() = patient_id);
