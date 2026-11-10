-- Kamikaze "Lights off": soul pass, demo form, admin, site content, media bucket.
--
-- Idempotent: paste the whole file into the Supabase SQL editor and run it; run it
-- again any time, no rows change. It never drops or rewrites a table, column or
-- policy it did not create (every policy and trigger here is prefixed kz_). On
-- the existing demo_submissions table it only adds a city column, turns RLS on
-- and adds one admin read policy.
-- Needs Postgres 15+ (security_invoker views). See supabase/README.md.
--
-- Security model
--   * Every table is locked by RLS. The public site holds only the anon key and
--     reaches data through three SECURITY DEFINER functions that validate input
--     and return numbers and counts, never an email, phone number or city.
--   * "authenticated" is NOT trusted: anyone can sign up for an account unless
--     sign-ups are switched off. Admin rights come only from a row in
--     public.admins, checked by public.is_admin().
--   * Supabase grants anon and authenticated full table and function privileges
--     by default, so each object below is followed by an explicit revoke + grant.
--
-- NOT protected (on purpose, v1):
--   * No rate limit and no captcha on claim_pass / submit_demo: a script can
--     create junk passes and junk demos as fast as the API answers.
--   * No email or WhatsApp verification: referral counts are unverified sign-ups,
--     so throwaway addresses inflate the board.
--   * Typing someone's email returns their pass number and referral count (not
--     their details), which also reveals that the address is on the list.
-- ponytail: add verification (emailed code or WhatsApp OTP) plus a captcha or
-- per-IP throttle in front of claim_pass BEFORE any reward depends on the
-- leaderboard, or the day junk rows show up, whichever comes first.

-- 1. Soul passes ---------------------------------------------------------------

create table if not exists public.souls (
  number      bigint generated always as identity primary key,  -- the pass number
  email       text not null unique,
  whatsapp    text,
  city        text,
  -- set null: deleting one person on request must not fail because they referred others
  referred_by bigint references public.souls (number) on delete set null,
  created_at  timestamptz not null default now(),
  constraint souls_email_lowercase check (email = lower(email)),
  constraint souls_no_self_ref check (referred_by is null or referred_by <> number)
);
create index if not exists souls_referred_by_idx on public.souls (referred_by);

alter table public.souls enable row level security;
revoke all on table public.souls from anon, authenticated;
grant select on table public.souls to authenticated;  -- rows still gated by kz_souls_admin_select

-- 2. Admins ----------------------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;  -- own row only, see policy

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke execute on function public.is_admin() from public, anon, service_role;
grant execute on function public.is_admin() to authenticated;

-- Every admin policy below is "to authenticated": anon has no execute on
-- is_admin(), so a policy that anon could reach would error instead of deny.

drop policy if exists kz_admins_self_select on public.admins;
create policy kz_admins_self_select on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists kz_souls_admin_select on public.souls;
create policy kz_souls_admin_select on public.souls
  for select to authenticated using ((select public.is_admin()));

-- 3. Demo submissions (table already exists on the live project) -----------------

create table if not exists public.demo_submissions (
  id             bigint generated always as identity primary key,
  soundcloud_url text not null,
  artist_alias   text,
  created_at     timestamptz not null default now()
);
alter table public.demo_submissions add column if not exists city text;

-- No-op when RLS is already on. The old submit-demo edge function inserts with the
-- service role, which bypasses RLS, so it keeps working.
alter table public.demo_submissions enable row level security;
grant select on table public.demo_submissions to authenticated;

drop policy if exists kz_demo_submissions_admin_select on public.demo_submissions;
create policy kz_demo_submissions_admin_select on public.demo_submissions
  for select to authenticated using ((select public.is_admin()));

-- 4. Site content (what /kaizen/ edits; the public site reads it) ----------------
-- Every row is readable by anyone with the anon key. Never store a secret here.

create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  constraint site_content_value_is_object check (jsonb_typeof(value) = 'object')
);
alter table public.site_content enable row level security;
revoke all on table public.site_content from anon, authenticated;
grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;

drop policy if exists kz_site_content_read on public.site_content;
create policy kz_site_content_read on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists kz_site_content_admin_insert on public.site_content;
create policy kz_site_content_admin_insert on public.site_content
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists kz_site_content_admin_update on public.site_content;
create policy kz_site_content_admin_update on public.site_content
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists kz_site_content_admin_delete on public.site_content;
create policy kz_site_content_admin_delete on public.site_content
  for delete to authenticated using ((select public.is_admin()));

-- An upsert only writes key + value, so the timestamp has to be kept by the database.
create or replace function public.kz_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;
revoke execute on function public.kz_touch_updated_at() from public, anon, authenticated, service_role;

create or replace trigger kz_site_content_touch
  before insert or update on public.site_content
  for each row execute function public.kz_touch_updated_at();

-- 5. Admin view: every pass with its referral count ------------------------------
-- security_invoker: the view runs with the caller's rights, so the souls policy
-- applies and a non-admin gets zero rows.

create or replace view public.soul_board
with (security_invoker = true) as
select
  s.number,
  s.email,
  s.whatsapp,
  s.city,
  s.referred_by,
  s.created_at,
  (select count(*) from public.souls r where r.referred_by = s.number) as referrals
from public.souls s;

revoke all on table public.soul_board from anon, authenticated;
grant select on table public.soul_board to authenticated;

-- 6. Public RPCs -----------------------------------------------------------------
-- Errors are raised as bare codes so PostgREST answers 400 {"message":"INVALID_EMAIL"}.
-- Nothing here returns, logs or raises an email, phone number or city.

create or replace function public.claim_pass(
  p_email    text,
  p_whatsapp text   default null,
  p_city     text   default null,
  p_ref      bigint default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email  text;
  v_wa     text;
  v_city   text;
  v_number bigint;
  v_new    boolean := false;
begin
  -- Length caps run before any regex, so an oversized input costs nothing.
  if p_email is null or length(p_email) > 320 then
    raise exception 'INVALID_EMAIL';
  end if;
  v_email := lower(btrim(p_email, e' \t\n\r'));
  if length(v_email) > 254
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  if length(p_whatsapp) > 40 then
    raise exception 'INVALID_WHATSAPP';
  end if;
  v_wa := regexp_replace(coalesce(p_whatsapp, ''), '[[:space:]().-]', '', 'g');
  if v_wa ~ '^([+][0-9]{0,3})?$' then          -- empty, or only a country code such as +91
    v_wa := null;
  elsif v_wa !~ '^[+][1-9][0-9]{7,14}$' then
    raise exception 'INVALID_WHATSAPP';
  end if;

  v_city := nullif(left(btrim(coalesce(p_city, ''), e' \t\n\r'), 80), '');

  -- Look up first: a repeat sign-up must not burn a pass number.
  select s.number into v_number from public.souls s where s.email = v_email;

  if v_number is null then
    -- p_ref counts only if that pass exists. A new pass cannot name itself (its
    -- number does not exist yet) and souls_no_self_ref backs that up.
    insert into public.souls (email, whatsapp, city, referred_by)
    values (v_email, v_wa, v_city,
            (select r.number from public.souls r where r.number = p_ref))
    on conflict (email) do nothing
    returning number into v_number;

    v_new := v_number is not null;
    if not v_new then
      -- Two requests raced on the same email: the other one won, return its pass.
      -- ponytail: this path alone skips one number; gaps are harmless.
      select s.number into v_number from public.souls s where s.email = v_email;
    end if;
  end if;

  return json_build_object(
    'number', v_number,
    'isNew', v_new,
    'referrals', (select count(*) from public.souls r where r.referred_by = v_number)
  );
end
$$;
revoke execute on function public.claim_pass(text, text, text, bigint) from public;
grant execute on function public.claim_pass(text, text, text, bigint) to anon, authenticated;

-- ponytail: aggregates all referrals on every call; fine to tens of thousands of
-- passes, cache the top ten in a table if this ever shows up in slow queries.
create or replace function public.pass_stats(p_number bigint)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'number', s.number,
    'referrals', (select count(*) from public.souls r where r.referred_by = s.number),
    'top', coalesce((
      select json_agg(json_build_object('number', t.number, 'referrals', t.referrals)
                      order by t.referrals desc, t.number)
      from (
        select r.referred_by as number, count(*) as referrals
        from public.souls r
        where r.referred_by is not null
        group by r.referred_by
        order by count(*) desc, r.referred_by
        limit 10
      ) t
    ), '[]'::json)
  )
  from public.souls s
  where s.number = p_number;   -- no such pass: no row, so the result is null
$$;
revoke execute on function public.pass_stats(bigint) from public;
grant execute on function public.pass_stats(bigint) to anon, authenticated;

create or replace function public.submit_demo(
  p_link text,
  p_name text default null,
  p_city text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link text;
begin
  if p_link is null or length(p_link) > 500 then
    raise exception 'INVALID_LINK';
  end if;
  v_link := btrim(p_link, e' \t\n\r');
  -- soundcloud.com or exactly one subdomain (www. on. m.), then a non-empty path.
  if v_link !~* '^https?://([a-z0-9-]+[.])?soundcloud[.]com/.+' then
    raise exception 'INVALID_LINK';
  end if;

  insert into public.demo_submissions (soundcloud_url, artist_alias, city)
  values (
    v_link,
    nullif(left(btrim(coalesce(p_name, ''), e' \t\n\r'), 120), ''),
    nullif(left(btrim(coalesce(p_city, ''), e' \t\n\r'), 80), '')
  );
  return json_build_object('ok', true);
end
$$;
revoke execute on function public.submit_demo(text, text, text) from public;
grant execute on function public.submit_demo(text, text, text) to anon, authenticated;

-- 7. Storage: public bucket, admin-only writes -----------------------------------
-- public = true serves files at /storage/v1/object/public/site-media/... with no
-- policy. There is deliberately no public select policy: that would only let
-- anyone list the bucket. Images only, 10 MB each.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- One policy for select/insert/update/delete (upsert and delete need select too).
drop policy if exists kz_site_media_admin_all on storage.objects;
create policy kz_site_media_admin_all on storage.objects
  for all to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()))
  with check (bucket_id = 'site-media' and (select public.is_admin()));

-- 8. Tell PostgREST about the new functions and tables ---------------------------
notify pgrst, 'reload schema';
