import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function SiteFooter() {
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
          <span className="bsm">Zalo / Điện thoại: [SĐT của shop]</span>
          <span className="bsm">Email: [Email của shop]</span>
          <a href="#" className="bsm deep" style={{ fontWeight: '500' }}>
            Gian hàng Shopee
          </a>
          <a href="#" className="bsm deep" style={{ fontWeight: '500' }}>
            Fanpage Facebook
          </a>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: '48px' }}>
        <hr className="hr" />
        <p className="cap" style={{ paddingTop: '24px' }}>
          © 2026 Cat Handy. Quà handmade, làm bằng tay và bằng cả tấm lòng.
        </p>
      </div>
      <div
        className="glass-see fab"
        style={{ boxShadow: '0 12px 32px rgba(42,31,45,0.12)' }}
      >
        <a href="#" className="btn btn-ink" aria-label="Chat Zalo">
          <Icon name="message" />
          <span>Chat Zalo</span>
        </a>
        <a href="#" className="btn btn-line" aria-label="Messenger">
          <Icon name="message" />
          <span>Messenger</span>
        </a>
      </div>
    </footer>
  );
}
