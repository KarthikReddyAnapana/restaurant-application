import { useEffect, useState } from 'react';
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

function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/[^a-z]/g, '');
  return (
    <span className={`status status-${key}`}>
      <span className="pulse" />
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
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
    // Live order status updates (polling)
    const t = setInterval(() => load(false), 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [auth.token]);

  if (!auth.token) {
    return (
      <div className="card empty fade-up">
        <span className="emoji">🔐</span>
        <div style={{ fontWeight: 700, color: 'var(--text)' }}>Please log in</div>
        <div>Log in to view and track your orders.</div>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 8 }}>
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="stack fade-up" style={{ gap: 'var(--sp-4)' }}>
      <div className="section-title">
        <h2>Your Orders</h2>
        <span className="count-note">● live updates</span>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="card card-pad muted">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="card empty">
          <span className="emoji">🧾</span>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>No orders yet</div>
          <div>Your placed orders and history will appear here.</div>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>
            Order now
          </Link>
        </div>
      ) : (
        orders.map((o) => (
          <section key={o.id} className="card order">
            <div className="order-head">
              <div>
                <strong style={{ fontSize: '1.05rem' }}>Order #{o.id}</strong>
                <div className="muted" style={{ fontSize: '0.82rem' }}>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusPill status={o.status} />
                <div className="price" style={{ marginTop: 8 }}>
                  ₹{Number(o.grandTotal ?? o.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>
            <ul className="order-items">
              {o.items.map((i) => (
                <li key={i.menuItemId}>
                  <span>
                    <b>{i.name}</b> × {i.quantity}
                  </span>
                  <span className="price">₹{Number(i.lineTotal).toFixed(2)}</span>
                </li>
              ))}
              {Number(o.tip) > 0 && (
                <li className="tip-line">
                  <span>💝 Tip for rider</span>
                  <span className="price">₹{Number(o.tip).toFixed(2)}</span>
                </li>
              )}
            </ul>
            {o.note && (
              <div className="order-note">
                <span className="note-ic">📝</span> {o.note}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
