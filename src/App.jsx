import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { castTotal, sliceCast } from './cast.js'

const INSTALL = 'curl -fsSL https://code.hystersis.com/install.sh | sh'
const REPO = 'https://github.com/Himan-D/code'

// Replace with a real `asciinema rec` capture: one entry per line, in order.
const CAST = [
  { text: '$ hystersis', tone: 't1' },
  { text: '· session  ~/src/api · toolchain pinned · sandbox on', tone: 't3' },
  { text: '', tone: 't3' },
  { text: '> refactor auth middleware to the new session store', tone: 't1' },
  { text: '· scan     148 files · 12.4k symbols · 0.6s', tone: 't2' },
  { text: '· plan     2 edits · 1 check · 1 test', tone: 't2' },
  { text: '· edit     src/auth/middleware.rs', tone: 't2' },
  { text: '    -   let user = ctx.session_id();', tone: 't3' },
  { text: '    +   let user = store.resolve(ctx.session_id())?;', tone: 't1' },
  { text: '· edit     src/auth/session.rs            +11  -0', tone: 't2' },
  { text: '· check    cargo check                    ok 1.79s', tone: 't2' },
  { text: '· test     cargo test                     12 passed', tone: 't2' },
  { text: '', tone: 't3' },
  { text: '- done · 2 files · 0 conflicts · checkpoint #7', tone: 't1' },
  { text: '  [d] diff    [k] keep    [u] undo', tone: 't3' }
]

const FEATURES = [
  ['01', 'Rust-native, no wrapper', 'Workspace-aware edits, hunk tracking, VCS safety, fast worktree, process-scope enroll.'],
  ['02', 'TUI · headless · ACP', 'The same agent in a full-screen TUI, headless in CI, or embedded over ACP. Scrollback, modals, diffs done right.'],
  ['03', 'Tools that run', 'Terminal, file edits, search, MCP, skills, hooks — every step checkpointed. Long tasks go on the queue.']
]

// Wall-clock length of the capture, for the player's read-out.
const CAST_SECONDS = 74
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const ASKS = [
  'Refactor auth middleware to the session store',
  'Explain this codebase in one page',
  'Find where we handle checkpointing'
]

function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}

function useInView(ref) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } },
      { rootMargin: '0px 0px -18% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return seen
}

function useTypewriter(text, active, speed = 34) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (reduce) { setN(text.length); return }
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [active, text, speed, reduce])
  const shown = text.slice(0, n)
  return { shown, done: n >= text.length, caret: active && n < text.length }
}

function useScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return p
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { /* not available over http or without permission — fall through */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

function Block({ id, prompt, children }) {
  const ref = useRef(null)
  const seen = useInView(ref)
  const { shown, done, caret } = useTypewriter(prompt, seen)

  return (
    <section className="block" id={id} ref={ref}>
      <h2 className="prompt">
        <span aria-hidden="true">&gt;</span>
        <span className="prompt-text">
          {shown}
          {caret && <i className="caret" aria-hidden="true" />}
        </span>
      </h2>
      <div className={done ? 'answer in' : 'answer'}>{children}</div>
    </section>
  )
}

function CopyButton({ className = 'btn btn--sm', idle = '[ copy ]' }) {
  const [state, setState] = useState('idle')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = useCallback(async () => {
    const ok = await copyText(INSTALL)
    setState(ok ? 'done' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 1600)
  }, [])

  const label = state === 'done' ? '[ copied ]' : state === 'failed' ? '[ press ⌘C ]' : idle
  return (
    <button type="button" className={className} onClick={onClick} aria-label="Copy the install command">
      {label}
    </button>
  )
}

function Cast() {
  const ref = useRef(null)
  const seen = useInView(ref)
  const reduce = useReducedMotion()
  const total = useMemo(() => castTotal(CAST), [])
  const [n, setN] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!seen || reduce || !playing) return
    const id = setInterval(() => setN((v) => (v > total + 90 ? 0 : v + 3)), 26)
    return () => clearInterval(id)
  }, [seen, reduce, playing, total])

  const at = reduce ? total : Math.min(n, total)
  const lines = sliceCast(CAST, at)
  const pct = total ? Math.round((at / total) * 100) : 0
  const clock = `${mmss(Math.round((pct / 100) * CAST_SECONDS))} / ${mmss(CAST_SECONDS)}`

  return (
    <div className="cast" ref={ref}>
      <div className="cast-head">
        <b>recorded session · asciicast</b>
        <span>{clock}</span>
      </div>
      <div className="cast-body">
        {lines.map((l, i) => (
          <div key={i} className={`cast-line ${l.tone}`}>
            {l.shown}
            {l.caret && !reduce && <i className="caret" aria-hidden="true" />}
          </div>
        ))}
      </div>
      <div className="cast-foot">
        <button type="button" className="btn btn--quiet" onClick={() => { setN(0); setPlaying(true) }}>
          [ replay ]
        </button>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={!playing}
        >
          {playing ? '[ pause ]' : '[ play ]'}
        </button>
        <div className="bar" role="presentation">
          <div style={{ width: `${pct}%` }} />
        </div>
        <span className="cast-note">real capture · not a video</span>
      </div>
    </div>
  )
}

export default function App() {
  const progress = useScrollProgress()

  return (
    <>
      <header className="hdr">
        <div className="wrap hdr-in">
          <a className="brand" href="#top">
            <span className="brand-mark">H</span>
            <span className="brand-name">hystersis</span>
            <span className="brand-meta">~/src/api · ● ready</span>
          </a>
          <nav className="nav">
            <a className="nl" href="#about">about</a>
            <a className="nl" href="#demo">demo</a>
            <a className="nl" href={REPO} target="_blank" rel="noreferrer">github</a>
            <a className="nl nl--cta" href="#install">[ install ]</a>
          </nav>
        </div>
        <div className="hdr-bar" style={{ width: `${progress * 100}%` }} />
      </header>

      <main>
        <section className="wrap hero" id="top">
          <p className="kicker rise">&gt; rust-native terminal agent</p>
          <h1 className="wordmark rise" style={{ '--d': '.06s' }}>HYSTERSIS</h1>
          <p className="tagline rise" style={{ '--d': '.12s' }}>Your codebase, understood.</p>
          <p className="lead rise" style={{ '--d': '.18s' }}>
            A full-screen terminal UI that reads your repo before it touches it. Pinned toolchain,
            sandboxed tools, checkpointed edits — the same agent in your terminal, in CI, or embedded over ACP.
          </p>

          <div className="cmd rise" style={{ '--d': '.24s' }}>
            <div className="cmd-head">
              <b>install</b>
              <i>macos · linux · windows</i>
            </div>
            <div className="cmd-row">
              <span aria-hidden="true">$</span>
              <code>{INSTALL}</code>
              <CopyButton />
            </div>
          </div>

          <p className="hint rise" style={{ '--d': '.32s' }}>
            <span aria-hidden="true">↓</span>
            <span>keep scrolling — the rest of this page is a session</span>
          </p>
        </section>

        <div className="wrap">
          <Block id="about" prompt="what is hystersis?">
            <p className="answer-lead">
              An engineering-driven terminal agent. It scans, plans, edits and verifies — and shows you
              the diff before anything lands.
            </p>
            <div className="cards">
              {FEATURES.map(([n, title, body]) => (
                <article className="card" key={n}>
                  <p className="card-n">{n}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </Block>

          <Block id="demo" prompt="show me a real run">
            <Cast />
          </Block>

          <Block id="ask" prompt="what should I ask it?">
            <p className="answer-lead">Anything you would ask the engineer who wrote it.</p>
            <div className="asks">
              {ASKS.map((a) => (
                <div className="ask" key={a}>
                  <span aria-hidden="true">&gt;</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
            <p className="lead" style={{ marginTop: 18 }}>
              It reads, edits and checks — then shows you the diff before you keep it.
            </p>
          </Block>

          <Block id="install" prompt="how do I install it?">
            <div className="cmd" style={{ marginTop: 0, maxWidth: '100%' }}>
              <div className="cmd-head">
                <b>install</b>
                <i>macos · linux · windows</i>
              </div>
              <div className="cmd-row">
                <span aria-hidden="true">$</span>
                <code>{INSTALL}</code>
                <CopyButton />
              </div>
            </div>

            <div className="cta" style={{ marginTop: 20 }}>
              <div>
                <h2>One line. Then it knows your repo.</h2>
                <p>Free · open source · macOS, Linux and Windows</p>
              </div>
              <div className="cta-actions">
                <CopyButton className="btn btn--solid" idle="[ copy install command ]" />
                <a className="btn" href={REPO} target="_blank" rel="noreferrer">[ github → ]</a>
              </div>
            </div>

            <div className="strip">
              <span>hystersis --version</span>
              <span>cargo run -p hystersis-pager-bin</span>
              <span>no telemetry</span>
            </div>
          </Block>
        </div>
      </main>

      <footer className="ftr">
        <div className="wrap ftr-in">
          <span>^C · session ended</span>
          <span className="ftr-end">
            <a href="#top">[ ↑ top ]</a>
            <span>© 2026 hystersis · code.hystersis.com</span>
          </span>
        </div>
      </footer>
    </>
  )
}
