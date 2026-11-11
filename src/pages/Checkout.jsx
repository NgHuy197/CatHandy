import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import PrivacyNote from '../components/PrivacyNote';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import { cartTotal, placeOrder, useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { formatPrice } from '../lib/chibi';

const fromUser = (u) => ({ name: u?.name || '', phone: u?.phone || '', addr: u?.address || '' });

export default function Checkout() {
  const { user } = useAuth();
  const [state, setState] = useMergedState({
    member: !!user,
    ...fromUser(user),
    note: '',
    sending: false,
    error: '',
  });

  // The account may finish loading after the page opens; prefill once it does.
  useEffect(() => {
    if (user) setState({ member: true, ...fromUser(user) });
    else setState({ member: false });
  }, [user, setState]);

  const navigate = useNavigate();
  const { items: cart } = useCart();
  const st = state;
  const m = st.member;
  const vals = {
    isMember: m,
    isGuest: !m,
    memberCls: m ? 'chip on' : 'chip',
    guestCls: m ? 'chip' : 'chip on',
    setMember: () =>
      user ? setState({ member: true, ...fromUser(user) }) : navigate('/dang-nhap?next=/dat-hang'),
    setGuest: () => setState({ member: false, name: '', phone: '', addr: '' }),
    memberName: user?.name || user?.email || '',
    hasSaved: !!(user?.phone || user?.address),
    nameVal: st.name,
    phoneVal: st.phone,
    addrVal: st.addr,
    onName: (e) => setState({ name: e.target.value }),
    onPhone: (e) => setState({ phone: e.target.value }),
    onAddr: (e) => setState({ addr: e.target.value }),
    onNote: (e) => setState({ note: e.target.value }),
    submit: async (e) => {
      e.preventDefault();
      setState({ sending: true, error: '' });
      try {
        await placeOrder({ name: st.name, phone: st.phone, addr: st.addr, note: st.note });
        navigate('/dat-hang/thanh-cong');
      } catch (err) {
        setState({ sending: false, error: err.message });
      }
    },
    yes: true,
  };

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Đặt hàng</span>
          <h1 className="hd">Thông tin nhận quà</h1>
          <p className="sub" style={{ maxWidth: '600px' }}>
            Điền thông tin rồi gửi đơn cho shop. Shop sẽ liên hệ để chốt chi tiết chế tác.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          <form
            style={{
              flex: '999 1 560px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            onSubmit={vals.submit}
          >
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <h2 className="hh">Người nhận</h2>
                <div
                  style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                  role="group"
                  aria-label="Hình thức đặt hàng"
                >
                  <button
                    type="button"
                    className={vals.memberCls}
                    aria-pressed={vals.isMember}
                    onClick={vals.setMember}
                  >
                    Đã có tài khoản
                  </button>
                  <button
                    type="button"
                    className={vals.guestCls}
                    aria-pressed={vals.isGuest}
                    onClick={vals.setGuest}
                  >
                    Mua nhanh, không cần tài khoản
                  </button>
                </div>
              </div>
              {vals.isMember ? (
                <>
                  <div
                    style={{
                      background: '#fdeeee',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="check" />
                    <p className="bsm">
                      {vals.hasSaved
                        ? `Đã điền sẵn thông tin nhận hàng mặc định từ tài khoản của ${vals.memberName}. Bạn có thể sửa cho đơn này.`
                        : `Đơn này sẽ được lưu vào tài khoản của ${vals.memberName}, kèm thông tin nhận hàng để lần sau tự điền.`}
                    </p>
                  </div>
                </>
              ) : null}
              {vals.isGuest ? (
                <>
                  <div
                    style={{
                      background: '#f6efe6',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                    }}
                  >
                    <p className="bsm">
                      Bạn đang mua nhanh. Đăng nhập để tự điền thông tin và xem lại lịch sử đơn.
                    </p>
                    <Link to="/dang-nhap" className="btn btn-line">
                      Đăng nhập
                    </Link>
                  </div>
                </>
              ) : null}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                  gap: '16px',
                }}
              >
                <div className="field">
                  <label htmlFor="name">Họ và tên</label>
                  <input
                    id="name"
                    className="input"
                    autoComplete="name"
                    required
                    value={vals.nameVal}
                    onChange={vals.onName}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="field">
                  <label htmlFor="phone">Số điện thoại hoặc Zalo</label>
                  <input
                    id="phone"
                    className="input"
                    autoComplete="tel"
                    required
                    value={vals.phoneVal}
                    onChange={vals.onPhone}
                    placeholder="09xx xxx xxx"
                  />
                  <span className="cap">Shop dùng số này để liên hệ chốt đơn.</span>
                </div>
              </div>
              <div className="field">
                <label htmlFor="addr">Địa chỉ nhận hàng</label>
                <input
                  id="addr"
                  className="input"
                  autoComplete="street-address"
                  required
                  value={vals.addrVal}
                  onChange={vals.onAddr}
                  placeholder="Số nhà, đường, phường, quận, tỉnh hoặc thành phố"
                />
              </div>
              <div className="field">
                <label htmlFor="n">Ghi chú cho đơn</label>
                <textarea
                  id="n"
                  className="input"
                  rows="3"
                  value={st.note}
                  onChange={vals.onNote}
                  placeholder="Ví dụ: giao giờ hành chính, cần nhận trước ngày [ngày]"
                />
              </div>
            </div>
            {st.error ? (
              <p
                className="bsm"
                role="alert"
                style={{
                  background: 'var(--danger-wash)',
                  color: 'var(--danger)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}
              >
                {st.error}
              </p>
            ) : null}
            <PrivacyNote>
              Khi gửi đơn, bạn đồng ý để shop dùng họ tên, số điện thoại và địa chỉ bạn nhập để liên hệ chốt đơn, làm và
              giao quà.
            </PrivacyNote>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Link to="/gio-hang" className="btn btn-line">
                <Icon name="chevronLeft" />
                Quay lại giỏ hàng
              </Link>
              <button type="submit" className="btn btn-ink btn-lg" disabled={!cart.length || st.sending}>
                {st.sending ? 'Đang gửi đơn...' : 'Gửi đơn cho shop'}
              </button>
            </div>
          </form>
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
            <h2 className="hh">Đơn của bạn</h2>
            {cart.map((it) => (
              <div key={it.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: it.wash,
                    overflow: 'hidden',
                    position: 'relative',
                    flex: 'none',
                  }}
                >
                  <div style={{ position: 'absolute', width: '72px', left: '-4px', top: '-2px' }}>
                    <Chibi {...it.a} />
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '0' }}>
                  <div className="bsm" style={{ fontWeight: '500' }}>
                    {it.title}
                  </div>
                  <div className="cap">
                    {it.isCustom ? 'Chibi tự thiết kế' : 'Có sẵn'}, {it.qty} món
                  </div>
                </div>
                <span className="bsm" style={{ fontWeight: '500' }}>
                  {formatPrice(it.price * it.qty)}
                </span>
              </div>
            ))}
            <hr className="hr" />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <span className="bsm mut">Phí vận chuyển</span>
              <span className="bsm" style={{ fontWeight: '500' }}>
                Shop báo khi liên hệ
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '12px',
              }}
            >
              <span className="flabel">Tổng tạm tính</span>
              <span className="hlg">{formatPrice(cartTotal(cart))}</span>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
