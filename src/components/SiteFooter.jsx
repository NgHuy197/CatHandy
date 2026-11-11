import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useFilledPolicies, useShop } from '../lib/config';

const ext = { target: '_blank', rel: 'noreferrer' };

export default function SiteFooter() {
  // Contact details the admin entered in /admin/cai-dat; anything not filled in is left out.
  const shop = useShop();
  const hasChat = !!(shop.zaloUrl || shop.messengerUrl);
  const policies = useFilledPolicies();
  // The seller's legal name, registration number and address, for whichever the admin filled in.
  const seller = [
    shop.ownerName,
    shop.businessId ? 'MST/ĐKKD: ' + shop.businessId : '',
    shop.address ? 'Địa chỉ: ' + shop.address : '',
  ].filter(Boolean);
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
          <Link to="/san-pham?loai=go" className="bsm">
            Hộp gỗ chibi
          </Link>
          <Link to="/san-pham?loai=mica" className="bsm">
            Hộp mica chibi
          </Link>
          <Link to="/san-pham?loai=cuoi" className="bsm">
            Quà cưới cao cấp
          </Link>
          <Link to="/san-pham?tinh-trang=co-san" className="bsm">
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
          {policies.map((p) => (
            <Link key={p.slug} to={'/chinh-sach/' + p.slug} className="bsm">
              {p.title}
            </Link>
          ))}
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
        {seller.length ? (
          <p className="cap" style={{ paddingTop: '24px' }}>
            {seller.join(' · ')}
          </p>
        ) : null}
        <p className="cap" style={{ paddingTop: seller.length ? '8px' : '24px' }}>
          © 2026 Cat Handy. Quà handmade, làm bằng tay và bằng cả tấm lòng.
        </p>
        {shop.bctUrl ? (
          <a href={shop.bctUrl} {...ext} className="cap deep" style={{ display: 'inline-block', paddingTop: '8px' }}>
            Đã thông báo Bộ Công Thương
          </a>
        ) : null}
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
