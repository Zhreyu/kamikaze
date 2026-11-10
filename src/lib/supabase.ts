// Public pages talk to Supabase with plain fetch. supabase-js is imported only under kaizen/.
// || not ??: CI passes '' when the secret is unset.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://puirfuvowwnqpopdnyfv.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/** Call a Postgres function through PostgREST. Throws Error(<PostgREST message, e.g. 'INVALID_EMAIL'> or 'NETWORK'). */
export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
  } catch {
    throw new Error('NETWORK')
  }
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error((body as { message?: string } | null)?.message || 'NETWORK')
  return body as T
}
