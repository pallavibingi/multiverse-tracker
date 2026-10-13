import { useState, useEffect } from 'react'
let ok = true
try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t') } catch { ok = false }
export const storageOk = ok
export function useLocal(key, init) {
  const [v, setV] = useState(() => {
    try { const s = ok && localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { if (ok) try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}
