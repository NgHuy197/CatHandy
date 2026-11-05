import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import css from '../lib/css';
import { cartCount, useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';

export default function SiteHeader(props) {
  const count = cartCount(useCart().items);
  const a = props.active || 'home';
  const overVideo = props.clear === true || props.clear === 'true';
  const dark = true;
  const on = dark ? 'background:rgba(255,255,255,.2);color:#ffffff;' : 'background:#2a1f2d;color:#fdf9f3;';
  const off = dark ? 'background:transparent;color:#ffffff;' : 'background:transparent;color:#2a1f2d;';
  const hot = 'background:#fddede;color:#2a1f2d;';
  const mk = (id, label, href, hotItem) => ({ label, href, hot: hotItem, style: hotItem ? hot : a === id ? on : off });
  const { user } = useAuth();
  const signedIn = !!user;
  const accountLabel = user ? 'Tài khoản của ' + (user.name || user.email) : '';
  const vals = {
    links: [
      mk('home', 'Trang chủ', '/', false),
      mk('shop', 'Sản phẩm', '/san-pham', false),
      mk('custom', 'Tự tay tạo chibi', '/tao-chibi', true),
      mk('track', 'Tra cứu đơn', '/tra-cuu', false),
    ],
    extras: [
      { label: 'Tìm kiếm', href: '/san-pham', icon: 'search' },
      { label: 'Yêu thích', href: '/tai-khoan', icon: 'heart' },
      signedIn
        ? { label: accountLabel, href: '/tai-khoan', icon: 'users' }
        : { label: 'Đăng nhập', href: '/dang-nhap', icon: 'users' },
    ],
    glassCls: 'nav-dark-glass',
    signedIn,
    guest: !signedIn,
  };

  const [open, setOpen] = useState(false);
  const barRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => e.key === 'Escape' && setOpen(false);
    const down = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', key);
    window.addEventListener('pointerdown', down);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('pointerdown', down);
    };
  }, [open]);

  return (
    <header className={overVideo ? 'cat nav-dark site-header' : 'cat nav-dark nav-sky site-header'}>
      <div ref={barRef} className={`${vals.glassCls} site-bar site-bar-fit`}>
        <Link to="/" className="site-logo">
          <img src="/logo.webp" alt="" />
          <span className="hh" style={dark ? { color: '#ffffff' } : undefined}>
            Cat Handy
          </span>
        </Link>
        {dark ? <span className="nav-divider" aria-hidden="true" /> : null}
        <nav id="site-menu" aria-label="Điều hướng chính" className={open ? 'site-nav open' : 'site-nav'}>
          {vals.links.map((n, index) => (
            <Link key={index} to={n.href} className={n.hot ? 'btn nav-hot' : 'btn'} style={css(n.style)}>
              {n.label}
            </Link>
          ))}
          {vals.extras.map((n, index) => (
            <Link key={index} to={n.href} className="btn nav-extra" style={css(off)}>
              <Icon name={n.icon} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <Link
            to="/san-pham"
            className="btn btn-ghost btn-icon nav-wide"
            aria-label="Tìm kiếm"
            style={dark ? { color: '#ffffff' } : undefined}
          >
            <Icon name="search" />
          </Link>
          <Link
            to="/tai-khoan"
            className="btn btn-ghost btn-icon nav-wide"
            aria-label="Danh sách yêu thích"
            style={dark ? { color: '#ffffff' } : undefined}
          >
            <Icon name="heart" />
          </Link>
          <Link
            to="/gio-hang"
            className="btn btn-ghost btn-icon"
            aria-label={`Giỏ hàng, ${count} mục`}
            style={{ position: 'relative', color: dark ? '#ffffff' : undefined }}
          >
            <Icon name="bag" />
            {count > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '2px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 5px',
                  borderRadius: '999px',
                  background: '#fd9999',
                  color: '#2a1f2d',
                  font: "600 11px/18px 'Be Vietnam Pro', sans-serif",
                  textAlign: 'center',
                }}
              >
                {count}
              </span>
            ) : null}
          </Link>
          {vals.signedIn ? (
            <>
              <Link
                to="/tai-khoan"
                className="btn btn-pink btn-icon nav-wide"
                aria-label={accountLabel}
                style={{ marginLeft: '4px' }}
              >
                {(user.name || user.email).trim().charAt(0).toUpperCase()}
              </Link>
            </>
          ) : null}
          {vals.guest ? (
            <>
              <Link
                to="/dang-nhap"
                className="btn btn-line nav-wide"
                style={{
                  marginLeft: '4px',
                  ...(dark ? { background: '#ffffff', color: '#2a1f2d', borderColor: '#ffffff' } : null),
                }}
              >
                Đăng nhập
              </Link>
            </>
          ) : null}
          <button
            type="button"
            className="btn btn-ghost btn-icon nav-toggle"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(!open)}
            style={dark ? { color: '#ffffff' } : undefined}
          >
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  );
}
