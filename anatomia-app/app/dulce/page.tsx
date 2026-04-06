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

// ─── PIN Lock Screen ───────────────────────────────────────
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (pin === ACCESS_PIN) {
      save(KEYS.AUTH, { ts: Date.now() })
      onUnlock()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-dark-900 dark:to-dark-800 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 w-full max-w-sm text-center border border-gray-200 dark:border-dark-600">
        <div className="text-5xl mb-4">🧁</div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Dulce Control</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Ingresa tu PIN para acceder</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="••••"
          className={`w-full text-center text-2xl tracking-[0.5em] p-3 rounded-xl border-2 mb-4 outline-none transition-colors bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white ${
            error ? 'border-red-400 animate-shake' : 'border-gray-200 dark:border-dark-500 focus:border-pink-400'
          }`}
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-colors"
        >
          Entrar
        </button>
        {error && <p className="text-red-500 text-sm mt-3">PIN incorrecto</p>}
        <Link href="/" className="block mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}

// ─── Sale Form ─────────────────────────────────────────────
function SaleForm({ products, onAdd }: { products: Product[]; onAdd: (s: Sale) => void }) {
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)

  const product = products.find(p => p.id === productId)

  const handleAdd = () => {
    if (!product || qty < 1) return
    const sale: Sale = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity: qty,
      revenue: product.price * qty,
      cost: product.cost * qty,
      profit: (product.price - product.cost) * qty,
      date: new Date().toISOString(),
    }
    onAdd(sale)
    setQty(1)
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600 mb-4">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">➕ Registrar venta</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={productId}
          onChange={e => setProductId(e.target.value)}
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
        >
          <option value="">Seleccionar producto...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.emoji} {p.name} — {fmt(p.price)}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
          placeholder="Cantidad"
        />
        <button
          onClick={handleAdd}
          disabled={!product}
          className="py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-medium transition-colors"
        >
          Agregar venta
        </button>
      </div>
      {product && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Total: {fmt(product.price * qty)} | Ganancia: {fmt((product.price - product.cost) * qty)}
        </p>
      )}
    </div>
  )
}

// ─── Expense Form ──────────────────────────────────────────
function ExpenseForm({ products, onAdd }: { products: Product[]; onAdd: (e: Expense) => void }) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'Insumo' | 'General'>('General')
  const [related, setRelated] = useState('')

  const handleAdd = () => {
    if (!desc.trim() || !amount) return
    onAdd({
      id: crypto.randomUUID(),
      description: desc.trim(),
      amount: parseFloat(amount),
      type,
      relatedProduct: related,
      date: new Date().toISOString(),
    })
    setDesc('')
    setAmount('')
    setRelated('')
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600 mb-4">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">➕ Registrar gasto</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Descripción del gasto"
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
        />
        <input
          type="number"
          min={0}
          step={0.01}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Monto ($)"
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value as 'Insumo' | 'General')}
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
        >
          <option value="General">General</option>
          <option value="Insumo">Insumo</option>
        </select>
        <select
          value={related}
          onChange={e => setRelated(e.target.value)}
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
        >
          <option value="">Producto relacionado (opcional)</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleAdd}
        disabled={!desc.trim() || !amount}
        className="mt-3 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-medium transition-colors"
      >
        Agregar gasto
      </button>
    </div>
  )
}

// ─── Product Form ──────────────────────────────────────────
function ProductForm({ onAdd }: { onAdd: (p: Product) => void }) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])

  const handleAdd = () => {
    if (!name.trim() || !cost || !price) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      cost: parseFloat(cost),
      price: parseFloat(price),
      emoji,
    })
    setName('')
    setCost('')
    setPrice('')
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600 mb-4">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-3">➕ Nuevo producto</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre del producto"
          className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
        />
        <div className="flex gap-2">
          <select
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            className="p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-lg"
          >
            {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input
            type="number"
            min={0}
            step={0.01}
            value={cost}
            onChange={e => setCost(e.target.value)}
            placeholder="Costo"
            className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Precio venta"
            className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
          />
        </div>
      </div>
      {cost && price && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Margen: {fmt(parseFloat(price) - parseFloat(cost))} ({(((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) * 100).toFixed(0)}%)
        </p>
      )}
      <button
        onClick={handleAdd}
        disabled={!name.trim() || !cost || !price}
        className="mt-3 py-2 px-4 rounded-lg bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-medium transition-colors"
      >
        Agregar producto
      </button>
    </div>
  )
}

// ─── Main Dulce Page ───────────────────────────────────────
export default function DulcePage() {
  const [authed, setAuthed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<Tab>('ventas')
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goal, setGoal] = useState(0)
  const [notes, setNotes] = useState('')

  // Load from localStorage
  useEffect(() => {
    const auth = load<{ ts: number } | null>(KEYS.AUTH, null)
    // Session valid for 24 hours
    if (auth && Date.now() - auth.ts < 86400000) {
      setAuthed(true)
    }
    setProducts(load<Product[]>(KEYS.PRODUCTS, []))
    setSales(load<Sale[]>(KEYS.SALES, []))
    setExpenses(load<Expense[]>(KEYS.EXPENSES, []))
    setGoal(load<number>(KEYS.GOAL, 0))
    setNotes(load<string>(KEYS.NOTES, ''))
    setLoaded(true)
  }, [])

  // Persist on changes
  useEffect(() => { if (loaded) save(KEYS.PRODUCTS, products) }, [products, loaded])
  useEffect(() => { if (loaded) save(KEYS.SALES, sales) }, [sales, loaded])
  useEffect(() => { if (loaded) save(KEYS.EXPENSES, expenses) }, [expenses, loaded])
  useEffect(() => { if (loaded) save(KEYS.GOAL, goal) }, [goal, loaded])
  useEffect(() => { if (loaded) save(KEYS.NOTES, notes) }, [notes, loaded])

  const addSale = useCallback((s: Sale) => setSales(prev => [s, ...prev]), [])
  const addExpense = useCallback((e: Expense) => setExpenses(prev => [e, ...prev]), [])
  const addProduct = useCallback((p: Product) => setProducts(prev => [...prev, p]), [])

  const deleteSale = useCallback((id: string) => setSales(prev => prev.filter(s => s.id !== id)), [])
  const deleteExpense = useCallback((id: string) => setExpenses(prev => prev.filter(e => e.id !== id)), [])
  const deleteProduct = useCallback((id: string) => setProducts(prev => prev.filter(p => p.id !== id)), [])

  const handleLogout = () => {
    localStorage.removeItem(KEYS.AUTH)
    setAuthed(false)
  }

  // Calculations
  const totalRevenue = sales.reduce((s, v) => s + v.revenue, 0)
  const totalProfit = sales.reduce((s, v) => s + v.profit, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalProfit - totalExpenses
  const totalSalesCount = sales.reduce((s, v) => s + v.quantity, 0)

  // Today's stats
  const today = new Date().toISOString().slice(0, 10)
  const todaySales = sales.filter(s => s.date.slice(0, 10) === today)
  const todayRevenue = todaySales.reduce((s, v) => s + v.revenue, 0)
  const todayProfit = todaySales.reduce((s, v) => s + v.profit, 0)

  if (!loaded) return null
  if (!authed) return <PinScreen onUnlock={() => setAuthed(true)} />

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'ventas', label: 'Ventas', icon: '💰' },
    { key: 'gastos', label: 'Gastos', icon: '📉' },
    { key: 'catalogo', label: 'Catálogo', icon: '📋' },
    { key: 'resumen', label: 'Resumen', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-600">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧁</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dulce Control</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ← Inicio
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-500 transition-colors"
            >
              Cerrar 🔒
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Hoy ventas</p>
            <p className="text-lg font-bold text-green-500">{fmt(todayRevenue)}</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Hoy ganancia</p>
            <p className="text-lg font-bold text-blue-500">{fmt(todayProfit)}</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ganancia neta</p>
            <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{fmt(netProfit)}</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Uds vendidas</p>
            <p className="text-lg font-bold text-purple-500">{totalSalesCount}</p>
          </div>
        </div>

        {/* Goal progress */}
        {goal > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Meta mensual</span>
              <span className="font-medium text-gray-800 dark:text-white">{fmt(totalRevenue)} / {fmt(goal)}</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalRevenue / goal) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-dark-800 rounded-xl p-1 border border-gray-200 dark:border-dark-600 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <span className="mr-1">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Ventas ───────────────────────────────── */}
        {tab === 'ventas' && (
          <div>
            <SaleForm products={products} onAdd={addSale} />
            {sales.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No hay ventas registradas</p>
            ) : (
              <div className="space-y-2">
                {sales.map(s => (
                  <div key={s.id} className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {products.find(p => p.id === s.productId)?.emoji || '🧁'} {s.productName} x{s.quantity}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(s.date).toLocaleString('es-MX')} — Ganancia: {fmt(s.profit)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-500">{fmt(s.revenue)}</span>
                      <button onClick={() => deleteSale(s.id)} className="text-red-400 hover:text-red-500 text-sm">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Gastos ───────────────────────────────── */}
        {tab === 'gastos' && (
          <div>
            <ExpenseForm products={products} onAdd={addExpense} />
            {expenses.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No hay gastos registrados</p>
            ) : (
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-gray-200 dark:border-dark-600 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{e.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {e.type} — {new Date(e.date).toLocaleString('es-MX')}
                        {e.relatedProduct && ` — ${products.find(p => p.id === e.relatedProduct)?.name || ''}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-500">-{fmt(e.amount)}</span>
                      <button onClick={() => deleteExpense(e.id)} className="text-red-400 hover:text-red-500 text-sm">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Catálogo ─────────────────────────────── */}
        {tab === 'catalogo' && (
          <div>
            <ProductForm onAdd={addProduct} />
            {products.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">Agrega tu primer producto</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(p => (
                  <div key={p.id} className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-500 text-sm">✕</button>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{p.name}</h4>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Costo: {fmt(p.cost)}</span>
                      <span className="text-green-500 font-medium">Venta: {fmt(p.price)}</span>
                    </div>
                    <p className="text-xs text-purple-500 mt-1">
                      Margen: {fmt(p.price - p.cost)} ({((p.price - p.cost) / p.price * 100).toFixed(0)}%)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Resumen ──────────────────────────────── */}
        {tab === 'resumen' && (
          <div className="space-y-4">
            {/* Goal setting */}
            <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">🎯 Meta mensual</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={goal || ''}
                  onChange={e => setGoal(parseFloat(e.target.value) || 0)}
                  placeholder="Meta de ventas ($)"
                  className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total ingresos</p>
                <p className="text-2xl font-bold text-green-500">{fmt(totalRevenue)}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ganancia bruta</p>
                <p className="text-2xl font-bold text-blue-500">{fmt(totalProfit)}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total gastos</p>
                <p className="text-2xl font-bold text-red-500">{fmt(totalExpenses)}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ganancia neta</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{fmt(netProfit)}</p>
              </div>
            </div>

            {/* Top products */}
            {sales.length > 0 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">🏆 Productos más vendidos</h3>
                {(() => {
                  const grouped = sales.reduce<Record<string, { name: string; qty: number; revenue: number; profit: number }>>((acc, s) => {
                    if (!acc[s.productId]) acc[s.productId] = { name: s.productName, qty: 0, revenue: 0, profit: 0 }
                    acc[s.productId].qty += s.quantity
                    acc[s.productId].revenue += s.revenue
                    acc[s.productId].profit += s.profit
                    return acc
                  }, {})
                  return Object.entries(grouped)
                    .sort((a, b) => b[1].qty - a[1].qty)
                    .slice(0, 5)
                    .map(([id, data]) => (
                      <div key={id} className="flex justify-between py-2 border-b border-gray-100 dark:border-dark-600 last:border-0">
                        <span className="text-gray-800 dark:text-white">
                          {products.find(p => p.id === id)?.emoji || '🧁'} {data.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {data.qty} uds — {fmt(data.revenue)} — Gan: {fmt(data.profit)}
                        </span>
                      </div>
                    ))
                })()}
              </div>
            )}

            {/* Notes */}
            <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-gray-200 dark:border-dark-600">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">📝 Notas</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Apuntes, ideas, recordatorios..."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-700 text-gray-800 dark:text-white resize-none"
              />
            </div>

            {/* Danger zone */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ Zona peligrosa</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { if (confirm('Borrar TODAS las ventas?')) setSales([]) }}
                  className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/60"
                >
                  Borrar ventas
                </button>
                <button
                  onClick={() => { if (confirm('Borrar TODOS los gastos?')) setExpenses([]) }}
                  className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/60"
                >
                  Borrar gastos
                </button>
                <button
                  onClick={() => { if (confirm('Borrar TODO? (productos, ventas, gastos, notas)')) { setProducts([]); setSales([]); setExpenses([]); setNotes(''); setGoal(0) } }}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                >
                  Resetear todo
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  )
}