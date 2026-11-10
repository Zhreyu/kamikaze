// Run: bun src/components/kaizen/util.check.ts
import { move, toCsv } from './util'

const eq = (got: unknown, want: unknown, what: string) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)
}

// formula cells are neutralised, numbers are left alone
eq(toCsv([['=1+1', '+919999999999', '-2', '@SUM(A1)', '\t=1', 12, -3, null]]), `'=1+1,'+919999999999,'-2,'@SUM(A1),'\t=1,12,-3,`, 'formula cells')
// quoting: commas, quotes, newlines; a formula that also needs quoting gets both
eq(toCsv([['a,b', 'say "hi"', 'two\nlines', '=HYPERLINK("x","y")']]), `"a,b","say ""hi""","two\nlines","'=HYPERLINK(""x"",""y"")"`, 'quoting')
eq(toCsv([['a'], ['b']]), 'a\r\nb', 'rows')

eq(move([1, 2, 3], 0, 1), [2, 1, 3], 'move down')
eq(move([1, 2, 3], 2, -1), [1, 3, 2], 'move up')
eq(move([1, 2, 3], 0, -1), [1, 2, 3], 'move past the start')
eq(move([1, 2, 3], 2, 1), [1, 2, 3], 'move past the end')

console.log('kaizen util: ok')
