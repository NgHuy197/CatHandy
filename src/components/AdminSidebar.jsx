import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import css from '../lib/css';
import { useUnseenOrders } from '../lib/adminAlerts';
import { logout } from '../lib/auth';

export default function AdminSidebar(props) {
  const a = props.active || 'dash';
  const unseen = useUnseenOrders();
  const navigate = useNavigate();
  const st = (id) =>
    'display:flex;align-items:center;gap:12px;min-height:44px;padding:0 16px;border-radius:999px;font:500 14px/20px "Be Vietnam Pro",sans-serif;color:#2a1f2d;background:' +
    (a === id ? '#fddede' : 'transparent');
  const cur = (id) => (a === id ? 'page' : undefined);
  const vals = {
    sDash: st('dash'),
    sOrders: st('orders'),
    sCust: st('cust'),
    sOpt: st('opt'),
    sProd: st('prod'),
    sSettings: st('settings'),
  };

  // In the top-bar layout the nav scrolls sideways; keep the current page in view.
  const navRef = useRef(null);
  useEffect(() => {
    const nav = navRef.current;
    const link = nav.querySelector('[aria-current="page"]');
    if (link) nav.scrollLeft = link.offsetLeft - nav.offsetLeft - 16;
  }, [a]);

  return (
    <div className="cat admin-sidebar" style={{ background: 'transparent' }}>
      <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo.webp"
          alt=""
          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="hh" style={{ fontSize: '20px', lineHeight: '24px' }}>
            Cat Handy
          </span>
          <span className="cap">Trang quản trị</span>
        </div>
      </div>
      <nav ref={navRef} aria-label="Quản trị" className="admin-nav">
        <Link to="/admin" style={css(vals.sDash)} aria-current={cur('dash')}>
          <Icon name="dashboard" />
          Tổng quan
        </Link>
        <Link to="/admin/don-hang" style={css(vals.sOrders)} aria-current={cur('orders')}>
          <Icon name="package" />
          <span style={{ flex: '1' }}>Đơn hàng</span>
          {unseen ? (
            <span
              aria-label={unseen + ' đơn mới chưa xem'}
              style={{
                minWidth: '22px',
                height: '22px',
                padding: '0 6px',
                borderRadius: '999px',
                background: '#b0343f',
                color: '#ffffff',
                font: "600 12px/22px 'Be Vietnam Pro', sans-serif",
                textAlign: 'center',
              }}
            >
              {unseen}
            </span>
          ) : null}
        </Link>
        <Link to="/admin/khach-hang" style={css(vals.sCust)} aria-current={cur('cust')}>
          <Icon name="users" />
          Khách hàng
        </Link>
        <Link to="/admin/tuy-chon" style={css(vals.sOpt)} aria-current={cur('opt')}>
          <Icon name="sliders" />
          Tùy chọn chibi
        </Link>
        <Link to="/admin/san-pham" style={css(vals.sProd)} aria-current={cur('prod')}>
          <Icon name="gift" />
          Sản phẩm có sẵn
        </Link>
        <Link to="/admin/cai-dat" style={css(vals.sSettings)} aria-current={cur('settings')}>
          <Icon name="info" />
          Cài đặt shop
        </Link>
      </nav>
      <hr className="hr admin-hr" />
      <Link
        to="/"
        className="admin-exit"
        aria-label="Xem website"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '44px',
          padding: '0 16px',
          borderRadius: '999px',
          font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
          color: '#2a1f2d',
        }}
      >
        <Icon name="external" />
        <span>Xem website</span>
      </Link>
      <button
        type="button"
        className="admin-exit btn btn-ghost"
        onClick={() => logout().finally(() => navigate('/'))}
        style={{ justifyContent: 'flex-start', gap: '12px', padding: '0 16px', fontWeight: '500' }}
      >
        <Icon name="user" />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
}
