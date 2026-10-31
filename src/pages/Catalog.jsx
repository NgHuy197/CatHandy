import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import { chibi, formatPrice } from '../lib/chibi';
import { addReadyItem } from '../lib/cart';

export default function Catalog() {
  const [state, setState] = useMergedState({ q: '', cat: 'all', mat: 'all', price: 'all', stock: 'all', showFilters: false });

  const st = state;
  const all = [
    {
      title: 'Cặp đôi áo dài',
      sub: 'Hộp gỗ chibi, 2 nhân vật',
      cat: 'go',
      mat: 'Gỗ',
      price: 389000,
      ready: true,
      wash: '#fddede',
      a: chibi({ hair: 'long', outfitColor: '#c9484f' }),
      b: chibi({ skin: '#e8b896', outfitColor: '#34405a' }),
    },
    {
      title: 'Chibi vest xanh',
      sub: 'Hộp mica chibi, 1 nhân vật',
      cat: 'nam',
      mat: 'Mica',
      price: 289000,
      ready: true,
      wash: '#d6ebfa',
      a: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', glasses: true }),
    },
    {
      title: 'Bé hoa tặng mẹ',
      sub: 'Hộp gỗ chibi, 1 nhân vật',
      cat: 'go',
      mat: 'Gỗ',
      price: 259000,
      ready: true,
      wash: '#e8e0f8',
      a: chibi({ hair: 'bun', outfit: 'shirt', outfitColor: '#cbbdf0', accessory: 'bouquet' }),
    },
    {
      title: 'Bộ cô dâu chú rể mini',
      sub: 'Quà cưới, 2 nhân vật',
      cat: 'cuoi',
      mat: 'Gỗ',
      price: 549000,
      ready: true,
      wash: '#fbeab4',
      a: chibi({ hair: 'long', outfit: 'wedding', outfitColor: '#fffaf0' }),
      b: chibi({ outfit: 'vest', outfitColor: '#3b2f3e' }),
    },
    {
      title: 'Chibi mica áo dài',
      sub: 'Hộp mica chibi, 1 nhân vật',
      cat: 'mica',
      mat: 'Mica',
      price: 329000,
      ready: false,
      wash: '#d3efe9',
      a: chibi({ hair: 'bob', outfitColor: '#9ccbee', accessory: 'bow' }),
    },
    {
      title: 'Cặp đôi mica trong',
      sub: 'Hộp mica chibi, 2 nhân vật',
      cat: 'mica',
      mat: 'Mica',
      price: 449000,
      ready: false,
      wash: '#d6ebfa',
      a: chibi({ hair: 'long', outfit: 'shirt', outfitColor: '#fd9999' }),
      b: chibi({ skin: '#fde3d0', outfit: 'shirt', outfitColor: '#9fd6c4', glasses: true }),
    },
    {
      title: 'Bộ quà cưới cao cấp',
      sub: 'Hộp quà cưới, 2 nhân vật',
      cat: 'cuoi',
      mat: 'Gỗ',
      price: 689000,
      ready: false,
      wash: '#fddede',
      a: chibi({ hair: 'bun', outfit: 'wedding', outfitColor: '#fffaf0', accessory: 'bouquet' }),
      b: chibi({ outfit: 'vest', outfitColor: '#34405a' }),
    },
    {
      title: 'Chibi râu kính',
      sub: 'Hộp gỗ chibi, 1 nhân vật',
      cat: 'nam',
      mat: 'Gỗ',
      price: 299000,
      ready: false,
      wash: '#e8e0f8',
      a: chibi({
        skin: '#c58c63',
        outfit: 'shirt',
        outfitColor: '#f2d27a',
        beard: true,
        glasses: true,
        face: 'laugh',
      }),
    },
    {
      title: 'Hoa cài tóc chibi',
      sub: 'Phụ kiện quà tặng',
      cat: 'phukien',
      mat: 'Khác',
      price: 59000,
      ready: true,
      wash: '#fbeab4',
      a: chibi({ hair: 'long', hairColor: '#5a3a2a', outfit: 'shirt', accessory: 'flower' }),
    },
  ];
  const CATS = [
    ['all', 'Tất cả'],
    ['go', 'Hộp gỗ chibi'],
    ['mica', 'Hộp mica chibi'],
    ['cuoi', 'Quà cưới cao cấp'],
    ['nam', 'Quà tặng cho nam'],
    ['phukien', 'Phụ kiện'],
  ];
  const MATS = [
    ['all', 'Tất cả'],
    ['Gỗ', 'Gỗ'],
    ['Mica', 'Mica'],
    ['Khác', 'Khác'],
  ];
  const PRICES = [
    ['all', 'Tất cả'],
    ['lo', 'Dưới 300.000đ'],
    ['mid', '300.000đ - 500.000đ'],
    ['hi', 'Trên 500.000đ'],
  ];
  const STOCKS = [
    ['all', 'Tất cả'],
    ['ready', 'Có sẵn'],
    ['custom', 'Đặt làm'],
  ];
  const chips = (list, key) =>
    list.map((o) => ({
      label: o[1],
      on: st[key] === o[0],
      cls: st[key] === o[0] ? 'chip on' : 'chip',
      pick: () => setState({ [key]: o[0] }),
    }));
  const q = st.q.trim().toLowerCase();
  const shown = all
    .filter(
      (p) =>
        (!q || p.title.toLowerCase().indexOf(q) >= 0) &&
        (st.cat === 'all' || p.cat === st.cat) &&
        (st.mat === 'all' || p.mat === st.mat) &&
        (st.price === 'all' ||
          (st.price === 'lo' && p.price < 300000) ||
          (st.price === 'mid' && p.price >= 300000 && p.price <= 500000) ||
          (st.price === 'hi' && p.price > 500000)) &&
        (st.stock === 'all' || (st.stock === 'ready' && p.ready) || (st.stock === 'custom' && !p.ready)),
    )
    .map((p) =>
      Object.assign({}, p, {
        hasB: !!p.b,
        customLink: '/tao-chibi?hop=' + (p.mat === 'Mica' ? 'mica' : p.cat === 'cuoi' ? 'wedding' : 'wood'),
        custom: !p.ready,
        priceText: p.ready ? formatPrice(p.price) : 'Từ ' + formatPrice(p.price),
        stockLabel: p.ready ? 'Có sẵn' : 'Đặt làm theo ý bạn',
        tagCls: p.ready ? 'tag t-ok' : 'tag t-butter',
      }),
    );
  const vals = {
    q: st.q,
    onQ: (e) => setState({ q: e.target.value }),
    cats: chips(CATS, 'cat'),
    mats: chips(MATS, 'mat'),
    prices: chips(PRICES, 'price'),
    stocks: chips(STOCKS, 'stock'),
    reset: () => setState({ q: '', cat: 'all', mat: 'all', price: 'all', stock: 'all' }),
    items: shown,
    hasItems: shown.length > 0,
    noItems: shown.length === 0,
    countText: 'Hiển thị ' + shown.length + ' sản phẩm',
    filterOn: ['cat', 'mat', 'price', 'stock'].filter((k) => st[k] !== 'all').length,
    showFilters: st.showFilters,
    toggleFilters: () => setState({ showFilters: !st.showFilters }),
  };

  return (
    <div className="cat">
      <SiteHeader active="shop" />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Cửa hàng</span>
          <h1 className="hd">
            Quà handmade cho <span className="deep">mọi dịp</span>
          </h1>
          <p className="sub" style={{ maxWidth: '600px' }}>
            Tìm theo tên, chất liệu, mức giá và tình trạng hàng.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
          <aside className="card cat-filters">
            <div className="field">
              <label htmlFor="q">Tìm sản phẩm</label>
              <div style={{ position: 'relative' }}>
                <Icon
                  name="search"
                  style={{ position: 'absolute', left: '14px', top: '12px', color: '#6b5f66' }}
                />
                <input
                  id="q"
                  className="input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="Tên sản phẩm"
                  value={vals.q}
                  onChange={vals.onQ}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-line filter-toggle"
              aria-expanded={vals.showFilters}
              aria-controls="filter-body"
              onClick={vals.toggleFilters}
            >
              <Icon name="sliders" />
              {vals.filterOn > 0 ? 'Bộ lọc (' + vals.filterOn + ')' : 'Bộ lọc'}
            </button>
            <div id="filter-body" className={vals.showFilters ? 'filter-body open' : 'filter-body'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="flabel">Loại quà</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {vals.cats.map((c, index) => (
                  <button key={index} type="button" className={c.cls} aria-pressed={c.on} onClick={c.pick}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="flabel">Chất liệu</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {vals.mats.map((c, index) => (
                  <button key={index} type="button" className={c.cls} aria-pressed={c.on} onClick={c.pick}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="flabel">Mức giá</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {vals.prices.map((c, index) => (
                  <button key={index} type="button" className={c.cls} aria-pressed={c.on} onClick={c.pick}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="flabel">Tình trạng hàng</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {vals.stocks.map((c, index) => (
                  <button key={index} type="button" className={c.cls} aria-pressed={c.on} onClick={c.pick}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={vals.reset}
              style={{ alignSelf: 'flex-start' }}
            >
              Xóa bộ lọc
            </button>
            </div>
          </aside>
          <section
            style={{
              flex: '999 1 560px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <p role="status" className="bsm mut">
                {vals.countText}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="sort" className="bsm mut">
                  Sắp xếp
                </label>
                <select
                  id="sort"
                  className="input"
                  style={{ width: 'auto', paddingRight: '32px', minWidth: '180px' }}
                >
                  <option>Nổi bật</option>
                  <option>Giá tăng dần</option>
                  <option>Giá giảm dần</option>
                </select>
              </div>
            </div>
            {vals.hasItems ? (
              <>
                <div className="prod-grid">
                  {vals.items.map((p, index) => (
                    <article
                      key={index}
                      className="card prod-card"
                      style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <Link
                        to="/san-pham/cap-doi-ao-dai"
                        style={{
                          position: 'relative',
                          background: p.wash,
                          borderRadius: '20px',
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          gap: '2%',
                          paddingBottom: '12%',
                        }}
                      >
                        <div style={{ width: '34%', position: 'relative' }}>
                          <Chibi {...p.a} />
                        </div>
                        {p.hasB ? (
                          <>
                            <div style={{ width: '34%', position: 'relative' }}>
                              <Chibi {...p.b} />
                            </div>
                          </>
                        ) : null}
                        <span
                          className={p.tagCls}
                          style={{ position: 'absolute', top: '12px', left: '12px' }}
                        >
                          {p.stockLabel}
                        </span>
                      </Link>
                      <div
                        className="prod-info"
                        style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingInline: '8px' }}
                      >
                        <h3 className="hh">{p.title}</h3>
                        <span className="bsm mut">{p.sub}</span>
                        <span className="hh" style={{ marginTop: '4px' }}>
                          {p.priceText}
                        </span>
                      </div>
                      <div className="prod-actions" style={{ display: 'flex', gap: '8px', padding: '0 8px 8px' }}>
                        {p.ready ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-ink"
                              style={{ flex: '1' }}
                              onClick={() => addReadyItem(p)}
                            >
                              Thêm vào giỏ
                            </button>
                          </>
                        ) : null}
                        {p.custom ? (
                          <>
                            <Link to={p.customLink} className="btn btn-pink" style={{ flex: '1' }}>
                              Tự tay tạo chibi
                            </Link>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className="btn btn-line btn-icon"
                          aria-label="Lưu vào yêu thích"
                        >
                          <Icon name="heart" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
            {vals.noItems ? (
              <>
                <div
                  className="card-2"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '32px',
                  }}
                >
                  <h3 className="hh">Chưa có sản phẩm phù hợp</h3>
                  <p className="bsm mut">Thử bỏ bớt bộ lọc, hoặc tự tay tạo chibi theo ý bạn.</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-line" onClick={vals.reset}>
                      Xóa bộ lọc
                    </button>
                    <Link to="/tao-chibi" className="btn btn-ink">
                      Tự tay tạo chibi
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
            <div
              style={{
                background: '#fddede',
                borderRadius: '24px',
                padding: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '520px' }}>
                <h3 className="hlg">Chưa thấy mẫu ưng ý?</h3>
                <p className="bsm">Tự chọn tóc, trang phục và bó hoa. Shop làm đúng theo thiết kế của bạn.</p>
              </div>
              <Link to="/tao-chibi" className="btn btn-ink btn-lg">
                Tự tay tạo chibi
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
