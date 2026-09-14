import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import { useAuth } from './state/auth';
import { useCart } from './state/cart';
import { useTheme } from './state/theme';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import TrackPage from './pages/TrackPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`scroll-top ${show ? 'show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="knob">{theme === 'dark' ? '🌙' : '☀️'}</span>
    </button>
  );
}

function App() {
  const { auth, logout } = useAuth();
  const { lines } = useCart();
  const navigate = useNavigate();
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);
  const initial = auth.email ? auth.email[0].toUpperCase() : '?';

  return (
    <div className="app-shell">
      <header className="appbar">
        <div className="appbar-inner">
          <div className="brand">
            <span className="logo-mark">🍽️</span>
            <div>
              Savora
              <div className="brand-sub">Order · Track · Enjoy</div>
            </div>
          </div>

          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end>
              <span className="label">Menu</span>
            </NavLink>
            <NavLink to="/cart">
              <span className="label">Cart</span>
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </NavLink>
            <NavLink to="/orders">
              <span className="label">Orders</span>
            </NavLink>
            <NavLink to="/track">
              <span className="label">Track</span>
            </NavLink>
          </nav>

          <div className="appbar-actions">
            <ThemeToggle />
            {auth.token ? (
              <>
                <span className="user-chip">
                  <span className="avatar">{initial}</span>
                  <span className="email">{auth.email}</span>
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-sm">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-sm btn-primary">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      <ScrollTop />
    </div>
  );
}

export default App;
