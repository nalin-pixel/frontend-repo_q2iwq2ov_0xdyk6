import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [menu, setMenu] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/menu`)
        const data = await res.json()
        setMenu(data.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.name === item.name)
      if (existing) {
        return prev.map((p) => (p.name === item.name ? { ...p, quantity: p.quantity + 1 } : p))
      }
      return [...prev, { name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeFromCart = (name) => {
    setCart((prev) => prev.filter((p) => p.name !== name))
  }

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart])

  const placeOrder = async () => {
    if (cart.length === 0) return
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    })
    const data = await res.json()
    if (data?.id) {
      alert(`Order placed! Total $${data.total.toFixed(2)}`)
      setCart([])
    } else {
      alert('Failed to place order')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <span className="text-emerald-300 font-bold">FO</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Food Orbit</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm">Futuristic • Minimal</div>
            <div className="px-3 py-1.5 rounded-full bg-white text-emerald-900 font-semibold">Cart {cart.length > 0 ? `(${cart.length})` : ''}</div>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          {/* Menu panel */}
          <div className="md:col-span-2">
            <h2 className="text-xl mb-4 font-medium text-emerald-200">Menu</h2>
            {loading ? (
              <div className="text-white/70">Loading menu...</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {menu.length === 0 && (
                  <EmptyMenu onSeed={async () => {
                    // Seed minimal demo items
                    const sample = [
                      { name: 'Green Bowl', description: 'Quinoa, kale, avocado, citrus', price: 12.5, category: 'Bowls' },
                      { name: 'Matcha Shake', description: 'Oat milk, vanilla, chia', price: 6.5, category: 'Drinks' },
                      { name: 'Herb Flatbread', description: 'Garlic, rosemary, olive oil', price: 8.0, category: 'Bakes' },
                    ]
                    for (const s of sample) {
                      await fetch(`${API_BASE}/menu`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
                    }
                    const res = await fetch(`${API_BASE}/menu`)
                    const data = await res.json()
                    setMenu(data.items || [])
                  }} />
                )}
                {menu.map((m, idx) => (
                  <div key={idx} className="group rounded-2xl p-4 bg-white/5 border border-white/10 hover:border-white/20 transition shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold tracking-tight">{m.name}</div>
                        <div className="text-white/70 text-sm">{m.description || 'A delicious pick'}</div>
                      </div>
                      <div className="text-emerald-300 font-semibold">${m.price?.toFixed ? m.price.toFixed(2) : m.price}</div>
                    </div>
                    <button onClick={() => addToCart(m)} className="w-full mt-2 rounded-xl bg-white text-emerald-900 py-2 font-semibold hover:translate-y-[-1px] active:translate-y-[0px] transition">
                      Add to cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart panel */}
          <div className="md:col-span-1">
            <h2 className="text-xl mb-4 font-medium text-emerald-200">Your Order</h2>
            <div className="rounded-2xl p-4 bg-white/5 border border-white/10 sticky top-6">
              {cart.length === 0 ? (
                <div className="text-white/60">Your cart is empty.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div>
                        <div className="text-white">{c.name}</div>
                        <div className="text-white/60 text-sm">${(c.price * c.quantity).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-white/80 text-sm">x{c.quantity}</div>
                        <button className="text-emerald-300 hover:text-white/90" onClick={() => removeFromCart(c.name)}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <div className="text-white/80">Total</div>
                    <div className="text-white font-semibold">${total.toFixed(2)}</div>
                  </div>
                  <button onClick={placeOrder} className="w-full mt-2 rounded-xl bg-white text-emerald-900 py-2 font-semibold hover:translate-y-[-1px] transition">
                    Place order
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-white/60 text-sm">
          Designed with a green-first, white-accent minimal aesthetic.
        </footer>
      </div>
    </div>
  )
}

function EmptyMenu({ onSeed }) {
  return (
    <div className="col-span-full rounded-2xl p-6 bg-white/5 border border-white/10 text-center">
      <div className="text-white/80 mb-2">No items yet.</div>
      <button onClick={onSeed} className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-semibold">Seed sample menu</button>
    </div>
  )
}

export default App
