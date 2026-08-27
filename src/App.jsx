import { useState } from 'react'

export default function App(){
  const [copied,setCopied]=useState(false)
  const cmd='curl -fsSL https://code.hystersis.com/install.sh | sh'
  const fig=` ██░ ██▓██   ██▓  ██████ ▄▄▄█████▓▓█████  ██▀███   ██████  ██▓  ██████ 
▓██░ ██▒▒██  ██▒▒██    ▒ ▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒▒██    ▒ ▓██▒▒██    ▒ 
▒██▀▀██░ ▒██ ██░░ ▓██▄   ▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒░ ▓██▄   ▒██▒░ ▓██▄   
░▓█ ░██  ░ ▐██▓░  ▒   ██▒░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄    ▒   ██▒░██░  ▒   ██▒
░▓█▒░██▓ ░ ██▒▓░▒██████▒▒  ▒██▒ ░ ░▒████▒░██▓ ▒██▒▒██████▒▒░██░▒██████▒▒`

  return (
    <div style={{background:'#000', color:'#fff', fontFamily:'JetBrains Mono, monospace', minHeight:'100vh', padding:'12px'}}>
      <style>{`pre{margin:0} a{color:#fff} ::selection{background:#fff;color:#000}`}</style>
      <div style={{maxWidth:'760px', margin:'0 auto', border:'1px solid #fff', padding:'0'}}>
        {/* top bar */}
        <pre style={{fontSize:'11px', lineHeight:'14px', padding:'8px 10px', borderBottom:'1px solid #fff', margin:0, display:'flex', justifyContent:'space-between'}}>
{`hystersis                              [Install]  [GitHub]`}</pre>

        <pre style={{fontSize:'22px', lineHeight:'22px', padding:'16px 12px 4px', whiteSpace:'pre', textAlign:'left', fontWeight:800, letterSpacing:'0.06em'}}>{`HYSTERSIS`}</pre>
        <pre style={{fontSize:'13px', lineHeight:'15px', padding:'0 12px', textAlign:'left', letterSpacing:'0.12em'}}>{`YOUR CODEBASE
UNDERSTOOD.

terminal-based AI coding agent — Rust-native.
Full-screen TUI. Same UI you run locally.`}</pre>

        {/* curl box */}
        <pre style={{fontSize:'10px', lineHeight:'14px', margin:'16px 12px 0', border:'1px solid #fff', padding:'8px 10px', whiteSpace:'pre-wrap', wordBreak:'break-all', textAlign:'left'}}>{`$ ${cmd}`}</pre>
        <div style={{textAlign:'center', margin:'8px 0 0'}}>
          <button onClick={()=>{navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(()=>setCopied(false),1200)}} style={{background:'#fff', color:'#000', border:'1px solid #fff', padding:'4px 10px', fontFamily:'JetBrains Mono, monospace', fontSize:'11px', cursor:'pointer', fontWeight:700}}>{copied?'[ COPIED ]':'[ COPY ]'}</button>
        </div>
        <pre style={{fontSize:'9px', opacity:0.5, textAlign:'center', margin:'6px 0 0', padding:'0 12px'}}>{`hystersis --version  ·  cargo run -p hystersis-pager-bin  ·  macOS / Linux / Windows`}</pre>

        {/* about */}
        <pre style={{fontSize:'11px', lineHeight:'16px', padding:'18px 12px 0', whiteSpace:'pre-wrap'}}>{`> about

  Hystersis is an engineering-driven terminal agent.
  Pinned toolchain, sandboxed tools, full-screen TUI
  with checkpointing. Reads your codebase before it
  touches it.

  +-- RUST-NATIVE, NO WRAPPER ---------------------+
  | Workspace-aware edits, hunk tracking, VCS     |
  | safety, fast worktree, process-scope enroll. |
  +-----------------------------------------------+
  | TUI + HEADLESS + ACP                          |
  | Same agent in TUI, headless for CI, or via    |
  | ACP. Scrollback, modals, diff done right.     |
  +-----------------------------------------------+
  | TOOLS THAT RUN                                |
  | Terminal, file edits, search, MCP, skills,    |
  | hooks — checkpointed. Long tasks via queue.   |
  +-----------------------------------------------+`}</pre>

        {/* tui preview ascii */}
        <pre style={{fontSize:'11px', lineHeight:'14px', margin:'14px 12px 0', border:'1px solid #fff', padding:'10px', whiteSpace:'pre-wrap'}}>{`+--------------------------------------------------+
| hystersis — xai-hystersis-pager       [● ready] |
+--------------------------------------------------+
| > Refactor auth middleware to use new store      |
|                                                  |
| · [scan] crates/codegen/hystersis-agent ...      |
| · [edit] src/builder.rs +42 -8                   |
| · [check] cargo check ✔ 1.79s · [test] 12 passed|
|                                                  |
| -- Done. 2 files edited, 0 conflicts.            |
+--------------------------------------------------+
| [Enter] send  [/] commands  [Ctrl+C] interrupt   |
+--------------------------------------------------+`}</pre>

        <pre style={{fontSize:'10px', lineHeight:'14px', padding:'14px 12px 0', whiteSpace:'pre-wrap'}}>{`> playground

  Paste the curl. Run hystersis. Ask it anything.

  > Refactor auth middleware to use session store
  > Explain this codebase in one page
  > Find where we handle checkpointing

  It reads, edits, checks — then shows you the diff.`}</pre>

        <pre style={{fontSize:'11px', lineHeight:'14px', margin:'16px 12px 0', border:'1px solid #fff', padding:'10px', textAlign:'center'}}>{`[ Install now ]    [ GitHub -> ]`}</pre>

        <pre style={{fontSize:'9px', opacity:0.5, padding:'14px 12px 10px', borderTop:'1px solid #fff', marginTop:'16px', display:'flex', justifyContent:'space-between'}}>
{`© 2026 Hystersis`}</pre>
      </div>
    </div>
  )
}
