import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { chibi } from '../lib/chibi';

export default function Account() {
  const [state, setState] = useMergedState({ tab: 'orders', name: 'Huy', phone: '', addr: '' });

  const st = state;
  const TABS = [
    ['profile', 'Hồ sơ và địa chỉ'],
    ['orders', 'Lịch sử đơn hàng'],
    ['wish', 'Danh sách yêu thích'],
  ];
  const vals = {
    yes: true,
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
    onName: (e) => setState({ name: e.target.value }),
    onPhone: (e) => setState({ phone: e.target.value }),
    onAddr: (e) => setState({ addr: e.target.value }),
    wish: [
      {
        title: 'Cặp đôi áo dài',
        price: '389.000đ',
        wash: '#fddede',
        a: chibi({ hair: 'long', outfitColor: '#c9484f' }),
      },
      {
        title: 'Bé hoa tặng mẹ',
        price: '259.000đ',
        wash: '#e8e0f8',
        a: chibi({ hair: 'bun', outfit: 'shirt', outfitColor: '#cbbdf0', accessory: 'bouquet' }),
      },
      {
        title: 'Chibi vest xanh',
        price: '289.000đ',
        wash: '#d6ebfa',
        a: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', glasses: true }),
      },
    ],
  };

  return (
    <div className="cat">
      <SiteHeader active="none" signedIn={vals.yes} />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Tài khoản</span>
          <h1 className="hd">Xin chào, Huy</h1>
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
                  font: "400 24px/30px 'Coiny', sans-serif",
                }}
              >
                H
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="bsm" style={{ fontWeight: '600' }}>
                  Huy
                </span>
                <span className="cap">[email của bạn]</span>
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
            <button type="button" className="btn btn-line">
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
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                      <input id="a1" className="input" value={vals.name} onChange={vals.onName} />
                    </div>
                    <div className="field">
                      <label htmlFor="a2">Email</label>
                      <input id="a2" className="input" defaultValue="[email của bạn]" readOnly="" />
                    </div>
                    <div className="field">
                      <label htmlFor="a3">Số điện thoại hoặc Zalo</label>
                      <input
                        id="a3"
                        className="input"
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
                      value={vals.addr}
                      onChange={vals.onAddr}
                      placeholder="Số nhà, đường, phường, quận, tỉnh hoặc thành phố"
                    />
                  </div>
                  <div>
                    <button type="button" className="btn btn-ink">
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </>
            ) : null}
            {vals.isOrders ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 className="hh">Lịch sử đơn hàng</h2>
                    <p className="bsm mut">Xem lại đơn đã đặt và đặt lại mẫu custom đã lưu.</p>
                  </div>
                  <article className="card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '140px',
                        height: '140px',
                        borderRadius: '20px',
                        background: '#fddede',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '2%',
                        paddingBottom: '10px',
                        flex: 'none',
                      }}
                    >
                      <div style={{ width: '44%' }}>
                        <Chibi hair="long" outfitColor="#c9484f" accessory="bouquet" />
                      </div>
                      <div style={{ width: '44%' }}>
                        <Chibi skin="#e8b896" outfit="vest" outfitColor="#34405a" face="wink" />
                      </div>
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
                        <span className="hh">CH-0001</span>
                        <span className="tag t-butter">Đang làm đồ</span>
                      </div>
                      <span className="bsm mut">Đặt ngày [ngày đặt], 2 món, 763.000đ</span>
                      <div
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
                        <span className="bsm">
                          Hộp gỗ chibi, 2 nhân vật. Tóc dài đen, áo dài đỏ, bó hoa. Tóc ngắn đen, vest xanh
                          navy.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Link to="/tra-cuu" className="btn btn-ink">
                          Theo dõi đơn
                        </Link>
                        <Link to="/tao-chibi" className="btn btn-line">
                          Đặt lại mẫu này
                        </Link>
                      </div>
                    </div>
                  </article>
                  <article className="card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '140px',
                        height: '140px',
                        borderRadius: '20px',
                        background: '#e8e0f8',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingBottom: '10px',
                        flex: 'none',
                      }}
                    >
                      <div style={{ width: '44%' }}>
                        <Chibi hair="bun" outfit="shirt" outfitColor="#cbbdf0" accessory="flower" />
                      </div>
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
                        <span className="hh">CH-0000</span>
                        <span className="tag t-ok">Đã giao</span>
                      </div>
                      <span className="bsm mut">Đặt ngày [ngày đặt], 1 món, [tổng tiền]</span>
                      <div
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
                        <span className="bsm">
                          Hộp mica chibi, 1 nhân vật. Búi cao, áo sơ mi tím nhạt, hoa cài tóc.
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Link to="/tra-cuu" className="btn btn-line">
                          Xem chi tiết
                        </Link>
                        <Link to="/tao-chibi" className="btn btn-line">
                          Đặt lại mẫu này
                        </Link>
                      </div>
                    </div>
                  </article>
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
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
                      gap: '16px',
                    }}
                  >
                    {vals.wish.map((w, index) => (
                      <article
                        key={index}
                        className="card"
                        style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                      >
                        <Link
                          to="/san-pham/cap-doi-ao-dai"
                          style={{
                            position: 'relative',
                            background: w.wash,
                            borderRadius: '16px',
                            aspectRatio: '1 / 1',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '12%',
                          }}
                        >
                          <div style={{ width: '38%' }}>
                            <Chibi {...w.a} />
                          </div>
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
                          <span className="bsm">{w.price}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" className="btn btn-ink" style={{ flex: '1' }}>
                            Thêm vào giỏ
                          </button>
                          <button
                            type="button"
                            className="btn btn-line btn-icon"
                            aria-label="Bỏ khỏi yêu thích"
                            style={{ background: '#fddede' }}
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
