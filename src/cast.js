// Pure slicing for the asciicast player: given N characters typed so far,
// work out what each line shows and which line owns the caret.

export const castTotal = (lines) => lines.reduce((a, l) => a + l.text.length, 0)

export function sliceCast(lines, n) {
  let left = Math.max(0, n)
  let placed = false

  const out = lines.map((l) => {
    const take = Math.min(l.text.length, Math.max(0, left))
    const caret = !placed && take < l.text.length
    if (caret) placed = true
    left -= l.text.length
    return { ...l, shown: l.text.slice(0, take), caret }
  })

  // Cast finished: park the caret on the last line instead of dropping it.
  if (!placed && left >= 0 && out.length) out[out.length - 1].caret = true
  return out
}
