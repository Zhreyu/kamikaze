# Product

<!-- impeccable:product-schema 1 -->

Source tags: [brief] the owner's design brief dated 2026-11-10; [repo] this repository; [design] the approved "Lights off" design canvas and live prototype. Untagged lines are [brief]. **Open** means undecided: leave it open, never fill it in.

## Platform

web

## Users

**Primary: ravers arriving from Instagram on a phone.** They tap a link in a story, bio or DM and the site opens inside Instagram's in-app browser, usually on a mid-range Android phone on mobile data. Their job is to find out what Kamikaze is and when the next night is, then get on the list. They must be able to:

- see the next date
- sign up for the venue drop (email, WhatsApp number with country code, city, nothing else)
- buy a ticket once tickets are on sale (the site links out)
- see OVERRIDE photos
- share the event

**Artists deciding whether to play.** They are judging the room and the company they would keep. They must be able to see who has played and read each profile, see what the room looked like at OVERRIDE, send a demo (SoundCloud link, artist name, city) and reach bookings. (Tasks derived from the brief's page specs.)

**Venues and partners checking that Kamikaze is real.** They must be able to verify one finished event (photos, lineup as played, turnout), read what Kamikaze will and will not do, and find a bookings contact. (Tasks derived from the brief's page specs.)

Named reviewer: Neeraj (role not recorded) signs off the artists page.

## Product Purpose

Kamikaze is an independent techno collective, established 2026, that runs its own nights. In its own words: "We're not a label or an agency. We're a collective that runs techno experiences we'd show up to ourselves." [repo: `src/data/siteCopy.ts`]

kamikaze.host exists to sell the next event on THU 31 DEC 2026 and to prove the first one happened.

The redesign is done when:

- A stranger can tell within five seconds what Kamikaze is and when the next event is.
- The date and sign-up button are on the first phone screen (390 by 844).
- Every screen has exactly one red element.
- Every image is a real Kamikaze photo.
- The home page, event page and recap work with no venue, no lineup and no event name.
- The pass is something the team would post on their own stories.
- Nothing on the site is untrue.
- Neeraj looks at the artists page and says it is the one.

## Positioning

- **The room is the headliner.** The crowd and the sound are the product, not a guest list around them.
- **No VIP. No backstage. One soul. One ticket. One room.** One ticket means one room: no VIP tables, no bottle-service tiers, no second-class access to a room already paid for. This is a rule Kamikaze operates by, and it is the promise that separates it from club nights.
- Lineups are booked on merit and demos are taken through the site. Kamikaze does not pad lineups for reach or take sponsorship that changes how the night runs. [repo: `ABOUT_STORY`]
- "Underground isn't an aesthetic. It's how people are treated once they're inside." [repo: `ABOUT_STORY`]
- Proof: the first event was planned for 250 people and 500 came. [design]

## Operating Context

- **Entry.** Instagram link, Instagram in-app browser, mid-range Android phone, 4G. Anything that breaks there is out. Desktop is secondary.
- **The list.** Signing up puts a person on the list. The venue is released to the list first, a day before everyone else, then to the public.
- **Tickets.** Sold on an outside platform. The site links out and never takes payment.
- **Sharing.** Visitors share to Instagram stories. The pass doubles as a story-sized image and a personal link.
- **Event lifecycle.** One event moves through six states: date only, lineup out, tickets live (adds price from, door time, age rule), venue revealed (adds venue, map link, set times), sold out (waiting list), past (poster, lineup as played, photos, mix). Past versus upcoming is worked out from the event date, never set by hand.
- **Archive.** Every finished event becomes a permanent entry with poster, lineup as played, photos and the mix. OVERRIDE is entry 001; the 31 December event becomes entry 002.
- **Launch plan (proposed dates, adjustable).** 2026-11-16 stop the bleeding on the current site; 2026-11-30 new site; 2026-12-10 pass, referrals, share images, lineup, tickets; 2026-12-31 event and venue reveal; 2027-01-05 recap as entry 002.

## Capabilities and Constraints

### Events (as of 2026-11-10)

| | Next | Past |
| --- | --- | --- |
| Number | Rite 002 [design] | Rite 001 [design] |
| Name | **Open** | OVERRIDE |
| Date | THU 31 DEC 2026 | SAT 05 SEP 2026 |
| City | **Open**, shown sealed | Trivandrum |
| Venue | **Open**, shown sealed | Name not recorded in repo or brief |
| Lineup | Not announced; announcement date **open** | SIREN, IBLIIIZ, ANSHE, JUNVON, plus the open-slot winner (name **open**) |
| Tickets | Not on sale; platform **open** | Sold through whatsaround.app [repo: `src/data/events.ts:33`] |
| Turnout | n/a | Planned for 250, 500 came [design] |

### What the site does

- Shows the next event, the past event recap, the artist roster and profiles, the About text, and contact routes (bookings, general, demos). Privacy page stays.
- Sign-up collects email, WhatsApp number with country code, and city.
- **Soul pass (planned, launch phase 2).** Signing up issues a numbered pass. The number is the order of sign-up. The pass is the confirmation screen, an Instagram-story image, and a personal link. Sign-ups through that link are counted against the pass. Reps are the passes with the most referrals; the pass page shows the number, the referral count and the top ten. Actions on the pass: "Save to story", "Copy my link".
- Demo submission asks for a SoundCloud link, artist name and city.
- Merch is out of the navigation until a real product exists.
- Today's backend [repo]: three Supabase edge functions, `contact-form` (table `contact_submissions`), `submit-demo` (table `demo_submissions`), `join-waitlist` (table `merch_waitlist`, email only). Nothing yet stores WhatsApp or city, numbers a pass or counts referrals.
- Referral limits: the site can count sign-ups per pass. Counting ticket sales per rep needs promo codes or tracking links from the ticket platform.

### Technical constraints

- Next.js 15 static export, Tailwind, Supabase for forms. No server at request time.
- Two deploy targets with different base paths [repo]: GitHub Pages builds with `NEXT_PUBLIC_BASE_PATH=/kamikaze` (`.github/workflows/deploy.yml`); kamikaze.host builds with an empty base path. Every asset URL must work under both.
- The build does not optimise images. Every photo is exported by hand to WebP or AVIF at 800px and 2000px wide, each file under 300 KB. Drive originals are 12 to 44 MB and cannot be used directly.
- Largest element visible within 2.5 seconds on 4G. No loading screen before content.
- The 3D sigil model (`public/logo.glb`, 1.5 MB) is optional, loads after the page, and never on first paint on a phone.
- One motion library only. The site ships GSAP and Framer Motion today.
- Every page has a title, description and share image; each event has its own 1200 by 630 share image with name and date. Add a sitemap.

### Terminology

- **Rite NNN**: the running number of a Kamikaze event (OVERRIDE is Rite 001). [design]
- **Soul pass**: the numbered sign-up pass, written "SOUL 0412".
- **The list**: everyone who has signed up.
- **Sealed**: a real detail that is withheld for now (venue, city, name). Never used for invented secrets.
- **Dates** are written "THU 31 DEC 2026", never "31.12.2026".

### Open decisions

- Which city hosts 31 December.
- What the event is called.
- The venue.
- When the lineup is announced, and who is on it.
- Which ticket platform, and whether it gives per-rep promo codes or tracking links.
- Ticket price, door time and age rule.
- What top referrers get (free entry, guest spot, merch).
- Who picks the 40 gallery photos, and by when.
- Whether the SD CyberPunk City display font is licensed for commercial use. The licence file in the repo is "Free For Personal Use" and requires the author's written permission for commercial use, naming websites for companies and material for events that charge admission. [repo: `public/sdcyberpunkcitydemo/1001fonts-sdcyberpunkcitydemo-eula.txt`]
- Who won the OVERRIDE open slot.
- Neeraj's Instagram artists reference (not yet supplied).
- Bookings address: the repo has `bookings@kamikaze.host` (`src/data/moto.ts:33`); the approved design shows `contact@kamikaze.host` for both bookings and general.

## Brand Commitments

**Identity.** The name Kamikaze, the wordmark, the sigil and the red sun (already recognisable from the OVERRIDE artwork).

**Lines that stay.**

- "The room is the headliner"
- "No VIP. No backstage. One soul. One ticket. One room."
- The About text that opens "We started with a complaint", in its three parts: how it started, what we do, what we will not do.
- Pass line: "ONE SOUL. ONE TICKET. ONE ROOM."
- Venue line: "Venue drops to the list first."

**Voice.**

- Buttons and navigation use plain words: Tickets, Sign up, Lineup, Archive, Artists, About. A visitor must know what a button does before pressing it.
- Attitude lives in headlines and body copy, written the way the About text already is: direct, first person plural, concrete complaints and concrete refusals.
- No lore labels on controls ("Seal binding", "Ascend", "Vessel").
- Nothing on the site states a fact that is not true: no fake capacity, uptime or status.
- No VIP, table or tier language anywhere, including on ticket buttons.

**Bans (the owner's "What not to do").**

- No terminal, hacker, CRT, telemetry or "system log" styling. That look is common and it hides the photos. (Recorded exception: the approved design keeps one CRT-framed OVERRIDE photo player. [design])
- No glitch or scramble effects on text.
- No loading or boot screen.
- No fake data, fake past events or fake products.
- No stock photography.
- No second accent colour.
- No war, aircraft or rising-sun-flag imagery. The name is enough; that imagery offends many people and limits where the brand can travel.
- No VIP, table or tier language.
- No app, game, shop or self-built ticketing. Those suit an established brand, not Kamikaze at event two.
- No merch page until there is a product photographed on a real person.

**References the owner named.** Teletech: take the archive and residents as permanent sections, numbered navigation, sign-up that asks for phone as well as email; leave the app, the game and the shop. Blurred Movement: take the photo-led layout, shows as simple rows, the "become a rep" pass; leave the single-artist structure.

## Evidence on Hand

- **OVERRIDE photos.** 100+ JPEGs in the owner's Drive folder, uncurated, no usage restrictions. 24 are exported to `public/events/override/` as `dscNNNNN-800.webp` and `dscNNNNN-2000.webp`, all under 300 KB [repo, not yet committed]: 07969, 08081, 08122, 08141, 08194, 08282, 08324, 08350, 08454, 08583, 08616, 08700, 08798, 08952, 09057, 09087, 09297, 09389, 09405, 09500, 09646, 09710, 09825, 09996.
- **OVERRIDE poster.** `public/events/override-cover.jpg`.
- **Sigil.** `public/logo-sigil.png`, plus the 3D model `public/logo.glb`. No vector version.
- **Artists** [repo: `src/data/artists.ts`, portraits in `public/artists/`]:
  - SIREN (SIREN333). India to Belgium. Hard groove / techno. Instagram `siren333_`, SoundCloud `siren333-music`.
  - IBLIIIZ. Kamikaze resident. Hard techno / schranz. Instagram `ibliiiz`, SoundCloud `ibliiiz`.
  - ANSHE (AN'SHE, Priyanka Das). India. Hard techno. Active since 2018. Instagram `anshemusic`, SoundCloud `anshemusic`.
  - JUNVON. Trivandrum. Peak-time techno. Instagram `junvon_`. No SoundCloud or mix on file.
- **Mix.** KAMIKAZE × IBLIIIZ, IMPACT 001: `https://soundcloud.com/ibliiiz/kamikaze-x-ibliiiz-impact-001`, cover `public/artists/ibliiiz-impact-001.png`. The only mix.
- **Channels.** Instagram `https://instagram.com/kamikaze.intl`; SoundCloud `https://soundcloud.com/k-a-m-i-k-a-z-e-6-6-6`; `contact@kamikaze.host`.
- **Press kits.** ANSHE and SIREN kits sit in `.agent/presskits/` (local, not committed). The Kamikaze press kit is with the owner and not in the repo.

**Known false or stale in the repo. Do not reuse.**

- `src/data/events.ts` marks OVERRIDE as upcoming with a live ticket link and "Venue TBA". The event ended on 5 September 2026.
- `src/data/events.ts` contains "[REDACTED SESSION]" dated 2025-05-17. It never happened.
- `src/data/merch.ts` is stock photos and invented prices. There is no product.
- The `open-slot` entry in `src/data/artists.ts` is a competition placeholder, not a person.
- Artist bios carry pre-event lines ("On OVERRIDE she holds Channel 01") written before the night. They are out of date.
- `public/artists/phase-fatale.jpg` and `public/artists/rebekah.jpeg` are referenced nowhere in the code and are not Kamikaze roster artists.

**Absent. Do not fabricate.** Testimonials, press quotes, attendee quotes, the OVERRIDE venue name, the open-slot winner, any Rite 002 detail beyond the date, ticket prices, set times, sponsors, partner logos, a second mix, merch.

## Product Principles

1. **Nothing untrue.** Every date, number, name and status on the site is real. A missing fact is shown as missing.
2. **The room is the proof.** Real photos of real Kamikaze nights carry the site. Content replaces decoration.
3. **One room, no hierarchy.** The promise applies to the product and its language as much as to the door: no tiers, no VIP wording, no privileged path except being on the list early.
4. **Complete while incomplete.** The site must hold up with no venue, no lineup and no event name. What is sealed is genuinely withheld, and signing up is what reveals it.
5. **The phone inside Instagram decides.** If it fails on a mid-range Android phone in Instagram's browser, it does not ship.

## Accessibility & Inclusion

- Body text 16px minimum; labels 12px minimum.
- Text contrast at least 4.5 to 1; large display type at least 3 to 1.
- Tap targets at least 44 by 44px.
- Every photo has alt text; artist portraits are named.
- Any flash effect fires once per user action, never more than three times in a second, never strobes automatically, and switches off with reduced motion (photos simply appear).
- Full keyboard access to navigation, gallery and forms.
- No war, aircraft or rising-sun-flag imagery.
