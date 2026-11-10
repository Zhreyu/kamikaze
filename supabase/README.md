# Supabase: database for the site

One migration, `migrations/20261110120000_lights_off.sql`. It is idempotent: run it as often as you like, no rows change.

It creates the soul pass (`souls`), the admin list (`admins`), the editable site content (`site_content`), the admin view `soul_board`, the public storage bucket `site-media`, and the three functions the public site calls: `claim_pass`, `pass_stats`, `submit_demo`. On the existing `demo_submissions` table it adds a `city` column, turns row level security on and adds one admin read policy. Nothing else that already exists is touched. The old edge functions keep working.

## 1. Which project

Apply it to the project the deployed site talks to, and only that one.

- That is the host in `NEXT_PUBLIC_SUPABASE_URL` at build time (GitHub Actions secret for Pages, Vercel env for production). If the variable is unset or empty, the build uses the default in `src/lib/supabase.ts`.
- The repo's CLI link (`supabase/.temp/project-ref`) names a different project. Do not rely on it.
- To be sure: open the deployed site, DevTools > Network, reload, and look at any request to `https://<ref>.supabase.co`. That `<ref>` is the project.

The site also needs `NEXT_PUBLIC_SUPABASE_ANON_KEY` set at build time (Project Settings > API keys > anon). Without it every call below answers 401.

## 2. Apply

SQL editor (simplest):

1. Dashboard > SQL Editor > New query.
2. Paste the whole migration file. Run. If the editor warns about a destructive operation, confirm: the file drops and recreates only its own `kz_` policies.
3. Expect `Success. No rows returned`. If it errors, fix the cause and run the whole file again.

CLI (checked against `supabase` 3.1.0; pass the ref explicitly because of the stale link):

```sh
supabase login
supabase db push --remote=<ref> --dry-run   # must list 20261110120000_lights_off.sql
supabase db push --remote=<ref>
```

On CLI 1.x or 2.x there is no `--remote`: run `supabase link --project-ref <ref>` and then `supabase db push`.

Requires Postgres 15 or newer (`select version();`).

## 3. First admin

1. Dashboard > Authentication > Users > Add user > Create new user. Email and a strong password, tick Auto Confirm User.
2. SQL editor, with that email:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com'
on conflict do nothing;

select u.email from public.admins a join auth.users u on u.id = a.user_id;  -- who is an admin
```

Remove an admin:

```sql
delete from public.admins where user_id = (select id from auth.users where email = 'you@example.com');
```

3. Dashboard > Authentication > Sign In / Providers: turn off "Allow new users to sign up". Only admins need an account. (A signed-up stranger gets nothing anyway: every admin right is checked against `public.admins`.)

## 4. Smoke test

SQL editor. Run these one line at a time (select the line, then Run): the editor shows only the last result, and the last line is meant to fail. They create one pass and one demo; the cleanup block further down removes them.

```sql
select public.claim_pass('smoke-test@example.com', '+91 98765 43210', 'Kochi');  -- {"number":N,"isNew":true,"referrals":0}
select public.claim_pass('smoke-test@example.com');                               -- same N, "isNew":false
select public.pass_stats((select number from public.souls where email = 'smoke-test@example.com'));  -- {"number":N,"referrals":0,"top":[...]}
select public.pass_stats(0);                                                      -- NULL
select public.submit_demo('https://on.soundcloud.com/smoke', 'Smoke test', 'Kochi');  -- {"ok":true}
select public.claim_pass('nope');                                                 -- ERROR: INVALID_EMAIL
```

Checks (each is one query):

```sql
-- RLS must be true on every row. contact_submissions and merch_waitlist are older
-- tables this migration does not touch: if either shows false, anyone holding the
-- anon key can read it. Fix: alter table public.<name> enable row level security;
select c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;

-- Policies in force. Everything prefixed kz_ is from this migration.
select schemaname, tablename, policyname, cmd, roles
from pg_policies where schemaname in ('public', 'storage') order by 1, 2, 3;
```

Cleanup:

```sql
delete from public.souls where email = 'smoke-test@example.com';
delete from public.demo_submissions where artist_alias = 'Smoke test';
```

From outside, the way the site calls it (`URL` = `https://<ref>.supabase.co`, `ANON` = the anon key):

```sh
H=(-H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json")
curl -s "$URL/rest/v1/rpc/claim_pass" "${H[@]}" -d '{"p_email":"nope"}'          # 400 {"code":"P0001",...,"message":"INVALID_EMAIL"}
curl -s "$URL/rest/v1/rpc/pass_stats" "${H[@]}" -d '{"p_number":0}'              # null
curl -s "$URL/rest/v1/site_content?key=eq.site&select=value" "${H[@]}"           # [] until the admin saves once
curl -s "$URL/rest/v1/souls?select=*" "${H[@]}"                                  # must be an error (42501 permission denied), never rows
curl -s "$URL/rest/v1/soul_board?select=*" "${H[@]}"                             # same
```

## 5. Before launch: reset numbering

Test sign-ups use up real numbers. Run this once, right before the pass page goes public, so the first real pass is 0001. It deletes every pass.

```sql
truncate table public.souls restart identity;
```

Remove one person on request (the people they referred keep their passes):

```sql
delete from public.souls where email = 'person@example.com';
```

## 6. What the site calls

| Function | Returns | Errors (`message`) |
|---|---|---|
| `claim_pass(p_email, p_whatsapp?, p_city?, p_ref?)` | `{ "number": 12, "isNew": true, "referrals": 0 }` | `INVALID_EMAIL`, `INVALID_WHATSAPP` |
| `pass_stats(p_number)` | `{ "number": 12, "referrals": 3, "top": [{ "number": 4, "referrals": 9 }] }` or `null` | none |
| `submit_demo(p_link, p_name?, p_city?)` | `{ "ok": true }` | `INVALID_LINK` |

`top` holds at most ten passes, only ones with at least one referral, most referrals first, ties to the lower number. No function returns an email, phone number or city. `p_ref` must be a number or null; an unknown or own number is ignored.

Admin (`/kaizen/`, signed in): `rpc('is_admin')` returns true or false; `soul_board` has `number, email, whatsapp, city, referred_by, created_at, referrals`; `site_content` row `key = 'site'` holds the content JSON (must be a JSON object); uploads go to bucket `site-media` (images only, 10 MB each), public URL `https://<ref>.supabase.co/storage/v1/object/public/site-media/<path>`.

## 7. Known ceilings

- No rate limit, no captcha. A script can create junk passes and junk demos.
- No email or WhatsApp verification. Referral counts are unverified sign-ups, and throwaway addresses inflate the board. Add verification plus a captcha or per-IP throttle before any reward depends on the leaderboard.
- Typing someone's email returns their pass number and referral count (never their details), which also shows that the address is on the list.
- Two requests for the same new email at the same instant skip one pass number. Gaps are harmless.
- `pass_stats` counts all referrals on every call. Fine for tens of thousands of passes.
- Admins can read passes and demos but cannot edit or delete them from `/kaizen/`. Use the SQL above.
- Tested on a real Postgres engine (PGlite) with Supabase's roles, `auth.uid()` and the storage tables stubbed. The storage policy and the login path have not run against a real Supabase project: do the smoke test after applying, then upload one image from `/kaizen/`.
