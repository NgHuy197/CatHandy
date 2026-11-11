import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import { formatPrice } from '../lib/chibi';
import { addReadyItem } from '../lib/cart';
import { api, upload, useApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import { CATEGORY_LABELS, toCard } from '../lib/products';
import { toggleWish, useWishlist } from '../lib/wishlist';
import { formatDate } from '../../shared/format';
import { setPageMeta } from '../lib/pageMeta';

const thumbStyle = (on, bg) => ({
  aspectRatio: '1 / 1',
  borderRadius: '16px',
  border: on ? '2px solid #2a1f2d' : '1px solid #e3d8ca',
  background: bg,
  cursor: 'pointer',
  padding: '0',
  overflow: 'hidden',
});
const fill = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const errorBox = { background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' };
const okBox = { background: 'var(--wash-mint)', color: 'var(--success)', borderRadius: '12px', padding: '12px 16px' };

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" className="star" style={n <= Math.round(value) ? undefined : { opacity: 0.25 }} />
      ))}
    </div>
  );
}

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, reload } = useApi('/products/' + slug);
  const { user } = useAuth();
  const wish = useWishlist();
  const [state, setState] = useMergedState({
    color: null,
    size: null,
    qty: 1,
    slide: 0,
    added: false,
    rating: 5,
    body: '',
    photos: [],
    reviewBusy: false,
    reviewError: '',
    reviewDone: false,
  });

  useEffect(() => {
    if (data) setPageMeta(data.title, data.description || data.sub);
    else if (error) setPageMeta('Không tìm thấy sản phẩm');
  }, [data, error]);

  if (!data) {
    return (
      <div className="cat">
        <SiteHeader active="shop" />
        <main className="wrap" style={{ paddingBlock: '48px 96px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="bsm mut" role={error ? 'alert' : 'status'}>
            {error ? (error.status === 404 ? 'Không tìm thấy sản phẩm này.' : error.message) : 'Đang tải sản phẩm...'}
          </p>
          {error ? (
            <Link to="/san-pham" className="btn btn-line" style={{ alignSelf: 'flex-start' }}>
              Xem các sản phẩm khác
            </Link>
          ) : null}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const p = toCard(data);
  const st = state;
  const colors = p.variants?.colors || [];
  const sizes = p.variants?.sizes || [];
  const color = colors.find((c) => c.value === st.color) || colors[0];
  const size = sizes.find((s) => s.code === st.size) || sizes[0];
  const unit = size ? size.price : p.price;
  const pa = color ? { ...p.a, outfitColor: color.value } : p.a;
  // Slide 0 is the chibi drawing; uploaded photos and videos follow.
  const slides = [{ kind: 'chibi' }, ...p.imageUrls.map((url) => ({ kind: /\.mp4$/i.test(url) ? 'video' : 'image', url }))];
  const slide = slides[st.slide] || slides[0];
  const wished = wish.has(p.slug);
  const variantLabel = [color && 'màu ' + color.label.toLowerCase(), size && 'cỡ ' + size.label.toLowerCase()]
    .filter(Boolean)
    .join(', ');

  const vals = {
    pa,
    pb: p.b,
    colors: colors.map((o) => ({
      label: o.label,
      color: o.value,
      on: color?.value === o.value,
      cls: color?.value === o.value ? 'tile on' : 'tile',
      pick: () => setState({ color: o.value, added: false }),
    })),
    sizes: sizes.map((o) => ({
      label: o.label,
      on: size?.code === o.code,
      cls: size?.code === o.code ? 'chip on' : 'chip',
      pick: () => setState({ size: o.code, added: false }),
    })),
    qty: st.qty,
    inc: () => setState({ qty: Math.min(9, st.qty + 1), added: false }),
    dec: () => setState({ qty: Math.max(1, st.qty - 1), added: false }),
    priceText: formatPrice(unit * st.qty),
    add: () => {
      addReadyItem({
        slug: p.slug,
        title: p.title,
        sub: p.sub,
        price: unit,
        wash: p.wash,
        a: pa,
        b: p.b,
        variant: { color: color?.value, size: size?.code },
        variantLabel: variantLabel ? variantLabel.charAt(0).toUpperCase() + variantLabel.slice(1) : '',
        qty: st.qty,
      });
      setState({ added: true });
    },
    wished,
    wish: () => (wish.signedIn ? toggleWish(p.slug).catch(() => {}) : navigate('/dang-nhap?next=/san-pham/' + p.slug)),
    slideText: 'Ảnh ' + (st.slide + 1) + ' / ' + slides.length,
    nextSlide: () => setState({ slide: (st.slide + 1) % slides.length }),
    customLink: '/tao-chibi?hop=' + (p.boxCode || 'wood'),
    ratingText: p.rating.count ? `${p.rating.avg.toString().replace('.', ',')}/5 từ ${p.rating.count} đánh giá` : 'Chưa có đánh giá trên web',
    submitReview: async (e) => {
      e.preventDefault();
      setState({ reviewBusy: true, reviewError: '', reviewDone: false });
      try {
        await api('/products/' + p.slug + '/reviews', {
          method: 'POST',
          body: { rating: st.rating, body: st.body, photos: st.photos.map((ph) => ph.key) },
        });
        // A second review replaces the first, so reload rather than add to the list.
        await reload();
        setState({ reviewBusy: false, body: '', photos: [], rating: 5, reviewError: '', reviewDone: true });
      } catch (err) {
        setState({ reviewBusy: false, reviewError: err.message });
      }
    },
    addPhoto: async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const up = await upload('/uploads', file);
        setState({ photos: [...st.photos, up].slice(0, 6), reviewError: '', reviewDone: false });
      } catch (err) {
        setState({ reviewError: err.message });
      }
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
          <Link to={'/san-pham?loai=' + p.category}>{CATEGORY_LABELS[p.category] || 'Sản phẩm'}</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: '#2a1f2d' }}>{p.title}</span>
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
                background: p.wash,
                borderRadius: '24px',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
              }}
            >
              {slide.kind === 'chibi' ? (
                <>
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
                    {vals.pb ? (
                      <div style={{ width: '36%' }}>
                        <Chibi {...vals.pb} />
                      </div>
                    ) : null}
                  </div>
                </>
              ) : slide.kind === 'video' ? (
                <video src={slide.url} controls playsInline style={fill} />
              ) : (
                <img src={slide.url} alt={p.title} style={fill} />
              )}
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
                {vals.slideText}
              </span>
              {slides.length > 1 ? (
                <button
                  type="button"
                  className="btn glass-clear btn-icon"
                  aria-label="Ảnh sau"
                  onClick={vals.nextSlide}
                  style={{ position: 'absolute', right: '16px', top: '50%', color: '#2a1f2d' }}
                >
                  <Icon name="chevronRight" />
                </button>
              ) : null}
            </div>
            {slides.length > 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '12px' }}>
                {slides.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={s.kind === 'video' ? 'Video cận cảnh chất liệu' : 'Ảnh ' + (i + 1)}
                    aria-pressed={st.slide === i}
                    className={s.kind === 'video' ? 'ph' : undefined}
                    onClick={() => setState({ slide: i })}
                    style={thumbStyle(st.slide === i, p.wash)}
                  >
                    {s.kind === 'image' ? <img src={s.url} alt="" style={fill} /> : null}
                    {s.kind === 'video' ? <Icon name="play" className="ic ic-24" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
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
                <span className={p.ready ? 'tag t-ok' : 'tag t-butter'}>{p.ready ? 'Có sẵn' : 'Đặt làm theo ý bạn'}</span>
                <span className="tag t-butter">{CATEGORY_LABELS[p.category]}</span>
              </div>
              <h1 className="hd">{p.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stars value={p.rating.count ? p.rating.avg : 5} />
                <span className="bsm mut">{vals.ratingText}</span>
              </div>
              <span className="hlg">{vals.priceText}</span>
              <p className="bsm mut" style={{ whiteSpace: 'pre-line' }}>
                {p.description || p.sub}
              </p>
            </div>
            {vals.colors.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="flabel">Màu</span>
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
            ) : null}
            {vals.sizes.length ? (
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
            ) : null}
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
                className={vals.wished ? 'btn btn-pink btn-icon btn-lg' : 'btn btn-line btn-icon btn-lg'}
                aria-label={vals.wished ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'}
                aria-pressed={vals.wished}
                onClick={vals.wish}
                style={{ width: '52px', padding: '0' }}
              >
                <Icon name="heart" />
              </button>
            </div>
            {st.added ? (
              <div
                role="status"
                className="tag t-ok"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '14px', gap: '8px' }}
              >
                <Icon name="check" />
                Đã thêm vào giỏ hàng.{' '}
                <Link to="/gio-hang" style={{ textDecoration: 'underline' }}>
                  Xem giỏ hàng
                </Link>
              </div>
            ) : null}
            {p.boxCode ? (
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
                  <span className="bsm">Loại hộp của mẫu này sẽ được chọn sẵn, bạn chỉ cần đổi tóc và trang phục.</span>
                </div>
                <Link to={vals.customLink} className="btn btn-ink">
                  Tự tay tạo chibi
                  <Icon name="arrowRight" />
                </Link>
              </div>
            ) : null}
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
            <span className="bsm mut">Shop đạt 4.9/5 trên Shopee</span>
          </div>
          {p.reviews.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                gap: '24px',
              }}
            >
              {p.reviews.map((r) => (
                <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {r.photoUrls.length ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                      {r.photoUrls.map((u) => (
                        <img key={u} src={u} alt="Ảnh thực tế khách gửi" style={{ ...fill, aspectRatio: '1 / 1', borderRadius: '12px' }} />
                      ))}
                    </div>
                  ) : null}
                  <Stars value={r.rating} />
                  {r.body ? <p className="bsm mut">{r.body}</p> : null}
                  <span className="cap">
                    {r.name}, {formatDate(r.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="bsm mut">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
          {user && !p.canReview ? (
            <p className="bsm mut">Bạn viết được đánh giá sau khi đơn có sản phẩm này đã được giao.</p>
          ) : user ? (
            <form className="card" onSubmit={vals.submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
              <h3 className="hh">Viết đánh giá</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="group" aria-label="Số sao">
                {[5, 4, 3, 2, 1].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={st.rating === n ? 'chip on' : 'chip'}
                    aria-pressed={st.rating === n}
                    onClick={() => setState({ rating: n, reviewDone: false })}
                  >
                    {n} sao
                  </button>
                ))}
              </div>
              <div className="field">
                <label htmlFor="rv">Cảm nhận của bạn</label>
                <textarea id="rv" className="input" rows="3" value={st.body} onChange={(e) => setState({ body: e.target.value, reviewDone: false })} />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {st.photos.map((ph) => (
                  <img key={ph.key} src={ph.url} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '12px' }} />
                ))}
                {st.photos.length < 6 ? (
                  <label className="btn btn-line">
                    <Icon name="upload" />
                    Thêm ảnh thực tế
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={vals.addPhoto} />
                  </label>
                ) : null}
              </div>
              {st.reviewError ? (
                <p className="bsm" role="alert" style={errorBox}>
                  {st.reviewError}
                </p>
              ) : null}
              {st.reviewDone ? (
                <p className="bsm" role="status" style={okBox}>
                  Cảm ơn bạn, đánh giá đã được đăng ở trên. Nếu gửi lại, đánh giá mới sẽ thay đánh giá cũ.
                </p>
              ) : null}
              <button type="submit" className="btn btn-ink" style={{ alignSelf: 'flex-start' }} disabled={st.reviewBusy}>
                {st.reviewBusy ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <p className="bsm mut">
              Đã nhận sản phẩm này?{' '}
              <Link to={'/dang-nhap?next=/san-pham/' + p.slug} className="deep" style={{ fontWeight: '500', textDecoration: 'underline' }}>
                Đăng nhập để đánh giá
              </Link>
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
