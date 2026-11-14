'use client'
import { useEffect, useMemo, useState } from 'react'
import { SUPABASE_ANON_KEY } from '@/lib/supabase'
import { pad4, toCsv, type Db } from './util'

type Soul = { number: number; email: string; whatsapp: string | null; city: string | null; referred_by: number | null; created_at: string; referrals: number }
type Loaded = { rows: Soul[]; total: number; referred: number }

const CAP = 1000
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// ponytail: no backend in this build (no anon key) -> a fixed demo set so the tab is reviewable. Real deploys set the key and hit Supabase.
const DEMO = !SUPABASE_ANON_KEY
const demoData = (): Loaded => {
  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Goa', 'Pune', 'Hyderabad', 'Chennai', null]
  const names = ['aditi', 'rohan', 'kabir', 'meera', 'arjun', 'zara', 'dev', 'ira', 'veer', 'nisha', 'sahil', 'tara', 'yash', 'anya', 'raghav']
  const rows: Soul[] = []
  for (let n = 42; n >= 1; n--) {
    const name = names[n % names.length]
    const refd = n > 1 && n % 3 === 0 ? ((n * 7) % (n - 1)) + 1 : null // some came through a referral
    rows.push({
      number: n,
      email: `${name}${n}@${n % 2 ? 'gmail.com' : 'proton.me'}`,
      whatsapp: n % 4 ? `+91 9${String(100000000 + n * 918273).slice(0, 9)}` : null,
      city: cities[n % cities.length],
      referred_by: refd,
      referrals: n % 5 === 0 ? (n % 11) + 1 : 0, // a handful of real referrers for the leaderboard
      created_at: new Date(Date.parse('2026-11-01T18:00:00+05:30') + (42 - n) * 36e5).toISOString(),
    })
  }
  return { rows, total: rows.length, referred: rows.filter((r) => r.referred_by != null).length }
}

// Below md every row is a small block (number + date, email, WhatsApp + city, then two labelled counts); from md it is a plain table.
const td = 'md:border-t md:border-hair md:px-3 md:py-2.5 md:align-top'
const labelled = `${td} max-md:before:mr-2 max-md:before:font-mono max-md:before:text-[12px] max-md:before:font-medium max-md:before:uppercase max-md:before:tracking-[0.08em] max-md:before:text-dim max-md:before:content-[attr(data-label)]`
const th = 'mono dim whitespace-nowrap border-b border-line px-3 py-2 text-left font-medium'

export default function Passes({ db }: { db: Db }) {
  const [data, setData] = useState<Loaded | 'failed'>()
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (DEMO) return setData(demoData())
    let live = true
    // ponytail: one fetch of the newest 1000 rows; paginate (and move the filter and the top list to the server) when the list outgrows it
    Promise.all([
      db.from('soul_board').select('*', { count: 'exact' }).order('number', { ascending: false }).limit(CAP),
      db.from('soul_board').select('number', { count: 'exact', head: true }).not('referred_by', 'is', null),
    ]).then(
      ([list, ref]) => {
        if (!live) return
        if (list.error) return setData('failed')
        const rows = (list.data ?? []) as Soul[]
        setData({ rows, total: list.count ?? rows.length, referred: ref.count ?? rows.filter((r) => r.referred_by != null).length })
      },
      () => live && setData('failed'),
    )
    return () => {
      live = false
    }
  }, [db])

  const rows = data && data !== 'failed' ? data.rows : undefined
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!rows || !q) return rows ?? []
    return rows.filter((r) => String(r.number) === q.replace(/^0+/, '') || pad4(r.number).includes(q) || r.email.toLowerCase().includes(q) || (r.city ?? '').toLowerCase().includes(q))
  }, [rows, filter])
  const top = useMemo(() => (rows ?? []).filter((r) => r.referrals > 0).sort((a, b) => b.referrals - a.referrals || a.number - b.number).slice(0, 10), [rows])

  if (!data)
    return (
      <p role="status" className="mono dim py-8">
        Loading passes
      </p>
    )
  if (data === 'failed')
    return (
      <p role="alert" className="py-8">
        Could not load passes. Reload to try again.
      </p>
    )

  const exportCsv = () => {
    const head = ['Number', 'Email', 'WhatsApp', 'City', 'Referred by', 'Referrals', 'Signed up']
    const csv = toCsv([head, ...data.rows.map((r) => [r.number, r.email, r.whatsapp, r.city, r.referred_by, r.referrals, r.created_at])])
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })) // BOM: Excel reads it as UTF-8
    a.download = `kamikaze-passes-${new Date().toLocaleDateString('en-CA')}.csv` // en-CA = YYYY-MM-DD, local date
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  return (
    <div className="md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <aside className="md:sticky md:top-[calc(var(--nav-h)+16px)] md:order-2">
        <dl>
          <div className="rowlink">
            <dt className="mono dim">Passes</dt>
            <dd className="num text-[22px]">{data.total}</dd>
          </div>
          <div className="rowlink border-b border-hair">
            <dt className="mono dim">Came through a referral</dt>
            <dd className="num text-[22px]">{data.referred}</dd>
          </div>
        </dl>
        <h2 className="mono mt-7">Top referrers</h2>
        {top.length ? (
          <ol className="mt-2">
            {top.map((r) => (
              <li key={r.number} className="flex items-baseline gap-3 border-t border-hair py-2.5 last:border-b">
                <span className="num">{pad4(r.number)}</span>
                <span className="min-w-0 flex-1 truncate dim">{r.email}</span>
                <span className="num">{r.referrals}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="dim mt-2">No referrals yet.</p>
        )}
      </aside>

      <div className="mt-9 min-w-0 md:mt-0">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[220px] flex-1">
            <span className="mono dim mb-1.5 block">Filter by number, email or city</span>
            <input className="field" type="search" inputMode="search" enterKeyHint="search" autoComplete="off" autoCapitalize="none" spellCheck={false} value={filter} onChange={(e) => setFilter(e.target.value)} />
          </label>
          <button type="button" className="ghost mono min-h-[54px]" disabled={!data.rows.length} onClick={exportCsv}>
            Export CSV
          </button>
        </div>
        {data.total > data.rows.length && <p className="mono dim mt-3">Showing the newest 1000 passes.</p>}

        {!shown.length ? (
          <p role="status" className="dim mt-6 border-t border-hair pt-5">
            {data.rows.length ? 'No passes match this filter.' : 'No passes yet.'}
          </p>
        ) : (
          <div className="mt-5 md:overflow-x-auto">
            <table className="w-full border-collapse max-md:block">
              <thead className="max-md:hidden">
                <tr>
                  <th scope="col" className={th}>Number</th>
                  <th scope="col" className={th}>Email</th>
                  <th scope="col" className={th}>WhatsApp</th>
                  <th scope="col" className={th}>City</th>
                  <th scope="col" className={th}>Referred by</th>
                  <th scope="col" className={`${th} text-right`}>Referrals</th>
                  <th scope="col" className={th}>Signed up</th>
                </tr>
              </thead>
              <tbody className="max-md:block">
                {shown.map((r) => (
                  <tr key={r.number} className="max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-1 max-md:border-t max-md:border-hair max-md:py-3">
                    <td className={`${td} num max-md:order-1 max-md:text-[20px]`}>{pad4(r.number)}</td>
                    <td className={`${td} break-words max-md:order-3 max-md:col-span-2 max-md:min-w-0 max-md:[overflow-wrap:anywhere]`}>{r.email}</td>
                    <td className={`${td} max-md:order-4 md:whitespace-nowrap`}>{r.whatsapp ?? <span className="dim">-</span>}</td>
                    <td className={`${td} break-words max-md:order-4 max-md:min-w-0`}>{r.city ?? <span className="dim">-</span>}</td>
                    <td data-label="Referred by" className={`${labelled} max-md:order-4`}>{r.referred_by != null ? pad4(r.referred_by) : <span className="dim">-</span>}</td>
                    <td data-label="Referrals" className={`${labelled} max-md:order-4 tabular-nums md:text-right`}>{r.referrals}</td>
                    <td className={`${td} dim max-md:order-2 max-md:text-right md:whitespace-nowrap`}>{when(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
