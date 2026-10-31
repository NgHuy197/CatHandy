import AdminSidebar from '../components/AdminSidebar';
import MiniChibi from '../components/MiniChibi';
import Chibi from '../components/Chibi';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { chibi, formatPrice } from '../lib/chibi';

const defaults = {
  wood: 289000,
  mica: 349000,
  wedding: 489000,
  second: 120000,
  aodai: 20000,
  vest: 20000,
  weddingOutfit: 30000,
  bouquet: 25000,
  bow: 10000,
  flower: 10000,
  glasses: 10000,
  beard: 10000,
};

export default function AdminCustomizer() {
  const [state, setState] = useMergedState({
    tab: 'layers',
    group: 'outfit',
    editId: null,
    hidden: {},
    prices: Object.assign({}, defaults),
    presetHidden: {},
  });

  const st = state;
  const P = st.prices;
  const TABS = [
    ['layers', 'Kho tùy chọn'],
    ['prices', 'Giá phụ phí'],
    ['presets', 'Mẫu gợi ý'],
  ];
  const GROUPS = [
    ['box', 'Loại hộp'],
    ['skin', 'Tông da'],
    ['hair', 'Kiểu tóc'],
    ['hairColor', 'Màu tóc'],
    ['face', 'Biểu cảm'],
    ['gl', 'Kính và râu'],
    ['outfit', 'Trang phục'],
    ['acc', 'Phụ kiện'],
  ];
  const money = (n) => (n ? '+' + formatPrice(n) : 'Miễn phí');
  const sw = (id, name, color, extra, boxes) => ({
    id,
    name,
    isSwatch: true,
    isMini: false,
    color,
    extra: money(extra),
    boxes: boxes || 'Tất cả hộp',
  });
  const mini = (id, name, m, crop, extra, boxes) => ({
    id,
    name,
    isSwatch: false,
    isMini: true,
    m,
    crop,
    extra: money(extra),
    boxes: boxes || 'Tất cả hộp',
  });
  const DATA = {
    box: [
      sw('b1', 'Hộp gỗ chibi', '#fbeab4', P.wood, 'Giá nền'),
      sw('b2', 'Hộp mica chibi', '#d6ebfa', P.mica, 'Giá nền'),
      sw('b3', 'Bộ quà cưới', '#fddede', P.wedding, 'Giá nền'),
    ],
    skin: [
      ['Sáng', '#fde3d0'],
      ['Be', '#f7d9c4'],
      ['Nâu sáng', '#e8b896'],
      ['Nâu', '#c58c63'],
    ].map((x, i) => sw('s' + i, x[0], x[1], 0)),
    hair: [
      ['short', 'Tóc ngắn'],
      ['long', 'Tóc dài'],
      ['bob', 'Tóc bob'],
      ['bun', 'Búi cao'],
    ].map((x, i) => mini('h' + i, x[1], chibi({ hair: x[0] }), 'head', 0)),
    hairColor: [
      ['Đen', '#2f2430'],
      ['Nâu', '#5a3a2a'],
      ['Vàng', '#d9b06a'],
      ['Hồng', '#e88fa0'],
      ['Xám tro', '#8a8290'],
    ].map((x, i) => sw('hc' + i, x[0], x[1], 0)),
    face: [
      ['smile', 'Cười nhẹ'],
      ['laugh', 'Cười tươi'],
      ['wink', 'Nháy mắt'],
      ['calm', 'Điềm đạm'],
    ].map((x, i) => mini('f' + i, x[1], chibi({ face: x[0] }), 'head', 0)),
    gl: [
      mini('g1', 'Kính tròn', chibi({ glasses: true }), 'head', P.glasses),
      mini('g2', 'Râu', chibi({ beard: true }), 'head', P.beard),
    ],
    outfit: [
      mini('o1', 'Áo sơ mi', chibi({ outfit: 'shirt' }), 'body', 0),
      mini('o2', 'Áo dài', chibi({ outfit: 'aodai' }), 'body', P.aodai),
      mini('o3', 'Vest', chibi({ outfit: 'vest', outfitColor: '#34405a' }), 'body', P.vest),
      mini(
        'o4',
        'Váy cưới',
        chibi({ outfit: 'wedding', outfitColor: '#fffaf0' }),
        'body',
        P.weddingOutfit,
        'Quà cưới',
      ),
    ],
    acc: [
      mini('a1', 'Bó hoa', chibi({ accessory: 'bouquet' }), 'body', P.bouquet),
      mini('a2', 'Nơ cổ', chibi({ accessory: 'bow' }), 'body', P.bow),
      mini('a3', 'Hoa cài tóc', chibi({ accessory: 'flower' }), 'body', P.flower),
    ],
  };
  const rowsSrc = DATA[st.group];
  const tg = (on) => (on ? 'toggle on' : 'toggle');
  const rows = rowsSrc.map((r) => {
    const hidden = !!st.hidden[r.id];
    return Object.assign({}, r, {
      visible: !hidden,
      toggleCls: tg(!hidden),
      visibleText: hidden ? 'Đang ẩn' : 'Đang hiện',
      toggleLabel: (hidden ? 'Hiện ' : 'Ẩn ') + r.name,
      toggle: () => setState({ hidden: Object.assign({}, st.hidden, { [r.id]: !hidden }) }),
      edit: () => setState({ editId: r.id }),
      rowStyle: st.editId === r.id ? 'background:#fdeeee' : hidden ? 'opacity:.6' : '',
    });
  });
  const editRow = rowsSrc.filter((r) => r.id === st.editId)[0];
  const priceInput = (key, id, label) => ({
    id: 'pi-' + id,
    label,
    value: String(P[key]),
    onChange: (e) => {
      const v = parseInt(String(e.target.value).replace(/\D/g, ''), 10);
      setState({ prices: Object.assign({}, P, { [key]: isNaN(v) ? 0 : v }) });
    },
  });
  const total = P.wood + P.second + P.aodai + P.bouquet + P.vest;
  const PRESETS = [
    {
      id: 'p1',
      title: 'Cặp đôi áo dài đỏ',
      sub: 'Hộp gỗ chibi, 2 nhân vật',
      wash: '#fddede',
      a: chibi({ hair: 'long', outfitColor: '#c9484f', accessory: 'bouquet' }),
      b: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', face: 'wink' }),
    },
    {
      id: 'p2',
      title: 'Cô dâu và chú rể',
      sub: 'Bộ quà cưới, 2 nhân vật',
      wash: '#e8e0f8',
      a: chibi({ hair: 'bun', outfit: 'wedding', outfitColor: '#fffaf0', accessory: 'bouquet' }),
      b: chibi({ outfit: 'vest', outfitColor: '#3b2f3e' }),
    },
    {
      id: 'p3',
      title: 'Quà sinh nhật bạn thân',
      sub: 'Hộp mica chibi, 1 nhân vật',
      wash: '#fbeab4',
      a: chibi({
        hair: 'bob',
        hairColor: '#5a3a2a',
        outfit: 'shirt',
        outfitColor: '#9fd6c4',
        face: 'laugh',
        glasses: true,
      }),
    },
    {
      id: 'p4',
      title: 'Quà tặng cho nam',
      sub: 'Hộp gỗ chibi, 1 nhân vật',
      wash: '#d6ebfa',
      a: chibi({
        skin: '#e8b896',
        outfit: 'vest',
        outfitColor: '#34405a',
        beard: true,
        glasses: true,
        face: 'calm',
      }),
    },
  ];
  const vals = {
    tabs: TABS.map((t) => ({
      label: t[1],
      on: st.tab === t[0],
      cls: st.tab === t[0] ? 'chip on' : 'chip',
      pick: () => setState({ tab: t[0], editId: null }),
    })),
    isLayers: st.tab === 'layers',
    isPrices: st.tab === 'prices',
    isPresets: st.tab === 'presets',
    groups: GROUPS.map((g) => ({
      label: g[1],
      on: st.group === g[0],
      cls: st.group === g[0] ? 'chip on' : 'chip',
      pick: () => setState({ group: g[0], editId: null }),
    })),
    groupTitle: GROUPS.filter((g) => g[0] === st.group)[0][1],
    rows,
    editing: !!editRow,
    editName: editRow ? editRow.name : '',
    editPrice: editRow ? editRow.extra.replace(/\D/g, '') || '0' : '0',
    closeEdit: () => setState({ editId: null }),
    noop: () => {},
    priceGroups: [
      {
        title: 'Giá nền theo loại hộp',
        items: [
          priceInput('wood', 'w', 'Hộp gỗ chibi'),
          priceInput('mica', 'm', 'Hộp mica chibi'),
          priceInput('wedding', 'c', 'Bộ quà cưới'),
        ],
      },
      {
        title: 'Nhân vật và trang phục',
        items: [
          priceInput('second', 's', 'Nhân vật thứ hai'),
          priceInput('aodai', 'a', 'Áo dài'),
          priceInput('vest', 'v', 'Vest'),
          priceInput('weddingOutfit', 'wo', 'Váy cưới'),
        ],
      },
      {
        title: 'Phụ kiện, kính và râu',
        items: [
          priceInput('bouquet', 'bq', 'Bó hoa'),
          priceInput('bow', 'bw', 'Nơ cổ'),
          priceInput('flower', 'fl', 'Hoa cài tóc'),
          priceInput('glasses', 'gl', 'Kính tròn'),
          priceInput('beard', 'be', 'Râu'),
        ],
      },
    ],
    resetPrices: () => setState({ prices: Object.assign({}, defaults) }),
    sample: [
      { k: 'Hộp gỗ chibi', v: formatPrice(P.wood) },
      { k: 'Nhân vật thứ hai', v: '+' + formatPrice(P.second) },
      { k: 'Áo dài', v: '+' + formatPrice(P.aodai) },
      { k: 'Vest', v: '+' + formatPrice(P.vest) },
      { k: 'Bó hoa', v: '+' + formatPrice(P.bouquet) },
    ],
    sampleTotal: formatPrice(total),
    presets: PRESETS.map((p) => {
      const hidden = !!st.presetHidden[p.id];
      return Object.assign({}, p, {
        hasB: !!p.b,
        visible: !hidden,
        toggleCls: tg(!hidden),
        visibleText: hidden ? 'Đang ẩn' : 'Hiện cho khách',
        toggleLabel: (hidden ? 'Hiện ' : 'Ẩn ') + p.title,
        toggle: () => setState({ presetHidden: Object.assign({}, st.presetHidden, { [p.id]: !hidden }) }),
      });
    }),
  };

  return (
    <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div className="admin-side">
        <AdminSidebar active="opt" />
      </div>
      <main
        style={{
          flex: '999 1 640px',
          minWidth: '0',
          padding: 'clamp(20px, 3vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="lbl">Quản trị</span>
            <h1 className="hlg" style={{ fontSize: '40px', lineHeight: '46px' }}>
              Tùy chọn chibi
            </h1>
            <p className="bsm mut">Quản lý các lớp ảnh, giá phụ phí và mẫu gợi ý của trình thiết kế.</p>
          </div>
          <div
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            role="tablist"
            aria-label="Phần quản lý"
          >
            {vals.tabs.map((t, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                className={t.cls}
                aria-selected={t.on}
                onClick={t.pick}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {vals.isLayers ? (
          <>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {vals.groups.map((g, index) => (
                  <button key={index} type="button" className={g.cls} aria-pressed={g.on} onClick={g.pick}>
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '20px 24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h2 className="hh">{vals.groupTitle}</h2>
                    <span className="cap">
                      Thêm, sửa, xóa hoặc ẩn lớp ảnh. Có thể giới hạn chỉ dùng cho một số loại hộp.
                    </span>
                  </div>
                  <button type="button" className="btn btn-ink">
                    <Icon name="plus" />
                    Thêm lớp ảnh
                  </button>
                </div>
                <div className="scroll-x">
                  <table className="tbl" style={{ minWidth: '680px' }}>
                    <thead>
                      <tr>
                        <th>Hình</th>
                        <th>Tên tùy chọn</th>
                        <th>Dùng cho hộp</th>
                        <th>Phụ phí</th>
                        <th>Hiển thị</th>
                        <th>
                          <span className="sr">Thao tác</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vals.rows.map((r, index) => (
                        <tr key={index} style={css(r.rowStyle)}>
                          <td>
                            {r.isMini ? (
                              <>
                                <MiniChibi cfg={r.m} crop={r.crop} />
                              </>
                            ) : null}
                            {r.isSwatch ? (
                              <>
                                <span className="swatch" style={{ display: 'block', background: r.color }} />
                              </>
                            ) : null}
                          </td>
                          <td>
                            <span style={{ fontWeight: '600' }}>{r.name}</span>
                          </td>
                          <td>
                            <span className="tag t-sand">{r.boxes}</span>
                          </td>
                          <td>{r.extra}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button
                                type="button"
                                aria-label={r.toggleLabel}
                                aria-pressed={r.visible}
                                onClick={r.toggle}
                                style={{
                                  background: 'none',
                                  border: '0',
                                  padding: '8px 0',
                                  cursor: 'pointer',
                                  minHeight: '44px',
                                }}
                              >
                                <span className={r.toggleCls}>
                                  <i />
                                </span>
                              </button>
                              <span className="cap">{r.visibleText}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                aria-label={`Sửa ${r.name}`}
                                onClick={r.edit}
                              >
                                <Icon name="pen" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                aria-label={`Xóa ${r.name}`}
                              >
                                <Icon name="trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {vals.editing ? (
                <>
                  <div
                    className="card"
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderColor: '#2a1f2d' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <h2 className="hh">Sửa: {vals.editName}</h2>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        aria-label="Đóng"
                        onClick={vals.closeEdit}
                      >
                        <Icon name="x" />
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                        gap: '16px',
                      }}
                    >
                      <div className="field">
                        <label htmlFor="en">Tên tùy chọn</label>
                        <input id="en" className="input" value={vals.editName} onChange={vals.noop} />
                      </div>
                      <div className="field">
                        <label htmlFor="ep">Phụ phí (đồng)</label>
                        <input
                          id="ep"
                          className="input"
                          inputMode="numeric"
                          value={vals.editPrice}
                          onChange={vals.noop}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span className="flabel">Dùng cho loại hộp</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="chip on">Hộp gỗ chibi</span>
                        <span className="chip on">Hộp mica chibi</span>
                        <span className="chip">Bộ quà cưới</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-line">
                        <Icon name="upload" />
                        Thay ảnh lớp
                      </button>
                      <button type="button" className="btn btn-ink" onClick={vals.closeEdit}>
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </section>
          </>
        ) : null}
        {vals.isPrices ? (
          <>
            <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
              <div
                className="card"
                style={{
                  flex: '999 1 480px',
                  minWidth: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 className="hh">Giá nền và phụ phí</h2>
                  <span className="cap">Khách thấy giá cập nhật theo ngay sau khi bạn lưu.</span>
                </div>
                {vals.priceGroups.map((pg, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span className="flabel">{pg.title}</span>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                        gap: '12px',
                      }}
                    >
                      {pg.items.map((p, index) => (
                        <div key={index} className="field">
                          <label htmlFor={p.id}>{p.label}</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              id={p.id}
                              className="input"
                              inputMode="numeric"
                              style={{ paddingRight: '44px' }}
                              value={p.value}
                              onChange={p.onChange}
                            />
                            <span
                              className="cap"
                              style={{ position: 'absolute', right: '16px', top: '14px' }}
                            >
                              đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-ink">
                    Lưu giá
                  </button>
                  <button type="button" className="btn btn-line" onClick={vals.resetPrices}>
                    Khôi phục giá ban đầu
                  </button>
                </div>
              </div>
              <aside
                style={{
                  flex: '1 1 280px',
                  maxWidth: '380px',
                  minWidth: '0',
                  background: '#fdeeee',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span className="lbl">Khách sẽ thấy</span>
                <h2 className="hh">Ví dụ cặp đôi áo dài</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {vals.sample.map((s, index) => (
                    <div
                      key={index}
                      style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}
                    >
                      <span className="bsm">{s.k}</span>
                      <span className="bsm" style={{ fontWeight: '500' }}>
                        {s.v}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="hr" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="flabel">Tạm tính</span>
                  <span className="hlg">{vals.sampleTotal}</span>
                </div>
              </aside>
            </section>
          </>
        ) : null}
        {vals.isPresets ? (
          <>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 className="hh">Thư viện mẫu gợi ý</h2>
                  <span className="cap">Mẫu cấu hình dựng sẵn để khách bấm vào là có ngay một thiết kế.</span>
                </div>
                <button type="button" className="btn btn-ink">
                  <Icon name="plus" />
                  Thêm mẫu gợi ý
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))',
                  gap: '24px',
                }}
              >
                {vals.presets.map((p, index) => (
                  <article
                    key={index}
                    className="card"
                    style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <div
                      style={{
                        background: p.wash,
                        borderRadius: '16px',
                        aspectRatio: '4 / 3',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '2%',
                        paddingBottom: '6%',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: '26%' }}>
                        <Chibi {...p.a} />
                      </div>
                      {p.hasB ? (
                        <>
                          <div style={{ width: '26%' }}>
                            <Chibi {...p.b} />
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div
                      style={{ paddingInline: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}
                    >
                      <span className="bsm" style={{ fontWeight: '600' }}>
                        {p.title}
                      </span>
                      <span className="cap">{p.sub}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '0 4px 4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          aria-label={p.toggleLabel}
                          aria-pressed={p.visible}
                          onClick={p.toggle}
                          style={{
                            background: 'none',
                            border: '0',
                            padding: '8px 0',
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                        >
                          <span className={p.toggleCls}>
                            <i />
                          </span>
                        </button>
                        <span className="cap">{p.visibleText}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" className="btn btn-ghost btn-icon" aria-label="Sửa mẫu">
                          <Icon name="pen" />
                        </button>
                        <button type="button" className="btn btn-ghost btn-icon" aria-label="Xóa mẫu">
                          <Icon name="trash" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
