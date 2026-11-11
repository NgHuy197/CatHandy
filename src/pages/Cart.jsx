import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import { chibi, formatPrice } from '../lib/chibi';
import { cartCount, cartTotal, removeItem, repricedBox, setQty, useCart, useFreshPrices } from '../lib/cart';

export default function Cart() {
  const { items: cart } = useCart();
  const repriced = useFreshPrices();
  const items = cart.map((it) => ({
    ...it,
    kind: it.isCustom ? 'Chibi tự thiết kế' : 'Có sẵn',
    tagCls: it.isCustom ? 'tag' : 'tag t-ok',
    hasB: !!it.b,
    lineTotal: formatPrice(it.price * it.qty),
    inc: () => setQty(it.id, it.qty + 1),
    dec: () => setQty(it.id, it.qty - 1),
    remove: () => removeItem(it.id),
  }));
  const vals = {
    items,
    hasItems: items.length > 0,
    empty: items.length === 0,
    subtotal: formatPrice(cartTotal(cart)),
    count: cartCount(cart),
  };

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Giỏ hàng</span>
          <h1 className="hd">Quà của bạn</h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          <section
            style={{
              flex: '999 1 560px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {vals.hasItems ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {vals.items.map((it, index) => (
                    <article
                      key={it.id}
                      className="card"
                      style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '160px',
                          height: '160px',
                          borderRadius: '20px',
                          background: it.wash,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          gap: '2%',
                          paddingBottom: '12px',
                          flex: 'none',
                        }}
                      >
                        <div style={{ width: '44%' }}>
                          <Chibi {...it.a} />
                        </div>
                        {it.hasB ? (
                          <>
                            <div style={{ width: '44%' }}>
                              <Chibi {...it.b} />
                            </div>
                          </>
                        ) : null}
                      </div>
                      <div
                        style={{
                          flex: '1 1 260px',
                          minWidth: '0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '16px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span className={it.tagCls} style={{ alignSelf: 'flex-start' }}>
                              {it.kind}
                            </span>
                            <h2 className="hh">{it.title}</h2>
                            <span className="bsm mut">{it.sub}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            aria-label="Xóa khỏi giỏ hàng"
                            onClick={it.remove}
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                        {it.isCustom ? (
                          <>
                            <ul
                              style={{
                                margin: '0',
                                padding: '0',
                                listStyle: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                              }}
                            >
                              {it.lines.map((line) => (
                                <li key={line} className="bsm">
                                  {line}
                                </li>
                              ))}
                              <li className="bsm mut">Ghi chú: {it.note || 'Chưa có ghi chú'}</li>
                            </ul>
                            <Link
                              to="/tao-chibi"
                              state={{ design: it.design, editId: it.id }}
                              className="bsm deep"
                              style={{ fontWeight: '500', textDecoration: 'underline' }}
                            >
                              Chỉnh sửa thiết kế
                            </Link>
                          </>
                        ) : null}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                            marginTop: 'auto',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid #857a80',
                              borderRadius: '999px',
                              background: '#ffffff',
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon"
                              aria-label="Giảm số lượng"
                              onClick={it.dec}
                            >
                              <Icon name="minus" />
                            </button>
                            <span
                              style={{ minWidth: '32px', textAlign: 'center', fontWeight: '600' }}
                              aria-live="polite"
                            >
                              {it.qty}
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon"
                              aria-label="Tăng số lượng"
                              onClick={it.inc}
                            >
                              <Icon name="plus" />
                            </button>
                          </div>
                          <span className="hh">{it.lineTotal}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
            {vals.empty ? (
              <>
                <div
                  className="card-2"
                  style={{
                    padding: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: 'flex-start',
                  }}
                >
                  <h2 className="hlg">Giỏ hàng đang trống</h2>
                  <p className="bsm mut">Chọn một set quà có sẵn hoặc tự tay tạo chibi của riêng bạn.</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link to="/san-pham" className="btn btn-line">
                      Xem quà có sẵn
                    </Link>
                    <Link to="/tao-chibi" className="btn btn-ink">
                      Tự tay tạo chibi
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
            <Link
              to="/san-pham"
              className="bsm"
              style={{ fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Icon name="chevronLeft" />
              Tiếp tục chọn quà
            </Link>
          </section>
          <aside
            style={{
              flex: '1 1 340px',
              maxWidth: '440px',
              minWidth: '0',
              background: '#ffffff',
              border: '1px solid #e3d8ca',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 1px 2px rgba(42,31,45,0.06), 0 4px 12px rgba(42,31,45,0.05)',
            }}
          >
            <h2 className="hh">Tóm tắt đơn</h2>
            {repriced ? (
              <p className="bsm" role="status" style={repricedBox}>
                Shop vừa cập nhật giá một số món, tạm tính dưới đây đã theo giá mới.
              </p>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span className="bsm mut">Tạm tính ({vals.count} món)</span>
                <span className="bsm" style={{ fontWeight: '500' }}>
                  {vals.subtotal}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span className="bsm mut">Phí vận chuyển</span>
                <span className="bsm" style={{ fontWeight: '500' }}>
                  Shop báo khi liên hệ
                </span>
              </div>
            </div>
            <hr className="hr" />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <span className="flabel">Tổng tạm tính</span>
              <span className="hlg">{vals.subtotal}</span>
            </div>
            <Link to="/dat-hang" className="btn btn-ink btn-lg">
              Gửi đơn cho shop
            </Link>
            <div
              style={{
                background: '#fdeeee',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <Icon name="info" style={{ marginTop: '2px' }} />
              <p className="bsm">
                Sau khi bạn gửi đơn, shop sẽ liên hệ qua Zalo hoặc điện thoại để chốt chi tiết.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
