import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import { formatPrice } from '../lib/chibi';
import { addReadyItem } from '../lib/cart';

export default function Product() {
  const [state, setState] = useMergedState({ color: '#c9484f', size: 'm', qty: 1 });

  const st = state;
  const COL = [
    ['#c9484f', 'Đỏ'],
    ['#fd9999', 'Hồng'],
    ['#9ccbee', 'Xanh nhạt'],
    ['#fffaf0', 'Kem'],
  ];
  const SZ = [
    ['s', 'Nhỏ'],
    ['m', 'Vừa'],
  ];
  const price = (st.size === 'm' ? 389000 : 349000) * st.qty;
  const dress = st.color;
  const base = {
    skin: '#f7d9c4',
    hairColor: '#2f2430',
    outfitColor: '#fd9999',
    hair: 'short',
    face: 'smile',
    outfit: 'aodai',
    accessory: 'none',
    glasses: false,
    beard: false,
  };
  const vals = {
    pa: Object.assign({}, base, { hair: 'long', outfitColor: dress }),
    pb: Object.assign({}, base, { skin: '#e8b896', outfitColor: '#34405a', face: 'wink' }),
    colors: COL.map((o) => ({
      label: o[1],
      color: o[0],
      on: st.color === o[0],
      cls: st.color === o[0] ? 'tile on' : 'tile',
      pick: () => setState({ color: o[0] }),
    })),
    sizes: SZ.map((o) => ({
      label: o[1],
      on: st.size === o[0],
      cls: st.size === o[0] ? 'chip on' : 'chip',
      pick: () => setState({ size: o[0] }),
    })),
    qty: st.qty,
    inc: () => setState({ qty: Math.min(9, st.qty + 1) }),
    dec: () => setState({ qty: Math.max(1, st.qty - 1) }),
    priceText: formatPrice(price),
    add: () => {
      for (let i = 0; i < st.qty; i++)
        addReadyItem({
          title: 'Cặp đôi áo dài',
          sub: 'Hộp gỗ chibi, 2 nhân vật',
          price: st.size === 'm' ? 389000 : 349000,
          wash: '#fddede',
          a: { ...base, hair: 'long', outfitColor: dress },
          b: { ...base, skin: '#e8b896', outfitColor: '#34405a', face: 'wink' },
        });
    },
  };

  return (
    <div className="cat">
      <SiteHeader active="shop" />
      <main
        className="wrap"
        style={{ paddingBlock: '16px 96px', display: 'flex', flexDirection: 'column', gap: '64px' }}
      >
        <nav
          aria-label="Đường dẫn"
          className="bsm mut"
          style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/san-pham">Sản phẩm</Link>
          <span aria-hidden="true">/</span>
          <Link to="/san-pham">Hộp gỗ chibi</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: '#2a1f2d' }}>Cặp đôi áo dài</span>
        </nav>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '48px',
            alignItems: 'flex-start',
            marginTop: '-32px',
          }}
        >
          <section
            style={{
              flex: '1 1 460px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                position: 'relative',
                background: '#fddede',
                borderRadius: '24px',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '9%',
                  right: '9%',
                  bottom: '11%',
                  height: '44%',
                  borderRadius: '20px',
                  background: 'rgba(214,160,87,0.28)',
                  border: '6px solid rgba(214,160,87,0.55)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '2%',
                  paddingBottom: '18%',
                }}
              >
                <div style={{ width: '36%' }}>
                  <Chibi {...vals.pa} />
                </div>
                <div style={{ width: '36%' }}>
                  <Chibi {...vals.pb} />
                </div>
              </div>
              <span
                className="glass-clear"
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                }}
              >
                Ảnh 1 / 5
              </span>
              <button
                type="button"
                className="btn glass-clear btn-icon"
                aria-label="Ảnh sau"
                style={{ position: 'absolute', right: '16px', top: '50%', color: '#2a1f2d' }}
              >
                <Icon name="chevronRight" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '12px' }}>
              <button
                type="button"
                aria-label="Ảnh 1"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '2px solid #2a1f2d',
                  background: '#fddede',
                  cursor: 'pointer',
                  padding: '0',
                }}
              />
              <button
                type="button"
                aria-label="Ảnh 2"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '1px solid #e3d8ca',
                  background: '#fbeab4',
                  cursor: 'pointer',
                  padding: '0',
                }}
              />
              <button
                type="button"
                aria-label="Ảnh 3"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '1px solid #e3d8ca',
                  background: '#e8e0f8',
                  cursor: 'pointer',
                  padding: '0',
                }}
              />
              <button
                type="button"
                aria-label="Ảnh 4"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '1px solid #e3d8ca',
                  background: '#d3efe9',
                  cursor: 'pointer',
                  padding: '0',
                }}
              />
              <button
                type="button"
                aria-label="Video cận cảnh chất liệu"
                className="ph"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  border: '1px solid #e3d8ca',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                <Icon name="play" className="ic ic-24" />
              </button>
            </div>
            <p className="cap">
              Ảnh 5 là video cận cảnh chất liệu đồ handmade. [Thêm ảnh và video thật của sản phẩm]
            </p>
          </section>
          <section
            style={{
              flex: '1 1 400px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="tag t-ok">Có sẵn</span>
                <span className="tag t-butter">Hộp gỗ chibi</span>
              </div>
              <h1 className="hd">Cặp đôi áo dài</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <Icon name="star" className="star" />
                  <Icon name="star" className="star" />
                  <Icon name="star" className="star" />
                  <Icon name="star" className="star" />
                  <Icon name="star" className="star" />
                </div>
                <span className="bsm mut">4.9/5 trên Shopee</span>
              </div>
              <span className="hlg">{vals.priceText}</span>
              <p className="bsm mut">
                Hộp gỗ chibi với hai nhân vật mặc áo dài. Làm thủ công, shop gửi ảnh để bạn duyệt trước khi
                giao.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="flabel">Màu áo dài</span>
              <div
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
                role="group"
                aria-label="Chọn màu"
              >
                {vals.colors.map((k, index) => (
                  <button
                    key={index}
                    type="button"
                    className={k.cls}
                    aria-pressed={k.on}
                    aria-label={k.label}
                    onClick={k.pick}
                    style={{ minWidth: '88px', flexDirection: 'row', gap: '10px', padding: '8px 14px' }}
                  >
                    <span className="swatch" style={{ background: k.color, width: '24px', height: '24px' }} />
                    <span className="bsm">{k.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="flabel">Kích thước</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {vals.sizes.map((k, index) => (
                  <button key={index} type="button" className={k.cls} aria-pressed={k.on} onClick={k.pick}>
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                  onClick={vals.dec}
                >
                  <Icon name="minus" />
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '600' }} aria-live="polite">
                  {vals.qty}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Tăng số lượng"
                  onClick={vals.inc}
                >
                  <Icon name="plus" />
                </button>
              </div>
              <button
                type="button"
                className="btn btn-ink btn-lg"
                style={{ flex: '1 1 200px' }}
                onClick={vals.add}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                className="btn btn-line btn-icon btn-lg"
                aria-label="Lưu vào yêu thích"
                style={{ width: '52px', padding: '0' }}
              >
                <Icon name="heart" />
              </button>
            </div>
            <div
              style={{
                background: '#fddede',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 220px' }}>
                <span className="hh">Muốn khác một chút?</span>
                <span className="bsm">Hộp gỗ chibi sẽ được chọn sẵn, bạn chỉ cần đổi tóc và trang phục.</span>
              </div>
              <Link to="/tao-chibi?hop=wood" className="btn btn-ink">
                Tự tay tạo chibi
                <Icon name="arrowRight" />
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Icon name="truck" className="ic ic-24" />
                <span className="bsm">Giao dự kiến trong 2-4 ngày</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">Có ảnh duyệt trước khi giao</span>
              </div>
            </div>
          </section>
        </div>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="lbl">Đánh giá</span>
              <h2 className="hlg">Khách đã mua nói gì</h2>
            </div>
            <span className="bsm mut">4.9/5 trên Shopee</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: '24px',
            }}
          >
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="ph" style={{ aspectRatio: '4 / 3', flexDirection: 'column', gap: '8px' }}>
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Hình thực tế khách gửi]</span>
              </div>
              <p className="bsm mut">[Nội dung đánh giá của khách]</p>
              <span className="cap">[Tên khách], [ngày đánh giá]</span>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="ph" style={{ aspectRatio: '4 / 3', flexDirection: 'column', gap: '8px' }}>
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Hình thực tế khách gửi]</span>
              </div>
              <p className="bsm mut">[Nội dung đánh giá của khách]</p>
              <span className="cap">[Tên khách], [ngày đánh giá]</span>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="ph" style={{ aspectRatio: '4 / 3', flexDirection: 'column', gap: '8px' }}>
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Hình thực tế khách gửi]</span>
              </div>
              <p className="bsm mut">[Nội dung đánh giá của khách]</p>
              <span className="cap">[Tên khách], [ngày đánh giá]</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
