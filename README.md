# Kamikaze

The site for Kamikaze, an independent techno collective: the next date, the sign-up for the venue drop (a numbered soul pass with a referral link), the OVERRIDE recap, the artists.

Next.js 15 (App Router) exported as static HTML. No server: forms and the pass talk to Supabase from the browser.

## Routes

| Route | What |
| --- | --- |
| `/` | Home |
| `/events/` | Upcoming and past events |
| `/events/[slug]/` | Recap of a finished event (today: `override`) |
| `/artists/`, `/artists/[slug]/` | Roster and profiles |
| `/about/`, `/contact/`, `/privacy/` | About, contact routes and demo form, privacy |
| `/pass/` | Sign-up and the pass (`?ref=<number>` credits a referral) |
| `/kaizen/` | Admin (Supabase login). Not linked, not indexed |

## Run

```sh
bun install
bun dev                 # http://localhost:3000
bun scripts/check.ts    # asserts for dates, past/upcoming, media URLs
bunx tsc --noEmit && bun run lint
bun run build           # static export to out/
```

Supabase: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (and as repository secrets for the deploy). Without the key the site still builds and shows its built-in content; forms cannot send. Database setup is in `supabase/README.md`.

## Two base paths

| Host | Build | Base path |
| --- | --- | --- |
| GitHub Pages, `https://zhreyu.github.io/kamikaze/` | `bun run build:pages` (run by `.github/workflows/deploy.yml` on every push to `main`) | `/kamikaze` |
| Vercel, `https://www.kamikaze.host` | `bun run build` | none |

Never hardcode either. Pages link with `next/link`. Every other URL to a file in `public/` goes through `getAssetPath()` (`src/lib/basePath.ts`), or `mediaUrl()` (`src/data/content.ts`) when it may also be an uploaded file. Fonts load through `next/font/local` from `src/fonts/`.

## Content and photos

- `src/data/events.ts`: events. A field left out is shown as sealed. Past or upcoming is worked out from the date.
- `src/data/artists.ts`: roster and bios.
- `src/data/content.ts`: the OVERRIDE photo set, tracks, and which photo sits in which slot. These are the built-in defaults; whatever is saved in `/kaizen/` replaces them at runtime.
- `public/events/override/dsc<id>-800.webp` and `-2000.webp`: event photos.
- `public/artists/<slug>-800.webp` and `-1600.webp`: portraits.

Export a new photo (from a JPEG or PNG; keep each file under 300 KB):

```sh
cwebp -q 80 -m 6 -resize 2000 0 photo.jpg -o public/events/override/dsc01234-2000.webp
cwebp -q 80 -m 6 -resize 800 0 photo.jpg -o public/events/override/dsc01234-800.webp
```

Then add a line for it in `src/data/content.ts` with its alt text. `cwebp` ignores camera rotation: if a photo comes out sideways, rotate it first (`sips -r 90 photo.jpg`).
