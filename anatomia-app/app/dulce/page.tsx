'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ============================================================
// 🔐 CAMBIAR AQUÍ EL PIN DE ACCESO (solo números, mínimo 4)
const ACCESS_PIN = '1234'
// ============================================================

const KEYS = {
  AUTH: 'dulce_auth',
  PRODUCTS: 'dulce_products',
  SALES: 'dulce_sales',
  EXPENSES: 'dulce_expenses',
  GOAL: 'dulce_goal',
  NOTES: 'dulce_notes',
}

type Product = { id: string; name: string; cost: number; price: number; emoji: string }
type Sale = { id: string; productId: string; productName: string; quantity: number; revenue: number; cost: number; profit: number; date: string }
type Expense = { id: string; description: string; amount: number; type: 'Insumo' | 'General'; relatedProduct: string; date: string }
type Tab = 'ventas' | 'gastos' | 'catalogo' | 'resumen'

const EMOJIS = ['🍰','🧁','🍩','🍪','🎂','🍫','🍮','🥐','🍬','🍭']
const fmt = (n: number) => '$' + parseFloat(String(n || 0)).toFixed(2)

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) || '') } catch { return fallback }
}
function save(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── PIN SCREEN ──────────────────────────────────────────────
function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [hint, setHint] = useState('')

  const press = (d: string) => {
    if (pin.length >= 6) return
    const next = pin + d
    setPin(next)
    if (next.length === ACCESS_PIN.length) {
      if (next === ACCESS_PIN) {
        save(KEYS.AUTH, { ok: true, ts: Date.now() })
        onSuccess()
      } else {
        setShake(true)
        setHint('PIN incorrecto')
        setTimeout(() => { setShake(false); setPin(''); setHint('') }, 800)
      }
    }
  }

  const del = () => setPin(p => p.slice(0, -1))

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a0a10 0%, #2d1020 50%, #1a0a10 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;700&display=swap'); .pin-btn { width:72px;height:72px;border-radius:50%;border:1.5px solid rgba(232,71,106,0.3);background:rgba(232,71,106,0.08); color:white;font-size:22px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif; } .pin-btn:hover { background:rgba(232,71,106,0.2);border-color:rgba(232,71,106,0.6);transform:scale(1.05); } .pin-btn:active { transform:scale(0.95); } @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} } .shake { animation: shake .4s ease; }`}</style>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🧁</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: '#e8476a', marginBottom: 6 }}>
          Dulce Control
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Ingresá tu PIN para continuar
        </div>
      </div>

      {/* Dots */}
      <div className={shake ? 'shake' : ''} style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
        {Array.from({ length: ACCESS_PIN.length }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: i < pin.length ? '#e8476a' : 'rgba(255,255,255,0.15)',
            transition: 'background .15s',
            boxShadow: i < pin.length ? '0 0 10px rgba(232,71,106,0.6)' : 'none',
          }} />
        ))}
      </div>
      <div style={{ height: 20, fontSize: 12, color: '#e8476a', marginBottom: 28, fontWeight: 600 }}>{hint}</div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 14 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className="pin-btn" onClick={() => press(String(n))}>{n}</button>
        ))}
        <div />
        <button className="pin-btn" onClick={() => press('0')}>0</button>
        <button className="pin-btn" onClick={del} style={{ fontSize: 18 }}>⌫</button>
      </div>

      <Link href="/" style={{ marginTop: 40, fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
        ← Volver a SolStudy
      </Link>
    </div>
  )
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function DulcePage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = load<{ ok: boolean; ts: number } | null>(KEYS.AUTH, null)
    if (stored?.ok) {
      const age = Date.now() - (stored.ts || 0)
      if (age < 1000 * 60 * 60 * 24 * 30) { setAuthed(true) } // 30 días
    }
    setChecking(false)
  }, [])

  if (checking) return null
  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />
  return <DulceApp onLock={() => { save(KEYS.AUTH, null); setAuthed(false) }} />
}

// ── DULCE APP ─────────────────────────────────────────────────
function DulceApp({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<Tab>('ventas')
  const [products, setProducts] = useState<Product[]>(() => load(KEYS.PRODUCTS, []))
  const [sales, setSales] = useState<Sale[]>(() => load(KEYS.SALES, []))
  const [expenses, setExpenses] = useState<Expense[]>(() => load(KEYS.EXPENSES, []))
  const [goal, setGoal] = useState<number>(() => load(KEYS.GOAL, 0))
  const [notes, setNotes] = useState<string>(() => load(KEYS.NOTES, ''))
  const [toast, setToast] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  // Persist
  useEffect(() => { save(KEYS.PRODUCTS, products) }, [products])
  useEffect(() => { save(KEYS.SALES, sales) }, [sales])
  useEffect(() => { save(KEYS.EXPENSES, expenses) }, [expenses])
  useEffect(() => { save(KEYS.GOAL, goal) }, [goal])
  useEffect(() => { save(KEYS.NOTES, notes) }, [notes])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  const filterDate = useCallback((arr: (Sale | Expense)[]) => {
    return arr.filter(i => {
      const d = new Date(i.date).setHours(0, 0, 0, 0)
      const s = dateStart ? new Date(dateStart).setHours(0, 0, 0, 0) : null
      const e = dateEnd ? new Date(dateEnd).setHours(0, 0, 0, 0) : null
      return (!s || d >= s) && (!e || d <= e)
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [dateStart, dateEnd])

  const filteredSales = filterDate(sales) as Sale[]
  const filteredExpenses = filterDate(expenses) as Expense[]

  // ── Resumen numbers ──
  const rev = filteredSales.reduce((a, b) => a + b.revenue, 0)
  const costo = filteredSales.reduce((a, b) => a + b.cost, 0)
  const gastos = filteredExpenses.reduce((a, b) => a + b.amount, 0)
  const net = (rev - costo) - gastos
  const margin = rev > 0 ? ((net / rev) * 100).toFixed(1) : '0'
  const ticket = filteredSales.length > 0 ? rev / filteredSales.length : 0
  const goalPct = goal > 0 ? Math.min(100, (rev / goal) * 100) : 0

  // ── Ventas tab ──
  const [salePid, setSalePid] = useState('')
  const [saleQty, setSaleQty] = useState(1)
  const addSale = () => {
    const p = products.find(x => x.id === salePid)
    if (!p) { showToast('⚠️ Elegí un postre'); return }
    setSales(prev => [...prev, {
      id: Date.now().toString(), productId: p.id, productName: p.name,
      quantity: saleQty, revenue: p.price * saleQty, cost: p.cost * saleQty,
      profit: (p.price - p.cost) * saleQty, date: new Date().toISOString(),
    }])
    setSalePid(''); setSaleQty(1)
    showToast('✓ Venta registrada')
  }

  // ── Gastos tab ──
  const [expType, setExpType] = useState<'Insumo' | 'General'>('Insumo')
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expProd, setExpProd] = useState('')
  const [expSearch, setExpSearch] = useState('')
  const addExpense = () => {
    const amount = parseFloat(expAmount)
    if (!expDesc.trim() || isNaN(amount)) { showToast('⚠️ Completá descripción y monto'); return }
    const rel = expType === 'Insumo' && expProd ? products.find(x => x.id === expProd)?.name || '' : ''
    setExpenses(prev => [...prev, {
      id: Date.now().toString(), description: expDesc.trim(), amount,
      type: expType, relatedProduct: rel, date: new Date().toISOString(),
    }])
    setExpDesc(''); setExpAmount(''); setExpProd('')
    showToast('✓ Gasto guardado')
  }

  // ── Catálogo tab ──
  const [prodName, setProdName] = useState('')
  const [prodCost, setProdCost] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const addProduct = () => {
    const cost = parseFloat(prodCost), price = parseFloat(prodPrice)
    if (!prodName.trim() || isNaN(cost) || isNaN(price)) { showToast('⚠️ Completá todos los campos'); return }
    setProducts(prev => [...prev, {
      id: Date.now().toString(), name: prodName.trim(), cost, price,
      emoji: EMOJIS[products.length % EMOJIS.length],
    }])
    setProdName(''); setProdCost(''); setProdPrice('')
    showToast('✓ Postre guardado en catálogo')
  }

  const exportCSV = () => {
    const rows = [['Fecha','Producto','Cantidad','Ingresos','Costo','Ganancia'],
      ...filteredSales.map(s => [new Date(s.date).toLocaleDateString('es-AR'),
        s.productName, s.quantity, s.revenue.toFixed(2), s.cost.toFixed(2), s.profit.toFixed(2)])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'dulce-control.csv'; a.click()
    showToast('📥 Reporte exportado')
  }

  const displayedExpenses = filteredExpenses.filter(e =>
    !expSearch || e.description.toLowerCase().includes(expSearch.toLowerCase()) ||
    e.relatedProduct?.toLowerCase().includes(expSearch.toLowerCase())
  )

  const s = {
    page: { minHeight: '100vh', background: '#fdf6f0', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#3d1f1f' } as React.CSSProperties,
    header: { background: 'white', borderBottom: '2px solid #fce8ed', padding: '14px 20px', position: 'sticky' as const, top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 24px rgba(61,31,31,0.08)' },
    main: { maxWidth: 900, margin: '0 auto', padding: '24px 16px 100px' },
    card: { background: 'white', borderRadius: 24, border: '1px solid #fce8ed', boxShadow: '0 4px 24px rgba(61,31,31,0.08)', padding: 24 },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #f0dde5', borderRadius: 14, fontFamily: 'inherit', fontSize: 14, outline: 'none', background: '#fdf6f0', color: '#3d1f1f' } as React.CSSProperties,
    btnPrimary: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#e8476a,#c0335a)', color: 'white', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1.5px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,71,106,0.3)' },
    btnDark: { width: '100%', padding: '13px', background: '#3d1f1f', color: 'white', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1.5px', cursor: 'pointer' },
    btnIndigo: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#5c62d6,#3e44c0)', color: 'white', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1.5px', cursor: 'pointer' },
    label: { fontSize: 11, fontWeight: 700, color: '#e8476a', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '1px', display: 'block' },
    rowItem: { background: 'white', border: '1px solid #f5e8ec', borderRadius: 18, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    delBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, padding: 6, borderRadius: 8 },
  }

  const tabStyle = (t: Tab) => ({
    padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: 10,
    fontFamily: 'inherit', fontSize: 11, fontWeight: 700 as const,
    textTransform: 'uppercase' as const, letterSpacing: '1px',
    background: tab === t ? 'white' : 'transparent',
    color: tab === t ? '#e8476a' : '#9ca3af',
    boxShadow: tab === t ? '0 2px 12px rgba(61,31,31,0.1)' : 'none',
    transition: 'all .2s',
  })

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;700&display=swap'); .dulce-input:focus { border-color: #e8476a !important; } .dulce-row:hover { border-color: #f5b8c8 !important; box-shadow: 0 4px 24px rgba(61,31,31,0.08); } .dulce-delbtn:hover { background: #fff0f0 !important; color: #e05555 !important; } .dulce-prod-card { background:white;border-radius:22px;padding:22px;border:1px solid #f0e0e8;box-shadow:0 4px 24px rgba(61,31,31,0.08);position:relative;transition:all .2s; } .dulce-prod-card:hover { box-shadow:0 8px 40px rgba(61,31,31,0.14);transform:translateY(-2px); } .dulce-toast { position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:#3d1f1f;color:white;padding:12px 24px;border-radius:40px;font-size:13px;font-weight:600;opacity:0;transition:all .3s;z-index:999;white-space:nowrap;pointer-events:none; } .dulce-toast.show { opacity:1;transform:translateX(-50%) translateY(0); } .mobile-dulce { display:none; } @media(max-width:700px) { .desktop-dulce-tabs { display:none !important; } .mobile-dulce { display:flex; position:fixed;bottom:0;left:0;right:0;background:white;border-top:1px solid #fce8ed;padding:12px 0 18px;z-index:200;justify-content:space-around;box-shadow:0 -4px 20px rgba(61,31,31,0.08); } .mobile-dulce button { display:flex;flex-direction:column;align-items:center;gap:4px;border:none;background:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#ccc;padding:4px 16px; } .grid-split { grid-template-columns:1fr !important; } .grid-3c { grid-template-columns:1fr 1fr !important; } .grid-4c { grid-template-columns:1fr 1fr !important; } .hide-mobile { display:none !important; } }`}</style>

      {/* HEADER */}
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#e8476a,#c0335a)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(232,71,106,0.3)' }}>🧁</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#e8476a', lineHeight: 1 }}>Dulce Control</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4caf84', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 2 }}>💾 Solo en este dispositivo</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="desktop-dulce-tabs" style={{ display: 'flex', gap: 4, background: '#fdf6f0', borderRadius: 14, padding: 4, border: '1px solid #fce8ed' }}>
            {(['ventas','gastos','catalogo','resumen'] as Tab[]).map(t => (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
                {t === 'ventas' ? '🛒 Ventas' : t === 'gastos' ? '🧾 Gastos' : t === 'catalogo' ? '🏷️ Catálogo' : '📊 Resumen'}
              </button>
            ))}
          </div>
          <button onClick={onLock} title="Cerrar sesión" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 6, borderRadius: 8, color: '#ccc' }}>🔒</button>
        </div>
      </header>

      <main style={s.main}>
        {/* FILTRO FECHA */}
        <div style={{ background: 'white', borderRadius: 20, padding: '12px 18px', border: '1px solid #fce8ed', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, boxShadow: '0 4px 24px rgba(61,31,31,0.08)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#e8476a', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '1px' }}>📅 Periodo:</span>
          <input type="date" className="dulce-input" value={dateStart} onChange={e => setDateStart(e.target.value)} style={{ ...s.input, width: 'auto', padding: '6px 12px' }} />
          <span style={{ color: '#ddd' }}>→</span>
          <input type="date" className="dulce-input" value={dateEnd} onChange={e => setDateEnd(e.target.value)} style={{ ...s.input, width: 'auto', padding: '6px 12px' }} />
          {(dateStart || dateEnd) && (
            <button onClick={() => { setDateStart(''); setDateEnd('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e8476a', fontSize: 18 }}>✕</button>
          )}
        </div>

        {/* ── VENTAS ── */}
        {tab === 'ventas' && (
          <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            <div style={{ ...s.card, height: 'fit-content' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, background: '#fce8ed', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛒</div>
                Nueva Venta
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select className="dulce-input" value={salePid} onChange={e => setSalePid(e.target.value)} style={s.input}>
                  <option value="">Elegir postre...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({fmt(p.price)})</option>)}
                </select>
                <input type="number" className="dulce-input" value={saleQty} min={1} onChange={e => setSaleQty(parseInt(e.target.value) || 1)} style={s.input} placeholder="Cantidad" />
                <button style={s.btnPrimary} onClick={addSale}>✓ Registrar Venta</button>
              </div>
              {salePid && (() => {
                const p = products.find(x => x.id === salePid)
                if (!p) return null
                return (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#fdf6f0', borderRadius: 14, border: '1px solid #fce8ed' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Previsualización</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Ingreso</span>
                      <span style={{ fontWeight: 700, color: '#5c62d6' }}>{fmt(p.price * saleQty)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                      <span style={{ color: '#6b7280' }}>Ganancia</span>
                      <span style={{ fontWeight: 700, color: '#4caf84' }}>{fmt((p.price - p.cost) * saleQty)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
            <div>
              {filteredSales.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px 20px', color: '#ccc' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🍰</div><p style={{ fontSize: 14 }}>Sin ventas en este periodo</p></div>
                : filteredSales.map(s2 => (
                  <div key={s2.id} className="dulce-row" style={s.rowItem}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{s2.productName} <span style={{ background: '#fce8ed', color: '#e8476a', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.8px', marginLeft: 4 }}>×{s2.quantity}</span></div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 3 }}>{new Date(s2.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: '#4caf84' }}>+{fmt(s2.profit)}</div>
                        <div style={{ fontSize: 9, color: '#bbb', fontWeight: 800, textTransform: 'uppercase' }}>ganancia</div>
                      </div>
                      <button className="dulce-delbtn" style={s.delBtn} onClick={() => { setSales(p => p.filter(x => x.id !== s2.id)); showToast('🗑 Venta eliminada') }}>✕</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── GASTOS ── */}
        {tab === 'gastos' && (
          <div className="grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            <div style={{ ...s.card, height: 'fit-content' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, background: '#fdf3e3', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧾</div>
                Registrar Gasto
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', background: '#fdf6f0', borderRadius: 12, padding: 4, border: '1px solid #fce8ed' }}>
                  {(['Insumo', 'General'] as const).map(t => (
                    <button key={t} onClick={() => setExpType(t)} style={{ flex: 1, padding: 8, border: 'none', cursor: 'pointer', borderRadius: 9, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', background: expType === t ? 'white' : 'transparent', color: expType === t ? '#e8476a' : '#9ca3af', transition: 'all .2s' }}>
                      {t}
                    </button>
                  ))}
                </div>
                <input type="text" className="dulce-input" value={expDesc} onChange={e => setExpDesc(e.target.value)} style={s.input} placeholder="¿Qué compraste? Ej: 5kg Harina" />
                {expType === 'Insumo' && (
                  <select className="dulce-input" value={expProd} onChange={e => setExpProd(e.target.value)} style={s.input}>
                    <option value="">¿Para qué postre? (Opcional)</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                <input type="number" className="dulce-input" value={expAmount} onChange={e => setExpAmount(e.target.value)} style={s.input} placeholder="Monto Total $" />
                <button style={s.btnDark} onClick={addExpense}>↓ Guardar Gasto</button>
              </div>
            </div>
            <div>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#ccc', pointerEvents: 'none' }}>🔍</span>
                <input type="text" className="dulce-input" value={expSearch} onChange={e => setExpSearch(e.target.value)} style={{ ...s.input, paddingLeft: 42 }} placeholder="Buscar gastos..." />
              </div>
              {displayedExpenses.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px 20px', color: '#ccc' }}><div style={{ fontSize: 48, marginBottom: 12 }}>💸</div><p style={{ fontSize: 14 }}>Sin gastos en este periodo</p></div>
                : displayedExpenses.map(e2 => (
                  <div key={e2.id} className="dulce-row" style={s.rowItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: e2.type === 'Insumo' ? '#eef0fd' : '#fdf3e3', flexShrink: 0 }}>
                        {e2.type === 'Insumo' ? '📦' : '🧾'}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{e2.description}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 3 }}>
                          {new Date(e2.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {e2.relatedProduct && <span style={{ background: '#fce8ed', color: '#e8476a', padding: '2px 7px', borderRadius: 20, marginLeft: 6, fontSize: 9 }}>Para: {e2.relatedProduct}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: '#e05555' }}>−{fmt(e2.amount)}</div>
                      <button className="dulce-delbtn" style={s.delBtn} onClick={() => { setExpenses(p => p.filter(x => x.id !== e2.id)); showToast('🗑 Gasto eliminado') }}>✕</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ── CATÁLOGO ── */}
        {tab === 'catalogo' && (
          <>
            <div style={{ ...s.card, marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, background: '#eef0fd', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏷️</div>
                Agregar Postre
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <input type="text" className="dulce-input" value={prodName} onChange={e => setProdName(e.target.value)} style={s.input} placeholder="Nombre del postre" />
                <input type="number" className="dulce-input" value={prodCost} onChange={e => setProdCost(e.target.value)} style={s.input} placeholder="Costo $" />
                <input type="number" className="dulce-input" value={prodPrice} onChange={e => setProdPrice(e.target.value)} style={s.input} placeholder="Precio Venta $" />
                <button style={{ ...s.btnIndigo, gridColumn: 'span 3' }} onClick={addProduct}>+ Guardar en Catálogo</button>
              </div>
            </div>
            <div className="grid-3c" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {products.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px 20px', color: '#ccc', gridColumn: 'span 3' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🍩</div><p style={{ fontSize: 14 }}>Agrega tu primer postre</p></div>
                : products.map(p => (
                  <div key={p.id} className="dulce-prod-card">
                    <button className="dulce-delbtn" style={{ ...s.delBtn, position: 'absolute', top: 14, right: 14 }} onClick={() => { setProducts(prev => prev.filter(x => x.id !== p.id)); showToast('🗑 Postre eliminado') }}>✕</button>
                    <div style={{ fontSize: 32 }}>{p.emoji}</div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: '10px 0 0' }}>{p.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid #f5e8ec' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#aaa', letterSpacing: '1px' }}>Costo</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#f0a040' }}>{fmt(p.cost)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#aaa', letterSpacing: '1px' }}>Venta</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#5c62d6' }}>{fmt(p.price)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#aaa', letterSpacing: '1px' }}>Utilidad</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#4caf84' }}>{fmt(p.price - p.cost)}</div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

        {/* ── RESUMEN ── */}
        {tab === 'resumen' && (
          <>
            {/* Stats */}
            <div className="grid-4c" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Ingresos',    val: fmt(rev),   color: '#5c62d6' },
                { label: 'Costo Prod.', val: fmt(costo), color: '#f0a040' },
                { label: 'Gastos',      val: fmt(gastos),color: '#e05555' },
                { label: 'Ganancia',    val: fmt(net),   highlight: true },
              ].map(c => (
                <div key={c.label} style={{ background: c.highlight ? 'linear-gradient(135deg,#4caf84,#38a06c)' : 'white', borderRadius: 22, padding: 20, textAlign: 'center', border: c.highlight ? 'none' : '1px solid #fce8ed', boxShadow: '0 4px 24px rgba(61,31,31,0.08)' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: c.highlight ? 'rgba(255,255,255,0.7)' : '#aaa' }}>{c.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, marginTop: 4, color: c.highlight ? 'white' : c.color }}>{c.val}</div>
                </div>
              ))}
            </div>

            {/* Meta mensual */}
            <div style={{ ...s.card, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, background: '#e8f7f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
                  Meta de Ingresos
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>$</span>
                  <input type="number" className="dulce-input" value={goal || ''} onChange={e => setGoal(parseFloat(e.target.value) || 0)} style={{ ...s.input, width: 120, padding: '6px 12px', textAlign: 'right' }} placeholder="0" />
                </div>
              </div>
              {goal > 0 && (
                <>
                  <div style={{ height: 14, background: '#f5e8ec', borderRadius: 20, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', borderRadius: 20, background: goalPct >= 100 ? 'linear-gradient(90deg,#4caf84,#38a06c)' : 'linear-gradient(90deg,#e8476a,#c0335a)', width: `${goalPct}%`, transition: 'width .6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: goalPct >= 100 ? '#4caf84' : '#e8476a', fontWeight: 700 }}>{goalPct.toFixed(0)}% alcanzado</span>
                    <span style={{ color: '#9ca3af' }}>Falta: {fmt(Math.max(0, goal - rev))}</span>
                  </div>
                </>
              )}
            </div>

            {/* Análisis */}
            <div style={{ ...s.card, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, background: '#fce8ed', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
                  Análisis del Periodo
                </div>
                <button onClick={exportCSV} style={{ background: '#fce8ed', color: '#e8476a', border: 'none', borderRadius: 12, padding: '8px 14px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>⬇ Exportar CSV</button>
              </div>
              {/* Barra */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
                <span>◼ Prod.</span><span>◼ Gastos</span><span>◼ Ganancia</span>
              </div>
              <div style={{ height: 52, borderRadius: 14, overflow: 'hidden', display: 'flex', background: '#f5f5f5', marginBottom: 20 }}>
                {rev > 0 && <div style={{ width: `${Math.max(4, (costo/rev)*100)}%`, background: '#f0a040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>PROD</div>}
                {rev > 0 && <div style={{ width: `${Math.max(4, (gastos/rev)*100)}%`, background: '#e05555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>GTOS</div>}
                <div style={{ flex: 1, background: '#4caf84', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>UTIL</div>
              </div>
              <div className="grid-4c" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, textAlign: 'center', borderTop: '1px solid #f5e8ec', paddingTop: 16 }}>
                {[
                  { val: filteredSales.length, label: 'Postres Vendidos' },
                  { val: filteredExpenses.length, label: 'Gastos Registrados' },
                  { val: margin + '%', label: 'Margen Neto' },
                  { val: fmt(ticket), label: 'Ticket Promedio' },
                ].map(k => (
                  <div key={k.label}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900 }}>{k.val}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#aaa', letterSpacing: '1px', marginTop: 2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div style={s.card}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, background: '#fdf3e3', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</div>
                Notas Rápidas
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ ...s.input, minHeight: 120, resize: 'vertical', lineHeight: 1.6 } as React.CSSProperties}
                placeholder="Anotá pedidos pendientes, ideas de nuevos postres, recordatorios..."
                className="dulce-input"
              />
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 8, textAlign: 'right' }}>Guardado automáticamente ✓</div>
            </div>
          </>
        )}
      </main>

      {/* MOBILE NAV */}
      <nav className="mobile-dulce">
        {(['ventas','gastos','catalogo','resumen'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ color: tab === t ? '#e8476a' : '#ccc' }}>
            <span style={{ fontSize: 22 }}>{t === 'ventas' ? '🛒' : t === 'gastos' ? '🧾' : t === 'catalogo' ? '🏷️' : '📊'}</span>
            {t === 'ventas' ? 'Ventas' : t === 'gastos' ? 'Gastos' : t === 'catalogo' ? 'Catálogo' : 'Resumen'}
          </button>
        ))}
      </nav>

      {/* TOAST */}
      <div className={`dulce-toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  )
}
