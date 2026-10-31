import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';

export default function Auth() {
  const [state, setState] = useMergedState({ tab: 'login' });

  const l = state.tab === 'login';
  const vals = {
    isLogin: l,
    isSign: !l,
    loginCls: l ? 'chip on' : 'chip',
    signCls: l ? 'chip' : 'chip on',
    toLogin: () => setState({ tab: 'login' }),
    toSign: () => setState({ tab: 'sign' }),
    submitLabel: l ? 'Đăng nhập' : 'Tạo tài khoản',
    noop: (e) => {
      if (e && e.preventDefault) e.preventDefault();
    },
  };

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main className="wrap" style={{ paddingBlock: '24px 96px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'stretch' }}>
          <section
            style={{
              flex: '1 1 380px',
              minWidth: '0',
              background: '#fddede',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '32px',
              minHeight: '520px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="lbl">Tài khoản Cat Handy</span>
              <h1 className="hd">Lưu chibi của bạn, đặt lại chỉ một chạm</h1>
              <p className="sub" style={{ color: '#2a1f2d' }}>
                Tài khoản giúp tự điền thông tin nhận hàng, xem lịch sử đơn, lưu mẫu chibi đã thiết kế và danh
                sách yêu thích.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4%' }}>
              <div style={{ width: '30%' }}>
                <Chibi hair="long" outfitColor="#c9484f" accessory="bouquet" />
              </div>
              <div style={{ width: '30%' }}>
                <Chibi skin="#e8b896" outfit="vest" outfitColor="#34405a" face="wink" />
              </div>
            </div>
          </section>
          <section
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '24px',
              paddingBlock: '16px',
            }}
          >
            <div
              style={{ display: 'flex', gap: '8px' }}
              role="tablist"
              aria-label="Chọn đăng nhập hoặc đăng ký"
            >
              <button
                type="button"
                role="tab"
                className={vals.loginCls}
                aria-selected={vals.isLogin}
                onClick={vals.toLogin}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                className={vals.signCls}
                aria-selected={vals.isSign}
                onClick={vals.toSign}
              >
                Đăng ký
              </button>
            </div>
            <div
              className="glass"
              style={{
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                boxShadow: '0 1px 2px rgba(42,31,45,0.06), 0 4px 12px rgba(42,31,45,0.05)',
              }}
            >
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#e8e0f8',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                <Icon name="user" />
              </span>
              <div style={{ flex: '1 1 160px', minWidth: '0' }}>
                <div className="bsm" style={{ fontWeight: '500' }}>
                  Tiếp tục với Google
                </div>
                <div className="cap" style={{ color: '#6b5f66' }}>
                  [tên]@gmail.com
                </div>
              </div>
              <button type="button" className="btn btn-ink">
                Tiếp tục
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <hr className="hr" style={{ flex: '1' }} />
              <span className="cap">hoặc dùng email</span>
              <hr className="hr" style={{ flex: '1' }} />
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={vals.noop}>
              {vals.isSign ? (
                <>
                  <div className="field">
                    <label htmlFor="fn">Họ và tên</label>
                    <input id="fn" className="input" autoComplete="name" placeholder="Nguyễn Văn A" />
                  </div>
                </>
              ) : null}
              <div className="field">
                <label htmlFor="em">Email</label>
                <input
                  id="em"
                  type="email"
                  className="input"
                  autoComplete="email"
                  placeholder="ban@email.com"
                />
              </div>
              <div className="field">
                <label htmlFor="pw">Mật khẩu</label>
                <input
                  id="pw"
                  type="password"
                  className="input"
                  autoComplete="current-password"
                  placeholder="Ít nhất 8 ký tự"
                />
              </div>
              {vals.isSign ? (
                <>
                  <div className="field">
                    <label htmlFor="pw2">Nhập lại mật khẩu</label>
                    <input
                      id="pw2"
                      type="password"
                      className="input"
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                </>
              ) : null}
              {vals.isLogin ? (
                <>
                  <a
                    href="#"
                    className="bsm deep"
                    style={{ fontWeight: '500', alignSelf: 'flex-start', textDecoration: 'underline' }}
                  >
                    Quên mật khẩu?
                  </a>
                </>
              ) : null}
              <Link to="/tai-khoan" className="btn btn-ink btn-lg">
                {vals.submitLabel}
              </Link>
            </form>
            <p className="bsm mut">
              Bạn không cần tài khoản vẫn đặt được quà.{' '}
              <Link
                to="/dat-hang"
                className="deep"
                style={{ fontWeight: '500', textDecoration: 'underline' }}
              >
                Mua nhanh không cần đăng nhập
              </Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
