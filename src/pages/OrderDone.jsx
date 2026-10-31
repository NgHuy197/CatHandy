import { Link, Navigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import { useCart } from '../lib/cart';
import { formatPrice } from '../lib/chibi';

export default function OrderDone() {
  const { lastOrder: order } = useCart();
  if (!order) return <Navigate to="/gio-hang" replace />;

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main
        className="wrap"
        style={{
          paddingBlock: '32px 96px',
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '640px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#d3efe9',
              display: 'grid',
              placeItems: 'center',
              color: '#256b4c',
            }}
          >
            <Icon
              name="check"
              className="ic ic-24"
              style={{ width: '36px', height: '36px', strokeWidth: '2' }}
            />
          </div>
          <span className="tag t-ok">Đã gửi đơn thành công</span>
          <h1 className="hd">Shop đã nhận đơn của bạn</h1>
          <p className="sub">Shop sẽ liên hệ qua Zalo hoặc điện thoại để chốt chi tiết chế tác.</p>
        </div>
        <div
          className="card"
          style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="cap">Mã đơn của bạn</span>
              <span className="hlg">{order.code}</span>
            </div>
            <Link to="/tra-cuu" className="btn btn-line">
              Tra cứu tiến độ đơn
            </Link>
          </div>
          <hr className="hr" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="cap">Người nhận</span>
              <span className="bsm" style={{ fontWeight: '500' }}>
                {order.customer.name}
              </span>
              <span className="bsm mut">
                {order.customer.phone}, {order.customer.addr}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="cap">Các món đã đặt</span>
              {order.items.map((line) => (
                <span key={line} className="bsm" style={{ fontWeight: '500' }}>
                  {line}
                </span>
              ))}
            </div>
          </div>
          <hr className="hr" />
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}
          >
            <span className="flabel">Tổng tạm tính</span>
            <span className="hlg">{formatPrice(order.total)}</span>
          </div>
        </div>
        <div
          style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <h2 className="hh">Tiếp theo sẽ như thế nào</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                background: '#fddede',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span className="hh">1</span>
              <span className="bsm" style={{ fontWeight: '500' }}>
                Shop liên hệ bạn
              </span>
              <span className="bsm mut">Chốt chi tiết thiết kế và thời gian giao.</span>
            </div>
            <div
              style={{
                background: '#fbeab4',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span className="hh">2</span>
              <span className="bsm" style={{ fontWeight: '500' }}>
                Shop làm quà
              </span>
              <span className="bsm mut">Dự kiến hoàn thiện và giao trong 2-4 ngày.</span>
            </div>
            <div
              style={{
                background: '#d3efe9',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span className="hh">3</span>
              <span className="bsm" style={{ fontWeight: '500' }}>
                Bạn duyệt ảnh
              </span>
              <span className="bsm mut">Shop gửi ảnh thật, bạn xác nhận rồi shop mới giao.</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-line btn-lg">
            Về trang chủ
          </Link>
          <Link to="/san-pham" className="btn btn-ink btn-lg">
            Chọn thêm quà
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
