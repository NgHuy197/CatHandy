import { Link, Navigate, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { formatPrice } from '../lib/chibi';
import { addReadyItem } from '../lib/cart';
import { useApi } from '../lib/api';
import { changePassword, logout, updateProfile, useAuth } from '../lib/auth';
import { toCard } from '../lib/products';
import { toggleWish } from '../lib/wishlist';
import { statusInfo } from '../../shared/orders';
import { formatDate } from '../../shared/format';

const WASH = ['#fddede', '#e8e0f8', '#d3efe9', '#fbeab4'];
const stripLayers = (c) => {
  if (!c) return c;
  const { layers, ...rest } = c;
  return rest;
};

export default function Account() {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <div className="cat">
        <SiteHeader active="none" />
        <main className="wrap" style={{ paddingBlock: '48px 96px' }}>
          <p className="bsm mut" role="status">
            Đang tải tài khoản...
          </p>
        </main>
      </div>
    );
  }
  if (!user) return <Navigate to="/dang-nhap?next=/tai-khoan" replace />;
  return <AccountPage user={user} />;
}

// Change the password, or set a first one on an account made with Google. Other devices are signed out.
function PasswordForm({ user }) {
  const [st, setState] = useMergedState({ current: '', next: '', next2: '', busy: false, msg: '', error: '' });
  const field = (key) => ({ value: st[key], onChange: (e) => setState({ [key]: e.target.value, msg: '', error: '' }) });
  const submit = async (e) => {
    e.preventDefault();
    if (st.next !== st.next2) return setState({ error: 'Hai lần nhập mật khẩu mới chưa khớp.' });
    setState({ busy: true, msg: '', error: '' });
    try {
      await changePassword(st.current, st.next);
      setState({ busy: false, current: '', next: '', next2: '', msg: 'Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.' });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  return (
    <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 className="hh">{user.hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}</h2>
        <p className="bsm mut">
          {user.hasPassword
            ? 'Nếu shop vừa gửi bạn mật khẩu tạm, hãy đổi sang mật khẩu của riêng bạn.'
            : 'Tài khoản của bạn đăng nhập bằng Google. Đặt thêm mật khẩu nếu muốn đăng nhập bằng email.'}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '16px' }}>
        {user.hasPassword ? (
          <div className="field">
            <label htmlFor="p1">Mật khẩu hiện tại</label>
            <input id="p1" className="input" type="password" autoComplete="current-password" required {...field('current')} />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="p2">Mật khẩu mới</label>
          <input id="p2" className="input" type="password" autoComplete="new-password" minLength={8} required {...field('next')} />
        </div>
        <div className="field">
          <label htmlFor="p3">Nhập lại mật khẩu mới</label>
          <input id="p3" className="input" type="password" autoComplete="new-password" minLength={8} required {...field('next2')} />
        </div>
      </div>
      {st.error ? (
        <p className="bsm" role="alert" style={{ background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' }}>
          {st.error}
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-ink" disabled={st.busy}>
          {st.busy ? 'Đang lưu...' : user.hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}
        </button>
        {st.msg ? (
          <span className="bsm mut" role="status">
            {st.msg}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function AccountPage({ user }) {
  const navigate = useNavigate();
  const [state, setState] = useMergedState({
    tab: 'orders',
    name: user.name,
    phone: user.phone,
    addr: user.address,
    saving: false,
    saved: '',
  });
  const orders = useApi('/account/orders');
  const wishlist = useApi('/account/wishlist');

  const st = state;
  const TABS = [
    ['profile', 'Hồ sơ và địa chỉ'],
    ['orders', 'Lịch sử đơn hàng'],
    ['wish', 'Danh sách yêu thích'],
  ];
  const display = user.name || user.email;
  const vals = {
    tabs: TABS.map((t) => {
      const on = st.tab === t[0];
      return {
        label: t[1],
        pick: () => setState({ tab: t[0] }),
        style:
          'text-align:left;min-height:44px;padding:0 16px;border-radius:999px;border:0;cursor:pointer;font:500 14px/20px "Be Vietnam Pro",sans-serif;color:#2a1f2d;background:' +
          (on ? '#fddede' : 'transparent'),
      };
    }),
    isProfile: st.tab === 'profile',
    isOrders: st.tab === 'orders',
    isWish: st.tab === 'wish',
    name: st.name,
    phone: st.phone,
    addr: st.addr,
    onName: (e) => setState({ name: e.target.value, saved: '' }),
    onPhone: (e) => setState({ phone: e.target.value, saved: '' }),
    onAddr: (e) => setState({ addr: e.target.value, saved: '' }),
    save: async (e) => {
      e.preventDefault();
      setState({ saving: true, saved: '' });
      try {
        const u = await updateProfile({ name: st.name, phone: st.phone, address: st.addr });
        setState({ saving: false, saved: 'Đã lưu thông tin.', phone: u.phone });
      } catch (err) {
        setState({ saving: false, saved: err.message });
      }
    },
    signOut: async () => {
      await logout().catch(() => {});
      navigate('/');
    },
    orders: (orders.data || []).map((o, i) => {
      const first = o.items[0];
      const custom = o.items.filter((it) => it.isCustom);
      const status = statusInfo(o.status);
      return {
        code: o.code,
        status: status.short,
        tagCls: status.tag,
        meta: `Đặt ngày ${formatDate(o.createdAt)},${o.items.reduce((s, it) => s + it.qty, 0)} món, ${formatPrice(o.total)}`,
        wash: WASH[i % WASH.length],
        a: first?.design?.a,
        b: first?.design?.b,
        // Each custom chibi in the order can be opened again in the customizer on its own.
        specs: custom.map((it) => ({
          text: `${it.title}, ${it.sub}. ${it.design.lines.join('. ')}.`,
          again: () =>
            navigate('/tao-chibi', {
              state: {
                design: {
                  box: it.design.box,
                  count: it.design.count,
                  chars: [stripLayers(it.design.a), stripLayers(it.design.b)].filter(Boolean),
                  note: it.design.note,
                },
              },
            }),
        })),
        ready: o.items.filter((it) => !it.isCustom).map((it) => it.title + (it.variant ? ` (${it.variant.toLowerCase()})` : '')),
        done: o.status === 'shipped',
      };
    }),
    wish: (wishlist.data || []).map(toCard).map((p) => ({
      ...p,
      priceText: (p.hasVariants ? 'Từ ' : '') + formatPrice(p.fromPrice),
      add: () =>
        p.hasVariants
          ? navigate('/san-pham/' + p.slug)
          : addReadyItem({ slug: p.slug, title: p.title, sub: p.sub, price: p.price, wash: p.wash, a: p.a, b: p.b }),
      remove: () => {
        wishlist.setData((list) => list.filter((x) => x.slug !== p.slug));
        toggleWish(p.slug).catch(() => wishlist.reload());
      },
    })),
  };

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Tài khoản</span>
          <h1 className="hd">Xin chào, {display}</h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          <aside
            className="card"
            style={{
              flex: '1 1 260px',
              maxWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#fd9999',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                  font: "400 24px/30px 'Coiny', sans-serif",
                }}
              >
                {display.trim().charAt(0).toUpperCase()}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                <span className="bsm" style={{ fontWeight: '600' }}>
                  {display}
                </span>
                <span className="cap" style={{ overflowWrap: 'anywhere' }}>
                  {user.email}
                </span>
              </div>
            </div>
            <hr className="hr" />
            <nav aria-label="Tài khoản" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {vals.tabs.map((t, index) => (
                <button key={index} type="button" onClick={t.pick} style={css(t.style)}>
                  {t.label}
                </button>
              ))}
            </nav>
            <hr className="hr" />
            {user.role === 'admin' ? (
              <Link to="/admin" className="btn btn-ink">
                Vào trang quản trị
              </Link>
            ) : null}
            <button type="button" className="btn btn-line" onClick={vals.signOut}>
              Đăng xuất
            </button>
          </aside>
          <section
            style={{
              flex: '999 1 540px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {vals.isProfile ? (
              <>
                <form className="card" onSubmit={vals.save} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 className="hh">Hồ sơ và thông tin nhận hàng</h2>
                    <p className="bsm mut">Thông tin này sẽ được điền sẵn khi bạn đặt hàng.</p>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div className="field">
                      <label htmlFor="a1">Họ và tên</label>
                      <input id="a1" className="input" required value={vals.name} onChange={vals.onName} />
                    </div>
                    <div className="field">
                      <label htmlFor="a2">Email</label>
                      <input id="a2" className="input" value={user.email} readOnly />
                    </div>
                    <div className="field">
                      <label htmlFor="a3">Số điện thoại hoặc Zalo</label>
                      <input
                        id="a3"
                        className="input"
                        autoComplete="tel"
                        value={vals.phone}
                        onChange={vals.onPhone}
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="a4">Địa chỉ nhận hàng mặc định</label>
                    <input
                      id="a4"
                      className="input"
                      autoComplete="street-address"
                      value={vals.addr}
                      onChange={vals.onAddr}
                      placeholder="Số nhà, đường, phường, quận, tỉnh hoặc thành phố"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn btn-ink" disabled={st.saving}>
                      {st.saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    {st.saved ? (
                      <span className="bsm mut" role="status">
                        {st.saved}
                      </span>
                    ) : null}
                  </div>
                </form>
                <PasswordForm user={user} />
              </>
            ) : null}
            {vals.isOrders ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 className="hh">Lịch sử đơn hàng</h2>
                    <p className="bsm mut">Xem lại đơn đã đặt và đặt lại mẫu custom đã lưu.</p>
                  </div>
                  {orders.error ? (
                    <p className="bsm" role="alert">
                      {orders.error.message}
                    </p>
                  ) : null}
                  {orders.data && !vals.orders.length ? (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                      <p className="bsm mut">Bạn chưa có đơn nào. Đơn đặt khi đã đăng nhập sẽ hiện ở đây.</p>
                      <Link to="/tao-chibi" className="btn btn-ink">
                        Tự tay tạo chibi
                      </Link>
                    </div>
                  ) : null}
                  {vals.orders.map((o) => (
                    <article key={o.code} className="card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          position: 'relative',
                          width: '140px',
                          height: '140px',
                          borderRadius: '20px',
                          background: o.wash,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          gap: '2%',
                          paddingBottom: '10px',
                          flex: 'none',
                        }}
                      >
                        {o.a ? (
                          <div style={{ width: '44%' }}>
                            <Chibi {...o.a} />
                          </div>
                        ) : null}
                        {o.b ? (
                          <div style={{ width: '44%' }}>
                            <Chibi {...o.b} />
                          </div>
                        ) : null}
                      </div>
                      <div
                        style={{
                          flex: '1 1 280px',
                          minWidth: '0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          <span className="hh">{o.code}</span>
                          <span className={o.tagCls}>{o.status}</span>
                        </div>
                        <span className="bsm mut">{o.meta}</span>
                        {o.specs.map((s, i) => (
                          <div
                            key={i}
                            style={{
                              background: '#f6efe6',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            <span className="cap">Thông số mẫu custom đã lưu</span>
                            <span className="bsm">{s.text}</span>
                            <button
                              type="button"
                              className="btn btn-line"
                              onClick={s.again}
                              style={{ alignSelf: 'flex-start', marginTop: '8px' }}
                            >
                              Đặt lại mẫu này
                            </button>
                          </div>
                        ))}
                        {o.ready.length ? <span className="bsm">Có sẵn: {o.ready.join(', ')}</span> : null}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Link to={'/tra-cuu?ma=' + o.code} className={o.done ? 'btn btn-line' : 'btn btn-ink'}>
                            {o.done ? 'Xem chi tiết' : 'Theo dõi đơn'}
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
            {vals.isWish ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 className="hh">Danh sách yêu thích</h2>
                    <p className="bsm mut">Các mẫu quà handmade bạn đã lưu.</p>
                  </div>
                  {wishlist.data && !vals.wish.length ? (
                    <p className="bsm mut">
                      Chưa có mẫu nào. Bấm biểu tượng trái tim ở{' '}
                      <Link to="/san-pham" className="deep" style={{ textDecoration: 'underline' }}>
                        trang sản phẩm
                      </Link>{' '}
                      để lưu.
                    </p>
                  ) : null}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
                      gap: '16px',
                    }}
                  >
                    {vals.wish.map((w) => (
                      <article
                        key={w.slug}
                        className="card"
                        style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                      >
                        <Link
                          to={'/san-pham/' + w.slug}
                          style={{
                            position: 'relative',
                            background: w.wash,
                            borderRadius: '16px',
                            aspectRatio: '1 / 1',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            gap: '2%',
                            paddingBottom: '12%',
                          }}
                        >
                          <div style={{ width: '38%' }}>
                            <Chibi {...w.a} />
                          </div>
                          {w.b ? (
                            <div style={{ width: '38%' }}>
                              <Chibi {...w.b} />
                            </div>
                          ) : null}
                        </Link>
                        <div
                          style={{
                            paddingInline: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <span className="bsm" style={{ fontWeight: '600' }}>
                            {w.title}
                          </span>
                          <span className="bsm">{w.priceText}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" className="btn btn-ink" style={{ flex: '1' }} onClick={w.add}>
                            {w.hasVariants ? 'Chọn mẫu' : 'Thêm vào giỏ'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-line btn-icon"
                            aria-label="Bỏ khỏi yêu thích"
                            style={{ background: '#fddede' }}
                            onClick={w.remove}
                          >
                            <Icon name="heart" style={{ fill: '#b0343f', stroke: '#b0343f' }} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
