import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../state/auth';
import { useCart } from '../state/cart';
import { useToast } from '../state/toast';
import FoodImage from '../components/FoodImage';

const PROMOS: Record<string, number> = { SAVE10: 0.1, WELCOME5: 0.05 };
const TIP_PRESETS = [20, 50, 100];

export default function CartPage() {
  const { auth } = useAuth();
  const { lines, remove, setQty, clear, total } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [tip, setTip] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discountRate = promo ? PROMOS[promo] ?? 0 : 0;
  const discount = useMemo(() => total * discountRate, [total, discountRate]);
  const grandTotal = total - discount + tip;

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMOS[code]) {
      setPromo(code);
      setError(null);
      toast.push(`Promo ${code} applied — ${Math.round(PROMOS[code] * 100)}% off`);
    } else {
      setPromo(null);
      setError(`"${code}" is not a valid promo code.`);
      toast.push(`"${code}" is not a valid promo code.`, 'error');
    }
  }

  async function placeOrder() {
    if (!auth.token) {
      navigate('/login');
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const payload = {
        items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity })),
        note: note.trim() || null,
        tip: Number(tip.toFixed(2)),
      };
      await api.post('/api/orders', payload);
      clear();
      toast.push('Order placed! Track it live 🚚');
      navigate('/track');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to place order');
      toast.push('Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="stack fade-up" style={{ gap: 'var(--sp-4)' }}>
        <div className="section-title">
          <h2>Your Cart</h2>
        </div>
        <div className="card empty">
          <span className="emoji">🛒</span>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>Your cart is empty</div>
          <div>Add some delicious dishes from the menu to get started.</div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('/')}>
            Browse menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack fade-up" style={{ gap: 'var(--sp-4)' }}>
      <div className="section-title">
        <h2>Your Cart</h2>
        <span className="count-note">{lines.length} items</span>
      </div>

      <div className="cart-grid">
        <div className="card">
          {lines.map((l) => (
            <div key={l.item.id} className="cart-line">
              <div className="row" style={{ gap: 12 }}>
                <FoodImage name={l.item.name} category={l.item.category} className="thumb-sm" />
                <div>
                  <div style={{ fontWeight: 700 }}>{l.item.name}</div>
                  <div className="muted" style={{ fontSize: '0.82rem' }}>
                    ₹{Number(l.item.price).toFixed(2)} each
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 14 }}>
                <div className="qty">
                  <button onClick={() => setQty(l.item.id, l.quantity - 1)} aria-label="Decrease">
                    −
                  </button>
                  <span>{l.quantity}</span>
                  <button onClick={() => setQty(l.item.id, l.quantity + 1)} aria-label="Increase">
                    +
                  </button>
                </div>
                <span className="price" style={{ minWidth: 76, textAlign: 'right' }}>
                  ₹{(Number(l.item.price) * l.quantity).toFixed(2)}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(l.item.id)} aria-label="Remove">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card card-pad summary">
          <h3 style={{ marginBottom: 12 }}>Order summary</h3>

          <div className="promo-row">
            <input
              className="input"
              placeholder="Promo code (try SAVE10)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
            />
            <button className="btn" onClick={applyPromo}>
              Apply
            </button>
          </div>

          {error && <div className="alert" style={{ marginBottom: 12 }}>{error}</div>}

          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="order-note">Special request</label>
            <textarea
              id="order-note"
              className="input textarea"
              placeholder="Anything else to bring? e.g. extra napkins, ketchup sachets, a bottle of water…"
              value={note}
              maxLength={500}
              rows={3}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="muted" style={{ fontSize: '0.72rem', textAlign: 'right' }}>{note.length}/500</div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Add a tip for your rider</label>
            <div className="tip-picker">
              {TIP_PRESETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`chip tip-chip${tip === amt ? ' active' : ''}`}
                  onClick={() => setTip(tip === amt ? 0 : amt)}
                >
                  ₹{amt}
                </button>
              ))}
              <div className="tip-custom">
                <span>₹</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="decimal"
                  placeholder="Custom"
                  value={tip === 0 ? '' : tip}
                  onChange={(e) => setTip(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>
          </div>

          <div className="line">
            <span>Subtotal</span>
            <span className="price">₹{total.toFixed(2)}</span>
          </div>
          {promo && (
            <div className="line" style={{ color: 'var(--success)' }}>
              <span>Discount ({promo})</span>
              <span className="price">−₹{discount.toFixed(2)}</span>
            </div>
          )}
          {tip > 0 && (
            <div className="line">
              <span>Tip</span>
              <span className="price">₹{tip.toFixed(2)}</span>
            </div>
          )}
          <div className="total">
            <strong>Total</strong>
            <strong className="price">₹{grandTotal.toFixed(2)}</strong>
          </div>

          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
            onClick={placeOrder}
            disabled={placing}
          >
            {placing ? 'Placing order…' : `Place order · ₹${grandTotal.toFixed(2)}`}
          </button>
          {!auth.token && (
            <div className="muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: 8 }}>
              You'll be asked to log in first.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
