import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import { formatPrice } from '../lib/chibi';
import { addReadyItem } from '../lib/cart';
import { useApi } from '../lib/api';
import { toCard } from '../lib/products';
import { toggleWish, useWishlist } from '../lib/wishlist';

// "ao dai" finds "Áo dài": many shoppers type without Vietnamese accents.
const fold = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

const CAT_CODES = ['go', 'mica', 'cuoi', 'nam', 'phukien'];

export default function Catalog() {
  // Links elsewhere on the site open a category (?loai=mica) or ready-made items only (?tinh-trang=co-san).
  const [params] = useSearchParams();
  const urlCat = CAT_CODES.includes(params.get('loai')) ? params.get('loai') : 'all';
  const urlStock = params.get('tinh-trang') === 'co-san' ? 'ready' : 'all';
  const [state, setState] = useMergedState({
    q: '',
    cat: urlCat,
    mat: 'all',
    price: 'all',
    stock: urlStock,
    sort: 'featured',
    showFilters: false,
  });
  useEffect(() => {
    setState({ cat: urlCat, stock: urlStock });
  }, [urlCat, urlStock, setState]);
  const navigate = useNavigate();
  const { data, error, loading } = useApi('/products');
  const wish = useWishlist();

  const st = state;
  const all = (data || []).map(toCard);
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
  const q = fold(st.q.trim());
  const shown = all
    .filter(
      (p) =>
        (!q || fold(p.title + ' ' + p.sub).includes(q)) &&
        (st.cat === 'all' || p.cat === st.cat) &&
        (st.mat === 'all' || p.mat === st.mat) &&
        (st.price === 'all' ||
          (st.price === 'lo' && p.fromPrice < 300000) ||
          (st.price === 'mid' && p.fromPrice >= 300000 && p.fromPrice <= 500000) ||
          (st.price === 'hi' && p.fromPrice > 500000)) &&
        (st.stock === 'all' || (st.stock === 'ready' && p.ready) || (st.stock === 'custom' && !p.ready)),
    )
    .sort((x, y) => (st.sort === 'asc' ? x.fromPrice - y.fromPrice : st.sort === 'desc' ? y.fromPrice - x.fromPrice : 0))
    .map((p) =>
      Object.assign({}, p, {
        hasB: !!p.b,
        href: '/san-pham/' + p.slug,
        customLink: '/tao-chibi?hop=' + (p.boxCode || 'wood'),
        custom: !p.ready,
        priceText: p.ready && !p.hasVariants ? formatPrice(p.fromPrice) : 'Từ ' + formatPrice(p.fromPrice),
        stockLabel: p.ready ? 'Có sẵn' : 'Đặt làm theo ý bạn',
        tagCls: p.ready ? 'tag t-ok' : 'tag t-butter',
        // Products with colours or sizes are chosen on their own page.
        add: () =>
          p.hasVariants
            ? navigate('/san-pham/' + p.slug)
            : addReadyItem({ slug: p.slug, title: p.title, sub: p.sub, price: p.price, wash: p.wash, a: p.a, b: p.b }),
        addLabel: p.hasVariants ? 'Chọn mẫu' : 'Thêm vào giỏ',
        wished: wish.has(p.slug),
        wish: () => (wish.signedIn ? toggleWish(p.slug).catch(() => {}) : navigate('/dang-nhap?next=/san-pham')),
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
    noItems: !!data && shown.length === 0,
    countText: error ? error.message : loading && !data ? 'Đang tải sản phẩm...' : 'Hiển thị ' + shown.length + ' sản phẩm',
    sort: st.sort,
    onSort: (e) => setState({ sort: e.target.value }),
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
                  placeholder="Tên sản phẩm hoặc chất liệu"
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
                  value={vals.sort}
                  onChange={vals.onSort}
                >
                  <option value="featured">Nổi bật</option>
                  <option value="asc">Giá tăng dần</option>
                  <option value="desc">Giá giảm dần</option>
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
                        to={p.href}
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
                            <button type="button" className="btn btn-ink" style={{ flex: '1' }} onClick={p.add}>
                              {p.addLabel}
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
                          className={p.wished ? 'btn btn-pink btn-icon' : 'btn btn-line btn-icon'}
                          aria-label={p.wished ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'}
                          aria-pressed={p.wished}
                          onClick={p.wish}
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
