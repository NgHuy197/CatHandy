import { useCallback } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import PrivacyNote from '../components/PrivacyNote';
import Icon from '../components/Icon';
import GoogleSignIn, { useGoogleClientId } from '../components/GoogleSignIn';
import useMergedState from '../lib/useMergedState';
import { login, register, useAuth } from '../lib/auth';
import { useShop } from '../lib/config';

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const googleId = useGoogleClientId();
  const [state, setState] = useMergedState({
    tab: params.get('tab') === 'dang-ky' ? 'sign' : 'login',
    name: '',
    email: '',
    password: '',
    password2: '',
    error: '',
    busy: false,
  });

  // Only same-site paths, so a crafted link cannot send people elsewhere after they sign in.
  const next = (params.get('next') || '').startsWith('/') && !params.get('next').startsWith('//') ? params.get('next') : null;
  const done = useCallback(
    (u) => navigate(next || (u.role === 'admin' ? '/admin' : '/tai-khoan'), { replace: true }),
    [navigate, next],
  );
  const googleError = useCallback((err) => setState({ error: err.message }), [setState]);
  // Password resets go through the shop, so the hint only shows when the admin has entered a way to reach it.
  const shop = useShop();
  const newTab = { target: '_blank', rel: 'noreferrer' };
  const contact = shop.zaloUrl
    ? { href: shop.zaloUrl, attrs: newTab, label: 'Zalo' }
    : shop.messengerUrl
      ? { href: shop.messengerUrl, attrs: newTab, label: 'Messenger' }
      : shop.phone
        ? { href: 'tel:' + shop.phone, label: 'Zalo hoặc điện thoại ' + shop.phone }
        : shop.email
          ? { href: 'mailto:' + shop.email, label: 'email ' + shop.email }
          : null;

  const st = state;
  const l = st.tab === 'login';
  const vals = {
    isLogin: l,
    isSign: !l,
    loginCls: l ? 'chip on' : 'chip',
    signCls: l ? 'chip' : 'chip on',
    toLogin: () => setState({ tab: 'login', error: '' }),
    toSign: () => setState({ tab: 'sign', error: '' }),
    submitLabel: st.busy ? 'Đang xử lý...' : l ? 'Đăng nhập' : 'Tạo tài khoản',
    field: (k) => ({ value: st[k], onChange: (e) => setState({ [k]: e.target.value }) }),
    submit: async (e) => {
      e.preventDefault();
      if (!l && st.password !== st.password2) return setState({ error: 'Hai mật khẩu chưa khớp nhau.' });
      setState({ busy: true, error: '' });
      try {
        done(l ? await login(st.email, st.password) : await register(st.name, st.email, st.password));
      } catch (err) {
        setState({ busy: false, error: err.message });
      }
    },
  };

  if (user && !st.busy) return <Navigate to={next || (user.role === 'admin' ? '/admin' : '/tai-khoan')} replace />;

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
            {googleId ? (
              <>
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
                      Không cần nhớ thêm mật khẩu
                    </div>
                  </div>
                  <GoogleSignIn clientId={googleId} onSignedIn={done} onError={googleError} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <hr className="hr" style={{ flex: '1' }} />
                  <span className="cap">hoặc dùng email</span>
                  <hr className="hr" style={{ flex: '1' }} />
                </div>
              </>
            ) : null}
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={vals.submit}>
              {vals.isSign ? (
                <>
                  <div className="field">
                    <label htmlFor="fn">Họ và tên</label>
                    <input
                      id="fn"
                      className="input"
                      autoComplete="name"
                      required
                      placeholder="Nguyễn Văn A"
                      {...vals.field('name')}
                    />
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
                  required
                  placeholder="ban@email.com"
                  {...vals.field('email')}
                />
              </div>
              <div className="field">
                <label htmlFor="pw">Mật khẩu</label>
                <input
                  id="pw"
                  type="password"
                  className="input"
                  autoComplete={vals.isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={vals.isSign ? 8 : undefined}
                  placeholder="Ít nhất 8 ký tự"
                  {...vals.field('password')}
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
                      required
                      placeholder="Nhập lại mật khẩu"
                      {...vals.field('password2')}
                    />
                  </div>
                </>
              ) : null}
              {vals.isLogin && contact ? (
                <p className="bsm mut">
                  Quên mật khẩu? Nhắn shop qua{' '}
                  <a href={contact.href} {...contact.attrs} className="deep" style={{ fontWeight: '500', textDecoration: 'underline' }}>
                    {contact.label}
                  </a>
                  , shop sẽ gửi bạn mật khẩu tạm.
                </p>
              ) : null}
              {st.error ? (
                <p
                  className="bsm"
                  role="alert"
                  style={{ background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' }}
                >
                  {st.error}
                </p>
              ) : null}
              {!vals.isLogin ? (
                <PrivacyNote>
                  Khi tạo tài khoản, bạn đồng ý để shop lưu họ tên và email của bạn để quản lý tài khoản và đơn hàng.
                </PrivacyNote>
              ) : null}
              <button type="submit" className="btn btn-ink btn-lg" disabled={st.busy}>
                {vals.submitLabel}
              </button>
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
