import type { Metadata } from 'next'
import { EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What the pass and demo forms collect, where it is kept, what tracking runs on the site and how to get your details deleted.',
  alternates: { canonical: '/privacy/' },
}

// Copy deck section 7, verbatim. When any of it changes, change the date below too.
const UPDATED = 'Last updated Tue 10 Nov 2026.'
const sections: [string, string[]][] = [
  [
    'The short version',
    ['You type things into two forms and we keep them in one database. Two tracking tools load on every page. Nothing is sold. Ask and we delete what you gave us.'],
  ],
  [
    'What you give us',
    [
      'The pass form asks for your email. A WhatsApp number and a city are optional. Signing up gives you a pass number, and we keep it with what you typed.',
      'The demo form asks for a SoundCloud link, an artist name and a city.',
      'If you email us, we have your address and what you wrote.',
    ],
  ],
  [
    'What we use it for',
    [
      'Your email, and your WhatsApp number if you gave one, are how the venue reaches you before it goes public and how we tell you about Kamikaze events. Your city tells us where the list is.',
      'A demo is for listening. The name and the city tell us who sent it and from where.',
      'None of it is sold.',
    ],
  ],
  [
    'Your pass and your link',
    [
      'Your pass number is your place in the order people signed up. Your link carries that number, so anyone you send it to can see it.',
      'When someone signs up through your link, we save your pass number with their sign-up and your count goes up by one. You see the count. You do not see who they are.',
      'The top ten shows pass numbers and counts. It never shows an email, a phone number or a city.',
      'If someone types your email into the pass form, they are shown your pass number and your count, and nothing else.',
    ],
  ],
  [
    'Where it is kept',
    ['Both forms save to Supabase, a hosted database. Only the Kamikaze team can read it.', 'Nothing deletes it automatically. It stays until you ask us to remove it.'],
  ],
  [
    'What stays in your browser',
    [
      "One thing: your pass number, so your pass shows when you come back. No email or phone number is saved there. Clear this site's data and the number is gone from that browser. Your place on the list stays.",
    ],
  ],
  [
    'Tracking',
    [
      'Two tracking tools load on every page, whether or not you sign up.',
      'Vercel Analytics counts page views.',
      'The Meta Pixel tells Meta, the company behind Instagram and Facebook, which pages you opened. Meta can set a cookie and link the visit to an account you have with them. It can use that for advertising.',
      'Nothing asks you first. If your browser blocks both, the site works the same.',
      'The companies that serve these pages and the database see your IP address, as they do for any website.',
    ],
  ],
  [
    'Links that leave the site',
    [
      'Links to Instagram and SoundCloud go to those companies, and their rules apply there. This site never takes payment. When tickets go on sale, they are sold on another site.',
    ],
  ],
  [
    'Getting your details deleted',
    [
      `Email ${EMAIL} and ask. Tell us the email you signed up with, or the SoundCloud link you sent, so we can find it. We delete it. A deleted sign-up takes its pass with it.`,
      'You can ask what we hold about you at the same address.',
    ],
  ],
  ['Changes', ['When this page changes, the date at the top changes with it.']],
]

/** Turns the contact address inside a paragraph into a mailto link. */
const withMail = (text: string) => {
  const [before, after] = text.split(EMAIL)
  return after === undefined ? (
    text
  ) : (
    <>
      {before}
      <a className="link" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      {after}
    </>
  )
}

export default function Privacy() {
  return (
    <div data-sigil="off" className="wrap pb-10 pt-4 md:pb-24 md:pt-10">
      <h1 className="rit pl-[0.13em] text-[min(18vw,80px)] md:text-[min(11vw,160px)]">Privacy</h1>
      <p className="mt-5 max-w-[65ch] md:mt-10 md:text-[20px]">What this site collects, where it is kept and how to get it deleted.</p>
      <p className="mono dim mt-3">{UPDATED}</p>
      <div className="mt-10 md:mt-16">
        {sections.map(([heading, paragraphs]) => (
          <section key={heading} className="border-t border-hair py-7 last:border-b md:grid md:grid-cols-12 md:gap-x-10 md:py-10">
            <h2 className="rit text-[min(7.7vw,30px)] leading-none md:col-span-5 md:text-[min(3.2vw,40px)]">{heading}</h2>
            <div className="mt-4 flex max-w-[65ch] flex-col gap-[14px] md:col-span-7 md:mt-0">
              {paragraphs.map((p) => (
                <p key={p}>{withMail(p)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
