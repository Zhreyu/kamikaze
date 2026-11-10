// Run: bun src/components/pass/pass.check.ts   (the client-side rules must agree with claim_pass in supabase/migrations)
import assert from 'node:assert/strict'
import { pad, parseRef, whatsapp } from './story'

assert.equal(pad(12), '0012')
assert.equal(pad(12345), '12345')

assert.equal(parseRef('412'), 412)
for (const bad of [null, '', '0', '-3', '4.5', '12abc', ' 12', '1e3', '9999999999']) assert.equal(parseRef(bad), null, `ref ${bad}`)

for (const blank of ['', '  ', '+', '+91', '+ 91', '+971']) assert.equal(whatsapp(blank), null, `blank ${blank}`)
assert.equal(whatsapp('+91 98765 43210'), '+919876543210')
assert.equal(whatsapp('+1 (415) 555-0199'), '+14155550199')
for (const bad of ['9876543210', '91 98765 43210', '+0123456789', '+91 98765', '+91abc9876543', '+1234567890123456']) assert.equal(whatsapp(bad), false, `bad ${bad}`)

console.log('pass checks ok')
