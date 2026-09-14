import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../state/auth';
import { useCart } from '../state/cart';
import type { MenuItem } from '../state/cart';
import { useToast } from '../state/toast';
import FoodImage from '../components/FoodImage';

type Recommendation = { menuItemId: number; name: string; reason: string };

const STEPS = [
  { icon: '🍽️', title: 'Browse the menu', text: 'Explore chef-curated dishes across categories.' },
  { icon: '🛒', title: 'Add to cart', text: 'Pick your favourites and adjust quantities.' },
  { icon: '💳', title: 'Place your order', text: 'Apply a promo code and checkout in seconds.' },
  { icon: '🚚', title: 'Track live', text: 'Watch your order status update in real time.' },
];

function SpiceMeter({ level }: { level: number }) {
  return (
    <span className="spice" title={`Spice level ${level}/5`} aria-label={`Spice level ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= level ? 'on' : ''} />
      ))}
    </span>
  );
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('All');
  const [query, setQuery] = useState('');
  const { auth } = useAuth();
  const { add, setQty, qtyOf } = useCart();
  const toast = useToast();

  function handleAdd(item: MenuItem) {
    add(item);
    toast.push(`${item.name} added to cart`);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await api.get('/api/menu');
        if (!cancelled) setMenu(res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load menu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!auth.token) {
        setRecs([]);
        return;
      }
      try {
        const res = await api.get('/api/recommendations');
        if (!cancelled) setRecs(res.data);
      } catch {
        if (!cancelled) setRecs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.token]);

  const categories = useMemo(() => {
    const set = new Set(menu.map((m) => m.category));
    return ['All', ...Array.from(set)];
  }, [menu]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, MenuItem[]>();
    for (const item of menu) {
      if (activeCat !== 'All' && item.category !== activeCat) continue;
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) continue;
      map.set(item.category, [...(map.get(item.category) ?? []), item]);
    }
    return Array.from(map.entries());
  }, [menu, activeCat, query]);

  return (
    <div className="stack fade-up" style={{ gap: 'var(--sp-5)' }}>
      <section className="hero">
        <img
          className="hero-photo"
          src="/food/chicken-biryani.jpg"
          alt=""
          aria-hidden="true"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="hero-content">
          <span className="kicker">● Fresh · Fast · Flavorful</span>
          <h1>Craving something delicious?</h1>
          <p>
            Browse our chef-curated menu, build your cart, and get intelligent, explainable
            recommendations tailored to your taste.
          </p>
        </div>
      </section>

      <section className="stack" style={{ gap: 'var(--sp-3)' }}>
        <div className="section-title">
          <h2>How it works</h2>
          <span className="count-note">4 simple steps</span>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card step">
              <span className="step-num">{i + 1}</span>
              <div className="step-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      {auth.token ? (
        recs.length > 0 && (
          <section className="card recs fade-up">
            <div className="section-title">
              <h2>Recommended for you</h2>
              <span className="count-note">explainable picks</span>
            </div>
            <div className="rec-list">
              {recs.map((r) => {
                const item = menu.find((m) => m.id === r.menuItemId);
                const qty = item ? qtyOf(item.id) : 0;
                return (
                  <div key={r.menuItemId} className="rec-item">
                    <span className="spark">✨</span>
                    <div className="rec-body">
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div className="muted" style={{ fontSize: '0.84rem' }}>
                        {r.reason}
                      </div>
                    </div>
                    {item && (
                      <div className="rec-action">
                        <span className="price">₹{Number(item.price).toFixed(2)}</span>
                        {qty > 0 ? (
                          <div className="qty">
                            <button onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease">
                              −
                            </button>
                            <span>{qty}</span>
                            <button onClick={() => setQty(item.id, qty + 1)} aria-label="Increase">
                              +
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAdd(item)}>
                            + Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )
      ) : (
        <div className="card card-pad muted" style={{ fontSize: '0.9rem' }}>
          🔐 Log in to unlock personalized, explainable recommendations.
        </div>
      )}

      {!loading && categories.length > 1 && (
        <div className="menu-toolbar">
          <div className="search">
            <span className="search-ic" aria-hidden="true">🔍</span>
            <input
              className="input search-input"
              type="search"
              placeholder="Search dishes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search dishes"
            />
          </div>
          <div className="chips">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${activeCat === c ? 'active' : ''}`}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="menu-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card menu-item">
              <div className="food-img" />
              <div className="body">
                <div className="name muted">Loading…</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        grouped.length === 0 ? (
          <div className="card empty">
            <span className="emoji">🍽️</span>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>No dishes found</div>
            <div>Try a different search or category.</div>
          </div>
        ) : (
        grouped.map(([category, items]) => (
          <section key={category} className="stack" style={{ gap: 'var(--sp-3)' }}>
            <div className="section-title">
              <h2>{category}</h2>
              <span className="count-note">{items.length} items</span>
            </div>
            <div className="menu-grid">
              {items.map((item, i) => {
                const qty = qtyOf(item.id);
                return (
                <article
                  key={item.id}
                  className="card card-hover menu-item fade-up"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                >
                  <FoodImage name={item.name} category={item.category} />
                  <div className="body">
                    <div className="top">
                      <div className="name">{item.name}</div>
                      <span className={`badge ${item.vegetarian ? 'badge-veg' : 'badge-nonveg'}`}>
                        <span className={`dot ${item.vegetarian ? 'dot-veg' : 'dot-nonveg'}`} />
                        {item.vegetarian ? 'Veg' : 'Non-veg'}
                      </span>
                    </div>
                    <div className="meta">
                      <SpiceMeter level={item.spiceLevel} />
                    </div>
                    <div className="foot">
                      <span className="price">₹{Number(item.price).toFixed(2)}</span>
                      {qty > 0 ? (
                        <div className="qty">
                          <button onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease">
                            −
                          </button>
                          <span>{qty}</span>
                          <button onClick={() => setQty(item.id, qty + 1)} aria-label="Increase">
                            +
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => handleAdd(item)}>
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          </section>
        ))
        )
      )}
    </div>
  );
}
