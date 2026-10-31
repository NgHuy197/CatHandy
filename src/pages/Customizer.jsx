import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import MiniChibi from '../components/MiniChibi';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { formatPrice } from '../lib/chibi';
import { addCustomItem } from '../lib/cart';

export default function Customizer() {
  const [params] = useSearchParams();
  const startBox = ['wood', 'mica', 'wedding'].includes(params.get('hop')) ? params.get('hop') : 'wood';
  const [state, setState] = useMergedState({
    step: 1,
    box: startBox,
    count: 2,
    active: 0,
    note: '',
    added: false,
    chars: [
      {
        skin: '#f7d9c4',
        hair: 'long',
        hairColor: '#2f2430',
        face: 'smile',
        glasses: false,
        beard: false,
        outfit: 'aodai',
        outfitColor: '#c9484f',
        accessory: 'bouquet',
      },
      {
        skin: '#e8b896',
        hair: 'short',
        hairColor: '#2f2430',
        face: 'wink',
        glasses: false,
        beard: false,
        outfit: 'vest',
        outfitColor: '#34405a',
        accessory: 'none',
      },
    ],
  });

  const st = state;
  const BOX = {
    wood: { label: 'Hộp gỗ chibi', base: 289000, wash: '#fbeab4', desc: 'Hộp gỗ, nét mộc và ấm.' },
    mica: {
      label: 'Hộp mica chibi',
      base: 349000,
      wash: '#d6ebfa',
      desc: 'Hộp mica trong, nhìn rõ nhân vật.',
    },
    wedding: { label: 'Bộ quà cưới', base: 489000, wash: '#fddede', desc: 'Bộ quà dành cho ngày cưới.' },
  };
  const SECOND = 120000,
    GL = 10000,
    BE = 10000;
  const OUT = { shirt: 0, aodai: 20000, vest: 20000, wedding: 30000 };
  const ACC = { none: 0, bouquet: 25000, bow: 10000, flower: 10000 };
  const L = {
    hair: { short: 'tóc ngắn', long: 'tóc dài', bob: 'tóc bob', bun: 'búi cao' },
    face: { smile: 'cười nhẹ', laugh: 'cười tươi', wink: 'nháy mắt', calm: 'điềm đạm' },
    outfit: { shirt: 'Áo sơ mi', aodai: 'Áo dài', vest: 'Vest', wedding: 'Váy cưới' },
    acc: { none: 'Không phụ kiện', bouquet: 'Bó hoa', bow: 'Nơ cổ', flower: 'Hoa cài tóc' },
    skin: { '#fde3d0': 'Sáng', '#f7d9c4': 'Be', '#e8b896': 'Nâu sáng', '#c58c63': 'Nâu' },
    hc: { '#2f2430': 'đen', '#5a3a2a': 'nâu', '#d9b06a': 'vàng', '#e88fa0': 'hồng', '#8a8290': 'xám tro' },
    oc: {
      '#fd9999': 'hồng',
      '#c9484f': 'đỏ',
      '#fffaf0': 'kem',
      '#cbbdf0': 'tím nhạt',
      '#9ccbee': 'xanh nhạt',
      '#34405a': 'xanh navy',
      '#3b2f3e': 'đen',
      '#f2d27a': 'vàng bơ',
      '#9fd6c4': 'bạc hà',
    },
  };
  const step = st.step;
  const cfg = st.chars[st.active];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const setCfg = (k, v) =>
    setState({
      chars: st.chars.map((c, i) => (i === st.active ? Object.assign({}, c, { [k]: v }) : c)),
      added: false,
    });
  const withCfg = (k, v) => Object.assign({}, cfg, { [k]: v });
  const styleSec = (title, key, list, crop) => ({
    title,
    isStyle: true,
    isSwatch: false,
    opts: list.map((o) => ({
      label: o[1],
      extra: o[2] ? '+' + formatPrice(o[2]) : '',
      hasExtra: !!o[2],
      on: cfg[key] === o[0],
      cls: cfg[key] === o[0] ? 'tile on' : 'tile',
      m: withCfg(key, o[0]),
      crop,
      pick: () => setCfg(key, o[0]),
    })),
  });
  const swatchSec = (title, key, list) => ({
    title,
    isStyle: false,
    isSwatch: true,
    opts: list.map((o) => ({
      label: o[1],
      color: o[0],
      on: cfg[key] === o[0],
      cls: cfg[key] === o[0] ? 'tile on' : 'tile',
      pick: () => setCfg(key, o[0]),
    })),
  });
  const sec2 = [
    swatchSec('Tông da', 'skin', [
      ['#fde3d0', 'Sáng'],
      ['#f7d9c4', 'Be'],
      ['#e8b896', 'Nâu sáng'],
      ['#c58c63', 'Nâu'],
    ]),
    styleSec(
      'Kiểu tóc',
      'hair',
      [
        ['short', 'Tóc ngắn'],
        ['long', 'Tóc dài'],
        ['bob', 'Tóc bob'],
        ['bun', 'Búi cao'],
      ],
      'head',
    ),
    swatchSec('Màu tóc', 'hairColor', [
      ['#2f2430', 'Đen'],
      ['#5a3a2a', 'Nâu'],
      ['#d9b06a', 'Vàng'],
      ['#e88fa0', 'Hồng'],
      ['#8a8290', 'Xám tro'],
    ]),
    styleSec(
      'Biểu cảm',
      'face',
      [
        ['smile', 'Cười nhẹ'],
        ['laugh', 'Cười tươi'],
        ['wink', 'Nháy mắt'],
        ['calm', 'Điềm đạm'],
      ],
      'head',
    ),
    styleSec(
      'Kính',
      'glasses',
      [
        [false, 'Không kính'],
        [true, 'Kính tròn', GL],
      ],
      'head',
    ),
    styleSec(
      'Râu',
      'beard',
      [
        [false, 'Không râu'],
        [true, 'Có râu', BE],
      ],
      'head',
    ),
  ];
  const sec3 = [
    styleSec(
      'Trang phục',
      'outfit',
      [
        ['shirt', 'Áo sơ mi'],
        ['aodai', 'Áo dài', OUT.aodai],
        ['vest', 'Vest', OUT.vest],
        ['wedding', 'Váy cưới', OUT.wedding],
      ],
      'body',
    ),
    swatchSec('Màu trang phục', 'outfitColor', [
      ['#fd9999', 'Hồng'],
      ['#c9484f', 'Đỏ'],
      ['#fffaf0', 'Kem'],
      ['#cbbdf0', 'Tím nhạt'],
      ['#9ccbee', 'Xanh nhạt'],
      ['#34405a', 'Navy'],
      ['#3b2f3e', 'Đen'],
      ['#f2d27a', 'Vàng bơ'],
      ['#9fd6c4', 'Bạc hà'],
    ]),
    styleSec(
      'Phụ kiện',
      'accessory',
      [
        ['none', 'Không có'],
        ['bouquet', 'Bó hoa', ACC.bouquet],
        ['bow', 'Nơ cổ', ACC.bow],
        ['flower', 'Hoa cài tóc', ACC.flower],
      ],
      'body',
    ),
  ];
  const titles = [
    'Chọn sản phẩm nền',
    'Dựng khuôn mặt và mái tóc',
    'Chọn trang phục và phụ kiện',
    'Ghi chú cho shop và xem lại',
  ];
  const hints = [
    'Chọn loại hộp và số nhân vật. Giá nền thay đổi theo loại hộp.',
    'Chọn tông da, kiểu tóc, màu tóc, biểu cảm, kính và râu.',
    'Chọn trang phục, màu sắc và phụ kiện cầm tay hoặc trang trí.',
    'Viết điều shop cần lưu ý, rồi xem lại toàn bộ thiết kế.',
  ];
  const panelRef = useRef(null);
  const go = (n) => {
    setState({ step: Math.max(1, Math.min(4, n)), added: false });
    if (window.matchMedia('(max-width: 1040px)').matches) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const active = st.chars.slice(0, st.count);
  const desc = (c) =>
    cap(
      L.hair[c.hair] +
        ' ' +
        L.hc[c.hairColor] +
        ', ' +
        L.outfit[c.outfit].toLowerCase() +
        ' ' +
        L.oc[c.outfitColor] +
        (c.accessory !== 'none' ? ', ' + L.acc[c.accessory].toLowerCase() : ''),
    );
  const lines = [{ label: BOX[st.box].label, price: formatPrice(BOX[st.box].base) }];
  let total = BOX[st.box].base;
  if (st.count === 2) {
    lines.push({ label: 'Nhân vật thứ hai', price: '+' + formatPrice(SECOND) });
    total += SECOND;
  }
  active.forEach((c, i) => {
    const nm = st.count === 2 ? 'Nhân vật ' + (i + 1) + ': ' : '';
    if (OUT[c.outfit]) {
      lines.push({ label: nm + L.outfit[c.outfit], price: '+' + formatPrice(OUT[c.outfit]) });
      total += OUT[c.outfit];
    }
    if (ACC[c.accessory]) {
      lines.push({ label: nm + L.acc[c.accessory], price: '+' + formatPrice(ACC[c.accessory]) });
      total += ACC[c.accessory];
    }
    if (c.glasses) {
      lines.push({ label: nm + 'Kính tròn', price: '+' + formatPrice(GL) });
      total += GL;
    }
    if (c.beard) {
      lines.push({ label: nm + 'Râu', price: '+' + formatPrice(BE) });
      total += BE;
    }
  });
  const stageBg = { wood: '#fbeab4', mica: '#d6ebfa', wedding: '#fddede' }[st.box];
  const panelStyle = {
    wood: 'position:absolute;left:10%;right:10%;bottom:12%;height:44%;border-radius:20px;background:rgba(214,160,87,0.28);border:6px solid rgba(214,160,87,0.55)',
    mica: 'position:absolute;left:10%;right:10%;bottom:12%;height:44%;border-radius:20px;background:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.9);box-shadow:0 8px 32px rgba(42,31,45,0.12)',
    wedding:
      'position:absolute;left:10%;right:10%;bottom:12%;height:44%;border-radius:20px;background:rgba(253,153,153,0.25);border:6px solid #fd9999',
  }[st.box];
  const stepDefs = ['Sản phẩm nền', 'Khuôn mặt và tóc', 'Trang phục', 'Ghi chú và xem lại'];
  const addCart = () => {
    if (st.added) return;
    addCustomItem({
      title: BOX[st.box].label,
      sub: st.count + ' nhân vật',
      price: total,
      wash: stageBg,
      a: st.chars[0],
      b: st.count === 2 ? st.chars[1] : undefined,
      lines: active.map((c, i) => (st.count === 2 ? 'Nhân vật ' + (i + 1) + ': ' : '') + desc(c)),
      note: st.note,
    });
    setState({ added: true });
  };
  const vals = {
    stepper: stepDefs.map((label, i) => {
      const n = i + 1,
        cur = n === step,
        done = n < step;
      return {
        n,
        label,
        done,
        notDone: !done,
        pick: () => go(n),
        btn:
          'display:flex;align-items:center;gap:10px;min-height:44px;padding:4px 18px 4px 4px;border-radius:999px;cursor:pointer;font:500 14px/20px "Be Vietnam Pro",sans-serif;color:#2a1f2d;border:1px solid ' +
          (cur ? '#2a1f2d' : '#857a80') +
          ';background:' +
          (cur ? '#fdeeee' : '#ffffff'),
        dot:
          'width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font:600 14px/20px "Be Vietnam Pro",sans-serif;' +
          (cur
            ? 'background:#2a1f2d;color:#fdf9f3'
            : done
              ? 'background:#fd9999;color:#2a1f2d'
              : 'background:#f6efe6;color:#2a1f2d'),
      };
    }),
    stepTitle: titles[step - 1],
    stepHint: hints[step - 1],
    isS1: step === 1,
    isS4: step === 4,
    isEdit: step === 2 || step === 3,
    showTabs: st.count === 2 && (step === 2 || step === 3),
    tabs: [0, 1].map((i) => ({
      label: 'Nhân vật ' + (i + 1),
      on: st.active === i,
      cls: st.active === i ? 'chip on' : 'chip',
      pick: () => setState({ active: i }),
    })),
    sections: step === 2 ? sec2 : sec3,
    boxes: Object.keys(BOX).map((id) => ({
      label: BOX[id].label,
      desc: BOX[id].desc,
      wash: BOX[id].wash,
      price: formatPrice(BOX[id].base),
      on: st.box === id,
      cls: st.box === id ? 'tile on' : 'tile',
      pick: () => setState({ box: id, added: false }),
    })),
    counts: [1, 2].map((n) => ({
      label: n + ' nhân vật',
      hasExtra: n === 2,
      extra: '+' + formatPrice(SECOND),
      on: st.count === n,
      cls: st.count === n ? 'tile on' : 'tile',
      pick: () => setState({ count: n, active: 0, added: false }),
    })),
    note: st.note,
    onNote: (e) => setState({ note: e.target.value }),
    review: active
      .map((c, i) => ({
        title: st.count === 2 ? 'Nhân vật ' + (i + 1) : 'Nhân vật',
        rows: [
          { k: 'Tông da', v: L.skin[c.skin] },
          { k: 'Tóc', v: cap(L.hair[c.hair]) + ' ' + L.hc[c.hairColor] },
          { k: 'Biểu cảm', v: cap(L.face[c.face]) },
          {
            k: 'Kính và râu',
            v: (c.glasses ? 'Kính tròn' : 'Không kính') + ', ' + (c.beard ? 'có râu' : 'không râu'),
          },
          { k: 'Trang phục', v: L.outfit[c.outfit] + ' ' + L.oc[c.outfitColor] },
          { k: 'Phụ kiện', v: L.acc[c.accessory] },
        ],
      }))
      .concat([
        { title: 'Ghi chú cho shop', rows: [{ k: 'Nội dung', v: st.note ? st.note : 'Chưa có ghi chú' }] },
      ]),
    toS2: () => go(2),
    toS3: () => go(3),
    back: () => go(step - 1),
    next: () => go(step + 1),
    backOff: step === 1,
    notLast: step < 4,
    addCart,
    added: st.added,
    stageBg,
    panelStyle,
    charW: st.count === 2 ? '36%' : '44%',
    a: st.chars[0],
    b: st.chars[1],
    hasB: st.count === 2,
    boxLabel: BOX[st.box].label,
    brief: [{ k: 'Sản phẩm', v: BOX[st.box].label + ', ' + st.count + ' nhân vật' }].concat(
      active.map((c, i) => ({ k: st.count === 2 ? 'Nhân vật ' + (i + 1) : 'Nhân vật', v: desc(c) })),
    ),
    lines,
    total: formatPrice(total),
  };

  return (
    <div className="cat">
      <SiteHeader active="custom" />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Trình thiết kế chibi</span>
          <h1 className="hd">
            Tự tay tạo <span className="deep">chibi</span>
          </h1>
          <p className="sub" style={{ maxWidth: '620px' }}>
            Chọn từng bước, hình nhân vật và giá đổi ngay khi bạn chọn. Shop sẽ liên hệ để chốt chi tiết trước
            khi làm.
          </p>
        </div>
        <nav aria-label="Các bước thiết kế" className="cz-steps">
          {vals.stepper.map((s, index) => (
            <button key={index} type="button" onClick={s.pick} style={css(s.btn)}>
              <span style={css(s.dot)}>
                {s.done ? (
                  <>
                    <Icon name="check" style={{ width: '18px', height: '18px', strokeWidth: '2.2' }} />
                  </>
                ) : null}
                {s.notDone ? <>{s.n}</> : null}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
        <div className="cz-layout">
          <section
            ref={panelRef}
            className="cz-panel"
            style={{
              flex: '999 1 560px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div
              className="card"
              style={{
                padding: 'clamp(20px, 3vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 className="hh" style={{ fontSize: '28px', lineHeight: '34px' }}>
                  {vals.stepTitle}
                </h2>
                <p className="bsm mut">{vals.stepHint}</p>
              </div>
              {vals.isS1 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span className="flabel">Sản phẩm nền</span>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))',
                          gap: '12px',
                        }}
                      >
                        {vals.boxes.map((b, index) => (
                          <button
                            key={index}
                            type="button"
                            className={b.cls}
                            aria-pressed={b.on}
                            onClick={b.pick}
                            style={{
                              alignItems: 'flex-start',
                              textAlign: 'left',
                              gap: '10px',
                              padding: '16px',
                            }}
                          >
                            <span
                              style={{
                                width: '100%',
                                height: '56px',
                                borderRadius: '8px',
                                background: b.wash,
                              }}
                            />
                            <span className="hh">{b.label}</span>
                            <span className="bsm mut" style={{ fontWeight: '400' }}>
                              {b.desc}
                            </span>
                            <span className="bsm" style={{ fontWeight: '600' }}>
                              Từ {b.price}
                            </span>
                            <span className="tick">
                              <Icon name="check" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <span className="flabel">Số nhân vật</span>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))',
                          gap: '12px',
                        }}
                      >
                        {vals.counts.map((k, index) => (
                          <button
                            key={index}
                            type="button"
                            className={k.cls}
                            aria-pressed={k.on}
                            onClick={k.pick}
                            style={{ minHeight: '72px' }}
                          >
                            <span>{k.label}</span>
                            {k.hasExtra ? (
                              <>
                                <span className="cap" style={{ color: '#6b5f66', fontWeight: '400' }}>
                                  {k.extra}
                                </span>
                              </>
                            ) : null}
                            <span className="tick">
                              <Icon name="check" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {vals.showTabs ? (
                <>
                  <div
                    style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                    role="group"
                    aria-label="Chọn nhân vật đang chỉnh"
                  >
                    {vals.tabs.map((t, index) => (
                      <button
                        key={index}
                        type="button"
                        className={t.cls}
                        aria-pressed={t.on}
                        onClick={t.pick}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              {vals.isEdit ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {vals.sections.map((sec, index) => (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span className="flabel">{sec.title}</span>
                        {sec.isStyle ? (
                          <>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(112px, 100%), 1fr))',
                                gap: '12px',
                              }}
                            >
                              {sec.opts.map((o, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className={o.cls}
                                  aria-pressed={o.on}
                                  onClick={o.pick}
                                >
                                  <MiniChibi cfg={o.m} crop={o.crop} />
                                  <span>{o.label}</span>
                                  {o.hasExtra ? (
                                    <>
                                      <span className="cap" style={{ fontWeight: '400' }}>
                                        {o.extra}
                                      </span>
                                    </>
                                  ) : null}
                                  <span className="tick">
                                    <Icon name="check" />
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        ) : null}
                        {sec.isSwatch ? (
                          <>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(92px, 100%), 1fr))',
                                gap: '12px',
                              }}
                            >
                              {sec.opts.map((o, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className={o.cls}
                                  aria-pressed={o.on}
                                  onClick={o.pick}
                                >
                                  <span className="swatch" style={{ background: o.color }} />
                                  <span className="bsm">{o.label}</span>
                                  <span className="tick">
                                    <Icon name="check" />
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              {vals.isS4 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="field">
                      <label htmlFor="note">Ghi chú cho shop</label>
                      <textarea
                        id="note"
                        className="input"
                        rows="4"
                        placeholder="Ví dụ: tên cần khắc, màu hoa, ngày cần nhận quà"
                        value={vals.note}
                        onChange={vals.onNote}
                      />
                      <span className="cap">Chi tiết riêng bạn muốn shop lưu ý khi làm.</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <span className="flabel">Xem lại thiết kế</span>
                      {vals.review.map((r, index) => (
                        <div
                          key={index}
                          className="card-2"
                          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                        >
                          <h3 className="hh">{r.title}</h3>
                          {r.rows.map((row, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '16px',
                                paddingBottom: '8px',
                                borderBottom: '1px solid #e3d8ca',
                              }}
                            >
                              <span className="bsm mut">{row.k}</span>
                              <span className="bsm" style={{ fontWeight: '500', textAlign: 'right' }}>
                                {row.v}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-line" onClick={vals.toS2}>
                          Sửa khuôn mặt và tóc
                        </button>
                        <button type="button" className="btn btn-line" onClick={vals.toS3}>
                          Sửa trang phục
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              <hr className="hr" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <button type="button" className="btn btn-line" onClick={vals.back} disabled={vals.backOff}>
                  <Icon name="chevronLeft" />
                  Quay lại
                </button>
                {vals.notLast ? (
                  <>
                    <button type="button" className="btn btn-ink btn-lg" onClick={vals.next}>
                      Tiếp tục
                      <Icon name="chevronRight" />
                    </button>
                  </>
                ) : null}
                {vals.isS4 ? (
                  <>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-line btn-lg" onClick={vals.addCart}>
                        Thêm vào giỏ hàng
                      </button>
                      <Link to="/dat-hang" className="btn btn-ink btn-lg" onClick={vals.addCart}>
                        Đặt hàng ngay
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
              {vals.added ? (
                <>
                  <div
                    role="status"
                    className="tag t-ok"
                    style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '14px', gap: '8px' }}
                  >
                    <Icon name="check" />
                    Đã thêm chibi vào giỏ hàng.{' '}
                    <Link to="/gio-hang" style={{ textDecoration: 'underline' }}>
                      Xem giỏ hàng
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </section>
          <aside className="cz-side">
            <div className="cz-stage">
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                aspectRatio: '1 / 1',
                background: vals.stageBg,
              }}
            >
              <div style={css(vals.panelStyle)} />
              <div
                style={{
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '2%',
                  paddingBottom: '19%',
                }}
              >
                <div style={{ width: vals.charW }}>
                  <Chibi {...vals.a} />
                </div>
                {vals.hasB ? (
                  <>
                    <div style={{ width: vals.charW }}>
                      <Chibi {...vals.b} />
                    </div>
                  </>
                ) : null}
              </div>
              <span
                className="glass-clear cz-box"
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                }}
              >
                {vals.boxLabel}
              </span>
              <span
                className="glass-clear cz-hint"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  font: "500 14px/20px 'Be Vietnam Pro', sans-serif",
                }}
              >
                Xem trước, đổi lựa chọn là hình đổi ngay
              </span>
            </div>
            </div>
            <div
              style={{
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
              <h2 className="hh">Tóm tắt nhân vật</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {vals.brief.map((x, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="cap">{x.k}</span>
                    <span className="bsm" style={{ fontWeight: '500' }}>
                      {x.v}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {vals.lines.map((l, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span className="bsm mut">{l.label}</span>
                    <span className="bsm" style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {l.price}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="hr" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <span className="flabel">Tạm tính</span>
                <span className="hlg">{vals.total}</span>
              </div>
              <p className="cap">
                Giá do shop cấu hình. Shop sẽ xác nhận lại khi liên hệ qua Zalo hoặc điện thoại.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
