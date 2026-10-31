import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { chibi } from '../lib/chibi';
import { addReadyItem } from '../lib/cart';

const PITCH = 196;
const HALF = 706;
const FRAME = 1440;

function roundedQuadPath(pts, r) {
  let d = '';
  const n = pts.length;
  for (let k = 0; k < n; k++) {
    const p0 = pts[(k + n - 1) % n];
    const p1 = pts[k];
    const p2 = pts[(k + 1) % n];
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    const a = [p1[0] + ((p0[0] - p1[0]) / l1) * r, p1[1] + ((p0[1] - p1[1]) / l1) * r];
    const b = [p1[0] + ((p2[0] - p1[0]) / l2) * r, p1[1] + ((p2[1] - p1[1]) / l2) * r];
    d += `${k === 0 ? 'M' : 'L'}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return d + 'Z';
}

function CurvedProducts({ products }) {
  const boxRef = useRef(null);
  const cardRefs = useRef([]);
  const stRef = useRef(null);
  const nudge = (dir) => {
    if (stRef.current) stRef.current.vel = dir * 1200;
  };
  const navStyle = (side) => ({
    position: 'absolute',
    top: '50%',
    [side]: 'clamp(8px, 2vw, 24px)',
    transform: 'translateY(-50%)',
    zIndex: 5,
  });
  const count = Math.max(products.length, 1);
  const copies = Math.ceil(10 / count);
  const total = count * copies;
  const loop = total * PITCH;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = { scroll: 0, vel: 0, drag: false, lastX: 0, lastT: 0, moved: 0, raf: 0, prev: performance.now() };
    let scale = 1;
    let visible = true;
    const measure = () => {
      const w = box.clientWidth;
      scale = w / (w <= 820 ? 640 : FRAME);
      box.style.height = `${Math.round(440 * scale)}px`;
    };
    const render = () => {
      const w = box.clientWidth;
      const cx = w / 2 / scale;
      const maxH = 372;
      const cy = (box.clientHeight / scale) / 2;
      const norm = w <= 820 ? 640 / 2 : HALF;
      for (let k = 0; k < total; k++) {
        const el = cardRefs.current[k];
        if (!el) continue;
        let t = (((k * PITCH - st.scroll) % loop) + loop * 1.5) % loop - loop / 2;
        const x = cx + t * (1 + 0.083 * (t / norm) * (t / norm));
        const d = Math.min(Math.abs(x - cx) / norm, 1.3);
        const wu = 170 + 48 * d * d;
        if (Math.abs(x - cx) > norm + wu) {
          el.style.display = 'none';
          continue;
        }
        const hOf = (ex) => 280 + 92 * Math.pow(Math.min(Math.abs(ex - cx) / norm, 1.3), 2.6);
        const xl = x - wu / 2;
        const xr = x + wu / 2;
        const hl = hOf(xl);
        const hr = hOf(xr);
        const yc = cy - 12 * d * d;
        const top = yc - maxH / 2;
        const pts = [
          [0, yc - hl / 2 - top],
          [wu, yc - hr / 2 - top],
          [wu, yc + hr / 2 - top],
          [0, yc + hl / 2 - top],
        ].map(([px, py]) => [px * scale, py * scale]);
        el.style.display = 'block';
        el.style.width = `${wu * scale}px`;
        el.style.height = `${maxH * scale}px`;
        el.style.transform = `translate(${xl * scale}px, ${top * scale}px)`;
        el.style.clipPath = `path('${roundedQuadPath(pts, 15 * scale)}')`;
      }
    };
    const tick = (now) => {
      const dt = Math.min((now - st.prev) / 1000, 0.1);
      st.prev = now;
      if (!st.drag && visible) {
        st.scroll += st.vel * dt + (reduce ? 0 : 50 * dt);
        st.vel *= Math.pow(0.05, dt);
      }
      render();
      st.raf = requestAnimationFrame(tick);
    };
    stRef.current = st;
    const down = (e) => {
      if (e.target.closest('[data-nav]')) return;
      st.drag = true;
      st.moved = 0;
      st.lastX = e.clientX;
      st.lastT = performance.now();
      st.vel = 0;
      box.style.cursor = 'grabbing';
    };
    const move = (e) => {
      if (!st.drag) return;
      const now = performance.now();
      const dx = e.clientX - st.lastX;
      st.moved += Math.abs(dx);
      st.scroll -= dx / scale;
      const dt = Math.max((now - st.lastT) / 1000, 0.001);
      st.vel = st.vel * 0.6 + (-dx / scale / dt) * 0.4;
      st.lastX = e.clientX;
      st.lastT = now;
    };
    const up = () => {
      if (!st.drag) return;
      st.drag = false;
      box.style.cursor = 'grab';
      if (performance.now() - st.lastT > 80) st.vel = 0;
    };
    const click = (e) => {
      if (st.moved > 5) {
        e.preventDefault();
        e.stopPropagation();
        st.moved = 0;
      }
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      st.prev = performance.now();
    });
    io.observe(box);
    measure();
    window.addEventListener('resize', measure);
    box.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    box.addEventListener('click', click, true);
    st.raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(st.raf);
      io.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      box.removeEventListener('pointerdown', down);
      box.removeEventListener('click', click, true);
    };
  }, [total, loop]);

  return (
    <div
      ref={boxRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        cursor: 'grab',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        data-nav
        className="btn btn-ink btn-icon"
        aria-label="Trước"
        style={navStyle('left')}
        onClick={() => nudge(-1)}
      >
        <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
          <Icon name="arrowRight" />
        </span>
      </button>
      <button
        type="button"
        data-nav
        className="btn btn-ink btn-icon"
        aria-label="Sau"
        style={navStyle('right')}
        onClick={() => nudge(1)}
      >
        <Icon name="arrowRight" />
      </button>
      {Array.from({ length: total }, (_, k) => {
        const p = products[k % count];
        return (
          <article
            key={k}
            ref={(el) => {
              cardRefs.current[k] = el;
            }}
            style={{ position: 'absolute', left: 0, top: 0, background: p.wash, display: 'none' }}
          >
            <Link
              to="/san-pham/cap-doi-ao-dai"
              draggable={false}
              style={{
                position: 'absolute',
                inset: '12.4% 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '0 0 6%',
              }}
            >
              <span
                className="glass-clear"
                style={{
                  position: 'absolute',
                  top: '14%',
                  left: '12%',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  font: "500 12px/18px 'Be Vietnam Pro', sans-serif",
                }}
              >
                Giao ngay
              </span>
              <div style={{ display: 'flex', gap: '2%', width: '88%', justifyContent: 'center', marginBottom: '6%' }}>
                <div style={{ width: '40%' }}>
                  <Chibi {...p.a} />
                </div>
                {p.hasB ? (
                  <div style={{ width: '40%' }}>
                    <Chibi {...p.b} />
                  </div>
                ) : null}
              </div>
              <div style={{ width: '82%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span className="hh" style={{ fontSize: '15px', lineHeight: '18px' }}>
                    {p.title}
                  </span>
                  <span className="hh" style={{ fontSize: '14px', marginTop: '2px' }}>
                    {p.price}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ink btn-icon"
                  aria-label={`Thêm ${p.title} vào giỏ`}
                  style={{ flex: '0 0 auto', width: '32px', height: '32px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addReadyItem({ ...p, price: Number(p.price.replace(/\D/g, '')) });
                  }}
                >
                  <Icon name="plus" />
                </button>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export default function Main() {
  const [state, setState] = useMergedState({ slide: 0 });
  const pair = (o) => Object.assign({}, o, { hasB: !!o.b });
  const slides = [
    pair({
      tag: 'Bộ sưu tập Valentine',
      wash: '#fddede',
      a: chibi({ hair: 'long', outfit: 'aodai', outfitColor: '#c9484f', accessory: 'bouquet' }),
      b: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', face: 'wink' }),
    }),
    pair({
      tag: 'Quà tặng 8/3',
      wash: '#e8e0f8',
      a: chibi({
        hair: 'long',
        hairColor: '#5a3a2a',
        outfit: 'shirt',
        outfitColor: '#cbbdf0',
        accessory: 'flower',
        face: 'laugh',
      }),
    }),
    pair({
      tag: 'Quà 20/10',
      wash: '#fbeab4',
      a: chibi({ hair: 'bob', outfit: 'aodai', outfitColor: '#c9484f', accessory: 'bow' }),
      b: chibi({ hair: 'bun', hairColor: '#5a3a2a', outfit: 'aodai', outfitColor: '#9ccbee' }),
    }),
    pair({
      tag: 'Giáng sinh',
      wash: '#d3efe9',
      a: chibi({ hair: 'bun', outfit: 'shirt', outfitColor: '#c9484f', face: 'laugh' }),
      b: chibi({ skin: '#fde3d0', outfit: 'vest', outfitColor: '#c9484f', glasses: true }),
    }),
  ];
  const i = state.slide;
  const go = (n) => setState({ slide: (n + slides.length) % slides.length });
  const vals = {
    yes: true,
    slide: slides[i],
    prev: () => go(i - 1),
    next: () => go(i + 1),
    dots: slides.map((s, k) => ({
      label: s.tag,
      pick: () => go(k),
      style:
        'width:' +
        (k === i ? 24 : 10) +
        'px;height:10px;min-height:10px;border-radius:999px;border:0;padding:0;cursor:pointer;background:' +
        (k === i ? '#2a1f2d' : '#857a80') +
        ';transition:width .2s ease',
    })),
    steps: [
      {
        n: '01',
        title: 'Chọn hộp quà',
        text: 'Hộp gỗ chibi, hộp mica chibi hoặc bộ quà cưới, một hoặc hai nhân vật.',
      },
      {
        n: '02',
        title: 'Dựng nhân vật',
        text: 'Chọn tông da, kiểu tóc, biểu cảm, trang phục và phụ kiện. Hình đổi ngay khi bạn chọn.',
      },
      {
        n: '03',
        title: 'Gửi đơn cho shop',
        text: 'Xem giá tạm tính, ghi chú chi tiết riêng rồi gửi đơn cho shop.',
      },
      {
        n: '04',
        title: 'Duyệt ảnh và nhận quà',
        text: 'Shop gửi ảnh sản phẩm thật, bạn xác nhận rồi shop mới giao cho đơn vị vận chuyển.',
      },
    ],
    sA: {
      wash: '#fddede',
      title: 'Cặp đôi áo dài đỏ',
      sub: 'Hộp gỗ chibi, hai nhân vật',
      a: chibi({ hair: 'long', outfitColor: '#c9484f', accessory: 'bouquet' }),
      b: chibi({ skin: '#e8b896', outfitColor: '#34405a' }),
    },
    sB: {
      wash: '#e8e0f8',
      title: 'Cô dâu và chú rể',
      sub: 'Bộ quà cưới cao cấp',
      a: chibi({ hair: 'bun', outfit: 'wedding', outfitColor: '#fffaf0', accessory: 'bouquet' }),
      b: chibi({ outfit: 'vest', outfitColor: '#3b2f3e' }),
    },
    sC: {
      wash: '#fbeab4',
      title: 'Quà sinh nhật bạn thân',
      a: chibi({
        hair: 'bob',
        hairColor: '#5a3a2a',
        outfit: 'shirt',
        outfitColor: '#9fd6c4',
        face: 'laugh',
        glasses: true,
      }),
    },
    sD: {
      wash: '#d6ebfa',
      title: 'Quà tặng cho nam',
      a: chibi({
        skin: '#e8b896',
        outfit: 'vest',
        outfitColor: '#34405a',
        beard: true,
        glasses: true,
        face: 'calm',
      }),
    },
    products: [
      pair({
        wash: '#fddede',
        title: 'Cặp đôi áo dài',
        sub: 'Hộp gỗ chibi, 2 nhân vật',
        price: '389.000đ',
        a: chibi({ hair: 'long', outfitColor: '#c9484f' }),
        b: chibi({ skin: '#e8b896', outfitColor: '#34405a' }),
      }),
      pair({
        wash: '#d6ebfa',
        title: 'Chibi vest xanh',
        sub: 'Hộp mica chibi, 1 nhân vật',
        price: '289.000đ',
        a: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', glasses: true }),
      }),
      pair({
        wash: '#e8e0f8',
        title: 'Bé hoa tặng mẹ',
        sub: 'Hộp gỗ chibi, 1 nhân vật',
        price: '259.000đ',
        a: chibi({ hair: 'bun', outfit: 'shirt', outfitColor: '#cbbdf0', accessory: 'bouquet' }),
      }),
      pair({
        wash: '#fbeab4',
        title: 'Bộ cô dâu chú rể mini',
        sub: 'Quà cưới, 2 nhân vật',
        price: '549.000đ',
        a: chibi({ hair: 'long', outfit: 'wedding', outfitColor: '#fffaf0' }),
        b: chibi({ outfit: 'vest', outfitColor: '#3b2f3e' }),
      }),
      pair({
        wash: '#d3efe9',
        title: 'Hoa cài tóc chibi',
        sub: 'Phụ kiện quà tặng',
        price: '59.000đ',
        a: chibi({ hair: 'long', hairColor: '#5a3a2a', outfit: 'shirt', accessory: 'flower' }),
      }),
    ],
  };

  return (
    <div className="cat" style={{ overflowX: 'clip' }}>
      <section className="hero">
        <video
          className="hero-bg"
          src="/videos/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="hero-bg-veil" />
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', zIndex: '40' }}>
          <SiteHeader active="home" clear={vals.yes} />
        </div>
        <div
          className="wrap"
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '56px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flex: '1 1 420px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              alignItems: 'flex-start',
            }}
          >
            <span className="lbl">Cat Handy Gifts</span>
            <h1 className="hxl">
              Quà handmade cho <span className="deep">mọi khoảnh khắc</span>
            </h1>
            <p className="sub" style={{ maxWidth: '480px', color: '#2a1f2d' }}>
              Tự tay dựng nhân vật chibi của riêng bạn, từ tóc, trang phục đến bó hoa. Shop làm thủ công và
              gửi ảnh để bạn duyệt trước khi giao.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/tao-chibi" className="btn btn-ink btn-lg">
                Tự tay tạo chibi
                <Icon name="arrowRight" />
              </Link>
              <Link
                to="/san-pham"
                className="btn btn-line btn-lg"
                style={{ background: 'rgba(255,255,255,0.55)' }}
              >
                Xem quà có sẵn
              </Link>
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              flex: '1 1 420px',
              maxWidth: '520px',
              width: '100%',
              marginInline: 'auto',
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                aspectRatio: '4 / 5',
                background: vals.slide.wash,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  bottom: '20%',
                  height: '34%',
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
                  gap: '4%',
                  paddingBottom: '24%',
                }}
              >
                <div style={{ width: '36%' }}>
                  <Chibi {...vals.slide.a} />
                </div>
                {vals.slide.hasB ? (
                  <>
                    <div style={{ width: '36%' }}>
                      <Chibi {...vals.slide.b} />
                    </div>
                  </>
                ) : null}
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
                {vals.slide.tag}
              </span>
              <div
                className="glass-see"
                style={{
                  position: 'absolute',
                  left: '16px',
                  right: '16px',
                  bottom: '16px',
                  borderRadius: '999px',
                  padding: '6px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Bộ sưu tập trước"
                  onClick={vals.prev}
                >
                  <Icon name="chevronLeft" />
                </button>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {vals.dots.map((d, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={d.label}
                      onClick={d.pick}
                      style={css(d.style)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Bộ sưu tập sau"
                  onClick={vals.next}
                >
                  <Icon name="chevronRight" />
                </button>
              </div>
            </div>
            <div
              className="glass-see hero-price"
              style={{
                position: 'absolute',
                left: '-36px',
                top: '22%',
                borderRadius: '20px',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <span className="cap" style={{ color: '#2a1f2d' }}>
                Giá tạm tính
              </span>
              <span className="hh">474.000đ</span>
              <span className="cap" style={{ color: '#2a1f2d' }}>
                Đổi ngay khi bạn chọn
              </span>
            </div>
            <div
              className="glass-clear hero-badge"
              style={{
                position: 'absolute',
                right: '-24px',
                top: '48%',
                borderRadius: '999px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
              }}
            >
              <Icon name="check" />
              Xem ảnh duyệt trước khi giao
            </div>
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '620px' }}>
              <span className="lbl">Quà custom tiêu biểu</span>
              <h2 className="hlg">Những chibi shop đã làm cho khách</h2>
            </div>
            <Link to="/tao-chibi" className="btn btn-ink">
              Tạo chibi của bạn
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <article
              style={{
                flex: '1 1 420px',
                minHeight: '560px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                background: vals.sA.wash,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '3%',
                paddingBottom: '130px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '8%',
                  right: '8%',
                  bottom: '100px',
                  height: '30%',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.45)',
                }}
              />
              <div style={{ width: '34%', position: 'relative' }}>
                <Chibi {...vals.sA.a} />
              </div>
              <div style={{ width: '34%', position: 'relative' }}>
                <Chibi {...vals.sA.b} />
              </div>
              <span
                className="glass-clear"
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '4px 14px',
                  borderRadius: '999px',
                  font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                }}
              >
                Ảnh thật của khách
              </span>
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  left: '16px',
                  right: '16px',
                  bottom: '16px',
                  borderRadius: '20px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="hh">{vals.sA.title}</span>
                  <span className="bsm mut">{vals.sA.sub}</span>
                </div>
                <Link to="/tao-chibi" className="btn btn-ink">
                  Làm bản của tôi
                </Link>
              </div>
            </article>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <article
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  background: vals.sB.wash,
                  minHeight: '260px',
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '28px 28px 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '8px',
                    flex: '1 1 160px',
                    paddingBottom: '28px',
                  }}
                >
                  <span className="tag t-sand" style={{ alignSelf: 'flex-start' }}>
                    Ảnh thật của khách
                  </span>
                  <h3 className="hh">{vals.sB.title}</h3>
                  <span className="bsm" style={{ color: '#6b5f66' }}>
                    {vals.sB.sub}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2%', flex: '0 0 52%' }}>
                  <div style={{ width: '50%' }}>
                    <Chibi {...vals.sB.a} />
                  </div>
                  <div style={{ width: '50%' }}>
                    <Chibi {...vals.sB.b} />
                  </div>
                </div>
              </article>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', flex: '1' }}>
                <article
                  style={{
                    flex: '1 1 200px',
                    minHeight: '276px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    background: vals.sC.wash,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '84px',
                  }}
                >
                  <div style={{ width: '44%' }}>
                    <Chibi {...vals.sC.a} />
                  </div>
                  <div
                    className="glass-clear"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      right: '12px',
                      bottom: '12px',
                      borderRadius: '16px',
                      padding: '10px 14px',
                      font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                    }}
                  >
                    {vals.sC.title}
                  </div>
                </article>
                <article
                  style={{
                    flex: '1 1 200px',
                    minHeight: '276px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '24px',
                    background: vals.sD.wash,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '84px',
                  }}
                >
                  <div style={{ width: '44%' }}>
                    <Chibi {...vals.sD.a} />
                  </div>
                  <div
                    className="glass-clear"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      right: '12px',
                      bottom: '12px',
                      borderRadius: '16px',
                      padding: '10px 14px',
                      font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                    }}
                  >
                    {vals.sD.title}
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section style={{ background: '#2a1f2d', color: '#fdf9f3', paddingBlock: 'clamp(64px, 8vw, 96px)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
            <span className="lbl" style={{ color: '#fd9999' }}>
              Cách đặt quà
            </span>
            <h2 className="hlg" style={{ color: '#fdf9f3' }}>
              Chỉ mất vài phút để thiết kế món quà của riêng bạn
            </h2>
          </div>
          <ol
            style={{
              margin: '0',
              padding: '0',
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '32px',
            }}
          >
            {vals.steps.map((s, index) => (
              <li
                key={index}
                style={{
                  flex: '1 1 220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingTop: '24px',
                  borderTop: '2px solid #fd9999',
                }}
              >
                <span
                  style={{
                    fontFamily: "'iCiel Queulat Uni', sans-serif",
                    fontSize: '56px',
                    lineHeight: '56px',
                    color: '#fd9999',
                  }}
                >
                  {s.n}
                </span>
                <h3 className="hh" style={{ color: '#fdf9f3' }}>
                  {s.title}
                </h3>
                <p className="bsm" style={{ color: 'rgba(253,249,243,0.8)' }}>
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="sec">
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
            <span className="lbl">Danh mục</span>
            <h2 className="hlg">Chọn loại quà bạn muốn tặng</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <Link
              to="/san-pham"
              style={{
                flex: '1 1 360px',
                minHeight: '480px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                background: '#fbeab4',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '220px' }}>
                <h3 className="hlg">Hộp gỗ chibi</h3>
                <span className="bsm" style={{ color: '#6b5f66' }}>
                  Nét mộc, ấm, hợp làm quà cặp đôi.
                </span>
              </div>
              <div style={{ position: 'absolute', right: '8%', bottom: '76px', width: '46%' }}>
                <Chibi hair="long" outfitColor="#c9484f" accessory="bouquet" />
              </div>
              <span className="btn btn-ink" style={{ alignSelf: 'flex-start', position: 'relative' }}>
                Xem tất cả
                <Icon name="arrowRight" />
              </span>
            </Link>
            <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Link
                to="/san-pham"
                style={{
                  minHeight: '190px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  background: '#d6ebfa',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <h3 className="hlg">Hộp mica chibi</h3>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                  }}
                >
                  Xem tất cả
                  <Icon name="arrowRight" />
                </span>
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <Link
                  to="/san-pham"
                  style={{
                    flex: '1 1 160px',
                    minHeight: '190px',
                    borderRadius: '24px',
                    background: '#fddede',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <h3 className="hh">Quà cưới cao cấp</h3>
                  <Icon name="arrowRight" />
                </Link>
                <Link
                  to="/san-pham"
                  style={{
                    flex: '1 1 160px',
                    minHeight: '190px',
                    borderRadius: '24px',
                    background: '#e8e0f8',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <h3 className="hh">Quà tặng cho nam</h3>
                  <Icon name="arrowRight" />
                </Link>
              </div>
              <Link
                to="/san-pham"
                style={{
                  borderRadius: '999px',
                  background: '#d3efe9',
                  padding: '0 28px',
                  minHeight: '72px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <h3 className="hh">Phụ kiện quà tặng</h3>
                <Icon name="arrowRight" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section style={{ paddingBottom: 'clamp(64px, 8vw, 96px)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px' }}>
              <span className="lbl">Có sẵn</span>
              <h2 className="hlg">Set quà làm sẵn cho bạn</h2>
            </div>
            <Link to="/san-pham" className="btn btn-line">
              Xem tất cả
            </Link>
          </div>
        </div>
        <CurvedProducts products={vals.products} />
      </section>
      <section style={{ paddingBottom: 'clamp(64px, 8vw, 96px)' }}>
        <div className="wrap">
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#fd9999',
              borderRadius: '32px',
              padding: 'clamp(32px, 6vw, 64px)',
              minHeight: '320px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                position: 'relative',
                zIndex: '2',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: '540px',
                alignItems: 'flex-start',
              }}
            >
              <h2 className="hlg">
                Sẵn sàng tạo <span style={{ color: '#ffffff' }}>chibi</span> của riêng bạn?
              </h2>
              <p className="sub" style={{ color: '#2a1f2d' }}>
                Chọn từng bước rồi gửi đơn cho shop. Shop sẽ liên hệ qua Zalo hoặc điện thoại để chốt chi tiết
                chế tác.
              </p>
              <Link to="/tao-chibi" className="btn btn-ink btn-lg">
                Bắt đầu thiết kế
              </Link>
            </div>
            <div
              style={{
                position: 'absolute',
                right: '6%',
                bottom: '-60px',
                width: '34%',
                maxWidth: '300px',
                display: 'flex',
                gap: '2%',
              }}
            >
              <div style={{ width: '50%' }}>
                <Chibi hair="long" outfitColor="#fffaf0" outfit="wedding" accessory="bouquet" />
              </div>
              <div style={{ width: '50%' }}>
                <Chibi skin="#e8b896" outfit="vest" outfitColor="#34405a" face="wink" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section style={{ background: '#f6efe6', paddingBlock: 'clamp(64px, 8vw, 96px)' }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'center' }}>
            <div
              style={{
                flex: '1 1 340px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <span className="lbl">Khách tin tưởng shop</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <Icon name="star" className="star" />
                <Icon name="star" className="star" />
                <Icon name="star" className="star" />
                <Icon name="star" className="star" />
                <Icon name="star" className="star" />
              </div>
              <span className="hxl">4.9/5</span>
              <p className="sub">Điểm đánh giá của shop trên Shopee.</p>
              <a href="#" className="btn btn-ink">
                Xem gian hàng Shopee
                <Icon name="arrowRight" />
              </a>
            </div>
            <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  paddingBlock: '20px',
                  borderBottom: '1px solid #e3d8ca',
                }}
              >
                <Icon name="clock" className="ic ic-24" />
                <span className="hlg" style={{ minWidth: '130px' }}>
                  [X] năm
                </span>
                <span className="bsm mut">Shop làm quà handmade</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  paddingBlock: '20px',
                  borderBottom: '1px solid #e3d8ca',
                }}
              >
                <Icon name="truck" className="ic ic-24" />
                <span className="hlg" style={{ minWidth: '130px' }}>
                  2-4 ngày
                </span>
                <span className="bsm mut">Hoàn thiện và giao dự kiến</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBlock: '20px' }}>
                <Icon name="image" className="ic ic-24" />
                <span className="hlg" style={{ minWidth: '130px' }}>
                  Ảnh duyệt
                </span>
                <span className="bsm mut">Shop gửi ảnh thật để bạn xác nhận trước khi giao</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="hh">Hình thật từ những người đã nhận quà</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
              <div
                className="ph"
                style={{
                  flex: '1 1 180px',
                  height: '220px',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Ảnh khách nhận hàng 1]</span>
              </div>
              <div
                className="ph"
                style={{
                  flex: '1.2 1 200px',
                  height: '300px',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Ảnh khách nhận hàng 2]</span>
              </div>
              <div
                className="ph"
                style={{
                  flex: '1 1 180px',
                  height: '250px',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Ảnh khách nhận hàng 3]</span>
              </div>
              <div
                className="ph"
                style={{
                  flex: '1.4 1 220px',
                  height: '190px',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <Icon name="image" className="ic ic-24" />
                <span className="bsm">[Ảnh khách nhận hàng 4]</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
