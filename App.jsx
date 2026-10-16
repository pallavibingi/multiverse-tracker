import { useCallback, useMemo, useState, useEffect } from 'react'
import { TITLES, SECTIONS } from './data'
import { useLocal, storageOk } from './hooks'
import { Header, Dashboard, PhaseSection, Confirm, Footer, WishlistForm, SyncDialog } from './components'

const DEF = { q: '', type: 'all', phase: 'all' }
export default function App() {
  const [w, setW] = useLocal('mv-watched', {})
  const [i, setI] = useLocal('mv-interest', {})
  const [f, setF] = useLocal('mv-filters', DEF)
  const [status, setStatus] = useLocal('mv-status', 'all')
  const [open, setOpen] = useLocal('mv-open', { p1: true })
  const [custom, setCustom] = useLocal('mv-custom', [])
  const ALL = useMemo(() => [...TITLES, ...custom], [custom])
  const onAdd = useCallback(n => { setCustom(p => [...p, { id: 'my-' + Date.now(), ...n, sec: 'wishlist', chars: '', desc: '', note: '', tag: 'My Wishlist', phase: 'My Wishlist', custom: true }]); setOpen(p => ({ ...p, wishlist: true })) }, [setCustom, setOpen])
  const onRemove = useCallback(id => { setCustom(p => p.filter(t => t.id !== id)); setW(p => { const { [id]: _, ...r } = p; return r }); setI(p => { const { [id]: _, ...r } = p; return r }) }, [setCustom, setW, setI])
  const [ask, setAsk] = useState(false)
  const [sync, setSync] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const onW = useCallback(id => setW(p => ({ ...p, [id]: !p[id] })), [setW])
  const onI = useCallback((id, v) => setI(p => ({ ...p, [id]: v })), [setI])

  const scope = useMemo(() => ALL.filter(t => (f.type === 'all' || t.type === f.type) && (f.phase === 'all' || t.sec === f.phase)), [ALL, f.type, f.phase])
  const stats = useMemo(() => {
    const s = scope.filter(t => t.sec !== 'upcoming')
    return { total: s.length, watched: s.filter(t => w[t.id]).length, yes: s.filter(t => i[t.id] === 'yes').length, no: s.filter(t => i[t.id] === 'no').length }
  }, [scope, w, i])
  const q = f.q.trim().toLowerCase()
  const visible = useMemo(() => scope.filter(t =>
    (!q || (t.title + ' ' + t.year + ' ' + t.chars).toLowerCase().includes(q)) &&
    (status === 'all' || (status === 'watched' ? w[t.id] : status === 'unwatched' ? !w[t.id] : i[t.id] === status))), [scope, q, status, w, i])
  const totalWatched = ALL.filter(t => w[t.id]).length

  if (!ready) return <p className="load">Loading…</p>
  return (
    <>
      <div className="bg" aria-hidden />
      <Header f={f} setF={setF} onReset={() => { setF(DEF); setStatus('all') }} onClear={() => setAsk(true)} />
      <main className="wrap">
        {!storageOk && <p className="warn" role="alert">Local storage is unavailable, so progress will not be saved.</p>}
        <Dashboard s={stats} status={status} setStatus={setStatus} />
        {SECTIONS.map(sec => {
          const items = visible.filter(t => t.sec === sec.id)
          const all = ALL.filter(t => t.sec === sec.id)
          const wl = sec.id === 'wishlist'
          if (!items.length && !(wl && !q && status === 'all')) return null
          return <PhaseSection key={sec.id} sec={sec} items={items} total={all.length}
            watched={all.filter(t => w[t.id]).length} open={wl ? open.wishlist !== false : !!open[sec.id] || !!q}
            toggle={() => setOpen(p => ({ ...p, [sec.id]: !p[sec.id] }))} st={{ w, i }} onW={onW} onI={onI} onRemove={onRemove} extra={wl && <WishlistForm onAdd={onAdd} />} />
        })}
        {!visible.length && <p className="empty">No titles match your filters.</p>}
      </main>
      <Footer watched={totalWatched} onSync={() => setSync(true)} />
      {sync && <SyncDialog data={{ w, i, custom }} onClose={() => setSync(false)} onImport={d => { setW(d.w); setI(d.i); setCustom(d.custom) }} />}
      {ask && <Confirm onNo={() => setAsk(false)} onYes={() => { setW({}); setI({}); setAsk(false) }} />}
    </>
  )
}
