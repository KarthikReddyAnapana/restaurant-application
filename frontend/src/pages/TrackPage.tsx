import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../state/auth';

type OrderItemResponse = {
  menuItemId: number;
  name: string;
  category: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

type OrderResponse = {
  id: number;
  status: string;
  totalAmount: string;
  tip: string;
  grandTotal: string;
  note: string | null;
  createdAt: string;
  items: OrderItemResponse[];
};

const STEPS = [
  { key: 'PLACED', label: 'Order placed', icon: '📝', hint: 'We received your order.' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅', hint: 'The kitchen accepted your order.' },
  { key: 'PREPARING', label: 'Preparing', icon: '👩‍🍳', hint: 'Your food is being freshly cooked.' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: '🛵', hint: 'Your rider is on the way.' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', hint: 'Enjoy your meal!' },
];

function stepIndex(status: string) {
  return STEPS.findIndex((s) => s.key === status);
}

export default function TrackPage() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load(initial = false) {
      if (initial) setLoading(true);
      try {
        const res = await api.get('/api/orders');
        if (!cancelled) {
          setOrders(res.data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.detail ?? 'Failed to load orders');
      } finally {
        if (!cancelled && initial) setLoading(false);
      }
    }
    load(true);
    const t = setInterval(() => load(false), 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [auth.token]);

  // Default to the most recent order once loaded.
  useEffect(() => {
    if (selectedId == null && orders.length > 0) {
      setSelectedId(orders[0].id);
    }
  }, [orders, selectedId]);

  const order = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );

  if (!auth.token) {
    return (
      <div className="card empty fade-up">
        <span className="emoji">🔐</span>
        <div style={{ fontWeight: 700, color: 'var(--text)' }}>Please log in</div>
        <div>Log in to track your live order status.</div>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 8 }}>
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="stack fade-up" style={{ gap: 'var(--sp-4)' }}>
      <div className="section-title">
        <h2>Track your order</h2>
        <span className="count-note">● live updates</span>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="card card-pad muted">Loading your orders…</div>
      ) : orders.length === 0 ? (
        <div className="card empty">
          <span className="emoji">📦</span>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>Nothing to track yet</div>
          <div>Place an order and follow it live, step by step.</div>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>
            Order now
          </Link>
        </div>
      ) : (
        <>
          <div className="track-select card card-pad">
            <label htmlFor="order-picker">Which order?</label>
            <select
              id="order-picker"
              className="input"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.id} · {new Date(o.createdAt).toLocaleString()} · {o.status}
                </option>
              ))}
            </select>
          </div>

          {order && <OrderTracker order={order} />}
        </>
      )}
    </div>
  );
}

function OrderTracker({ order }: { order: OrderResponse }) {
  const cancelled = order.status === 'CANCELLED';
  const current = stepIndex(order.status);
  const activeStep = cancelled ? -1 : current;

  return (
    <section className="card card-pad order-tracker">
      <div className="tracker-head">
        <div>
          <strong style={{ fontSize: '1.1rem' }}>Order #{order.id}</strong>
          <div className="muted" style={{ fontSize: '0.82rem' }}>
            Placed {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="price" style={{ fontSize: '1.15rem' }}>
          ₹{Number(order.grandTotal ?? order.totalAmount).toFixed(2)}
        </div>
      </div>

      {cancelled ? (
        <div className="alert" style={{ marginTop: 16 }}>
          This order was cancelled.
        </div>
      ) : (
        <div className="tracker">
          {STEPS.map((s, i) => {
            const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'todo';
            return (
              <div key={s.key} className={`tstep ${state}`}>
                <div className="tstep-rail">
                  <span className="tstep-dot">{state === 'done' ? '✓' : s.icon}</span>
                  {i < STEPS.length - 1 && <span className="tstep-line" />}
                </div>
                <div className="tstep-body">
                  <div className="tstep-label">{s.label}</div>
                  <div className="tstep-hint">{s.hint}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ul className="order-items" style={{ marginTop: 18 }}>
        {order.items.map((i) => (
          <li key={i.menuItemId}>
            <span>
              <b>{i.name}</b> × {i.quantity}
            </span>
            <span className="price">₹{Number(i.lineTotal).toFixed(2)}</span>
          </li>
        ))}
        {Number(order.tip) > 0 && (
          <li className="tip-line">
            <span>💝 Tip for rider</span>
            <span className="price">₹{Number(order.tip).toFixed(2)}</span>
          </li>
        )}
      </ul>

      {order.note && (
        <div className="order-note">
          <span className="note-ic">📝</span> {order.note}
        </div>
      )}
    </section>
  );
}
