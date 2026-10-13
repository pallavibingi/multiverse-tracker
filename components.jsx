import { memo, useState } from 'react'
import { ChevronDown, ChevronUp, Search, RotateCcw, Trash2, Film, Info, ArrowUp } from 'lucide-react'
import { SECTIONS, where, jw } from './data'

export const Header = ({ f, setF, onReset, onClear }) => (
  <header className="hdr">
    <div className="brand"><Film aria-hidden size={26} /><h1>MULTIVERSE <span>TRACKER</span></h1></div>
    <div className="ctrls">
      <label className="search"><Search size={18} aria-hidden />
        <input type="search" placeholder="Search title, year or character" aria-label="Search"
          value={f.q} onChange={e => setF(p => ({ ...p, q: e.target.value }))} /></label>
      <select aria-label="Filter by type" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}>
        <option value="all">All types</option><option>Movie</option><option>Series</option><option>Special</option></select>
      <select aria-label="Filter by phase" value={f.phase} onChange={e => setF(p => ({ ...p, phase: e.target.value }))}>
        <option value="all">All phases</option>{SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <button className="btn" onClick={onReset}><RotateCcw size={16} aria-hidden /> Reset filters</button>
      <button className="btn danger" onClick={onClear}><Trash2 size={16} aria-hidden /> Clear progress</button>
    </div>
  </header>
)

const Bar = ({ v, max }) => <div className="bar" role="progressbar" aria-valuenow={v} aria-valuemax={max}><i style={{ width: max ? v / max * 100 + '%' : 0 }} /></div>

export const Dashboard = ({ s, status, setStatus }) => {
  const pct = s.total ? Math.round(s.watched / s.total * 100) : 0
  const items = [['Total', s.total], ['Watched', s.watched], ['Remaining', s.total - s.watched], ['Complete', pct + '%'], ['Interested', s.yes], ['Not interested', s.no]]
  return (
    <section className="dash" aria-label="Progress statistics">
      <div className="stats">{items.map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}</div>
      <Bar v={s.watched} max={s.total} />
      <div className="chips" role="group" aria-label="Status filter">
        {[['all', 'All'], ['watched', 'Watched'], ['unwatched', 'Unwatched'], ['yes', 'Interested'], ['no', 'Not Interested']].map(([k, l]) =>
          <button key={k} className={'chip' + (status === k ? ' on' : '')} aria-pressed={status === k} onClick={() => setStatus(k)}>{l}</button>)}
      </div>
    </section>
  )
}

const Card = memo(function Card({ t, w, i, onW, onI, onRemove }) {
  const [x, setX] = useState(false)
  const up = t.sec === 'upcoming'
  const wh = where(t)
  return (
    <li className={`card${w ? ' watched' : ''}${i === 'yes' ? ' yes' : ''}${i === 'no' ? ' no' : ''}`}>
      <div className="row">
        <input type="checkbox" className="chk" checked={!!w} disabled={up} onChange={() => onW(t.id)}
          aria-label={`${t.title}: ${w ? 'watched' : 'not watched'}`} />
        <button className="ttl" aria-expanded={x} onClick={() => setX(v => !v)}>
          <strong>{t.title}</strong><small className={'where' + (wh.live ? '' : ' nr')}>{wh.live ? '▶ ' : '⏳ '}{wh.text}</small><small>{t.year} · {t.type} · {t.phase}</small></button>
        {w && <span className="badge">✓ Watched</span>}
        {t.custom && <button className="btn" aria-label={`Remove ${t.title}`} onClick={() => onRemove(t.id)}><Trash2 size={16} aria-hidden /></button>}
      </div>
      <div className="meta"><span className="tag">{t.tag}</span>{up && <span className="tag up">Not released</span>}</div>
      <fieldset className="radios"><legend className="sr">Interest in {t.title}</legend>
        {[['yes', 'Interested'], ['no', 'Not Interested']].map(([k, l]) =>
          <label key={k}><input type="radio" name={'int-' + t.id} checked={i === k} onChange={() => onI(t.id, k)} /> {l}</label>)}
      </fieldset>
      {x && <div className="detail">{t.desc && <p><Info size={14} aria-hidden /> {t.desc}</p>}
        <p><b>Year:</b> {t.year || 'n/a'} · <b>Category:</b> {t.type} ({t.tag})</p>
        {t.chars && <p><b>Characters:</b> {t.chars}</p>}{t.note && <p><b>Viewing note:</b> {t.note}</p>}
        {wh.live && <p><a href={jw(t)} target="_blank" rel="noreferrer">Check availability on JustWatch</a></p>}</div>}
    </li>
  )
})

export const PhaseSection = ({ sec, items, total, watched, open, toggle, st, onW, onI, onRemove, extra }) => (
  <section className="phase">
    <h2><button className="phb" aria-expanded={open} onClick={toggle}>
      <span><b>{sec.name}</b><small>{sec.sub}</small></span>
      <span className="cnt">{items.length}/{total} titles · {watched} watched {open ? <ChevronUp aria-hidden size={20} /> : <ChevronDown aria-hidden size={20} />}</span></button></h2>
    <Bar v={watched} max={total} />
    {open && <>{extra}<ul className="grid">{items.map(t => <Card key={t.id} t={t} w={st.w[t.id]} i={st.i[t.id]} onW={onW} onI={onI} onRemove={onRemove} />)}</ul></>}
  </section>
)

export const Confirm = ({ onYes, onNo }) => (
  <div className="overlay" onClick={onNo}><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="ct" onClick={e => e.stopPropagation()}>
    <h3 id="ct">Clear all progress?</h3><p>This deletes every watched mark and interest choice on this device. It cannot be undone.</p>
    <div className="acts"><button className="btn" autoFocus onClick={onNo}>Cancel</button><button className="btn danger" onClick={onYes}>Yes, clear</button></div></div></div>
)

export const Footer = ({ watched, onSync }) => (
  <footer className="ftr"><p>You've watched <b>{watched}</b> titles. Keep going on your MCU journey!</p>
    <button className="btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={16} aria-hidden /> Back to top</button>{' '}
    <button className="btn" onClick={onSync}>Backup / Sync devices</button>
    <p><a href="#">Source code (add your repo link)</a></p>
    <p className="fine">Unofficial fan-made tracker. Not affiliated with Marvel Studios or Disney.</p></footer>
)

export const WishlistForm = ({ onAdd }) => {
  const [title, setTitle] = useState(''), [year, setYear] = useState(''), [type, setType] = useState('Movie')
  const submit = e => { e.preventDefault(); if (!title.trim()) return; onAdd({ title: title.trim(), year: year.trim(), type }); setTitle(''); setYear('') }
  return (
    <form className="wform" onSubmit={submit}>
      <input aria-label="Title" placeholder="Movie or series name" value={title} onChange={e => setTitle(e.target.value)} required maxLength={80} />
      <input aria-label="Year (optional)" placeholder="Year" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={year} onChange={e => setYear(e.target.value)} />
      <select aria-label="Type" value={type} onChange={e => setType(e.target.value)}><option>Movie</option><option>Series</option><option>Special</option></select>
      <button className="btn" type="submit">Add to wishlist</button>
    </form>
  )
}

const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o))))
const dec = c => JSON.parse(decodeURIComponent(escape(atob(c.trim()))))
export const SyncDialog = ({ data, onImport, onClose }) => {
  const [code, setCode] = useState(''), [msg, setMsg] = useState('')
  const mine = enc(data)
  const copy = async () => { try { await navigator.clipboard.writeText(mine); setMsg('Code copied. Paste it on your other device.') } catch { setMsg('Select the code and copy it manually.') } }
  const apply = () => {
    try {
      const d = dec(code)
      if (typeof d.w !== 'object' || typeof d.i !== 'object' || !Array.isArray(d.custom)) throw 0
      onImport(d); setMsg('Imported. This device now matches the code.'); setCode('')
    } catch { setMsg('That code is not valid.') }
  }
  return (
    <div className="overlay" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="st" onClick={e => e.stopPropagation()}>
      <h3 id="st">Backup / Sync devices</h3>
      <p><b>1. Export from this device</b> (watched, interest, wishlist)</p>
      <textarea readOnly rows={3} value={mine} aria-label="Your export code" onFocus={e => e.target.select()} />
      <button className="btn" onClick={copy}>Copy code</button>
      <p><b>2. Import on another device</b> (replaces its data)</p>
      <textarea rows={3} value={code} onChange={e => setCode(e.target.value)} placeholder="Paste code here" aria-label="Import code" />
      <div className="acts"><button className="btn" onClick={apply} disabled={!code.trim()}>Import</button><button className="btn" onClick={onClose}>Close</button></div>
      {msg && <p role="status">{msg}</p>}
    </div></div>
  )
}
