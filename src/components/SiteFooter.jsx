import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useShop } from '../lib/config';

const ext = { target: '_blank', rel: 'noreferrer' };

export default function SiteFooter() {
  // Contact details the admin entered in /admin/cai-dat; anything not filled in is left out.
  const shop = useShop();
  const hasChat = !!(shop.zaloUrl || shop.messengerUrl);
  return (
    <footer className="cat site-footer" style={{ background: '#f6efe6' }}>
      <div
        className="wrap"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: '32px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.webp"
              alt=""
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span className="hh">Cat Handy</span>
          </div>
          <p className="bsm mut">
            Quà tặng chibi làm thủ công. Mỗi món được shop làm tay và gửi ảnh để bạn duyệt trước khi giao.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Mua quà</span>
          <Link to="/tao-chibi" className="bsm">
            Tự tay tạo chibi
          </Link>
          <Link to="/san-pham" className="bsm">
            Hộp gỗ chibi
          </Link>
          <Link to="/san-pham" className="bsm">
            Hộp mica chibi
          </Link>
          <Link to="/san-pham" className="bsm">
            Quà cưới cao cấp
          </Link>
          <Link to="/san-pham" className="bsm">
            Set quà có sẵn
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Hỗ trợ</span>
          <Link to="/tao-chibi" className="bsm">
            Hướng dẫn đặt quà thiết kế
          </Link>
          <Link to="/tra-cuu" className="bsm">
            Tra cứu đơn hàng
          </Link>
          <Link to="/tra-cuu" className="bsm">
            Duyệt ảnh trước khi giao
          </Link>
          <Link to="/tai-khoan" className="bsm">
            Tài khoản của bạn
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Liên hệ</span>
          {shop.phone ? (
            <a href={'tel:' + shop.phone} className="bsm">
              Zalo / Điện thoại: {shop.phone}
            </a>
          ) : null}
          {shop.email ? (
            <a href={'mailto:' + shop.email} className="bsm">
              Email: {shop.email}
            </a>
          ) : null}
          {shop.shopeeUrl ? (
            <a href={shop.shopeeUrl} {...ext} className="bsm deep" style={{ fontWeight: '500' }}>
              Gian hàng Shopee
            </a>
          ) : null}
          {shop.facebookUrl ? (
            <a href={shop.facebookUrl} {...ext} className="bsm deep" style={{ fontWeight: '500' }}>
              Fanpage Facebook
            </a>
          ) : null}
          {!shop.phone && !shop.email && !shop.shopeeUrl && !shop.facebookUrl ? (
            <Link to="/tra-cuu" className="bsm">
              Tra cứu đơn hàng
            </Link>
          ) : null}
        </div>
      </div>
      <div className="wrap" style={{ marginTop: '48px' }}>
        <hr className="hr" />
        <p className="cap" style={{ paddingTop: '24px' }}>
          © 2026 Cat Handy. Quà handmade, làm bằng tay và bằng cả tấm lòng.
        </p>
      </div>
      {hasChat ? (
        <div
          className="glass-see fab"
          style={{ boxShadow: '0 12px 32px rgba(42,31,45,0.12)' }}
        >
          {shop.zaloUrl ? (
            <a href={shop.zaloUrl} {...ext} className="btn btn-ink" aria-label="Chat Zalo">
              <Icon name="message" />
              <span>Chat Zalo</span>
            </a>
          ) : null}
          {shop.messengerUrl ? (
            <a href={shop.messengerUrl} {...ext} className="btn btn-line" aria-label="Messenger">
              <Icon name="message" />
              <span>Messenger</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}
