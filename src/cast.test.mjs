import test from 'node:test'
import assert from 'node:assert/strict'
import { castTotal, sliceCast } from './cast.js'

const lines = [{ text: 'ab' }, { text: '' }, { text: 'cde' }]

test('total counts every character', () => {
  assert.equal(castTotal(lines), 5)
})

test('nothing typed yet — caret on the first line', () => {
  const r = sliceCast(lines, 0)
  assert.deepEqual(r.map((l) => l.shown), ['', '', ''])
  assert.deepEqual(r.map((l) => l.caret), [true, false, false])
})

test('mid-stream — caret on the first incomplete line, blanks skipped', () => {
  const r = sliceCast(lines, 3)
  assert.deepEqual(r.map((l) => l.shown), ['ab', '', 'c'])
  assert.deepEqual(r.map((l) => l.caret), [false, false, true])
})

test('finished — caret parks on the last line', () => {
  const r = sliceCast(lines, 5)
  assert.deepEqual(r.map((l) => l.shown), ['ab', '', 'cde'])
  assert.deepEqual(r.map((l) => l.caret), [false, false, true])
})

test('overrun never spills past the end', () => {
  assert.deepEqual(sliceCast(lines, 99).map((l) => l.shown), ['ab', '', 'cde'])
})
