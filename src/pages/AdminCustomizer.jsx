import AdminSidebar from '../components/AdminSidebar';
import MiniChibi from '../components/MiniChibi';
import Chibi from '../components/Chibi';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { chibi, formatPrice } from '../lib/chibi';
import { api, upload, useApi } from '../lib/api';
import { OPTION_GROUPS, quoteDesign } from '../../shared/customizer';

const COLOR_GROUPS = ['skin', 'hairColor', 'outfitColor'];
// Which character field each group previews on the mini chibi, and how it is cropped.
const PREVIEW = {
  hair: ['hair', 'head'],
  face: ['face', 'head'],
  gl: [null, 'head'],
  outfit: ['outfit', 'body'],
  acc: ['accessory', 'body'],
};
const errorBox = { background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' };
const digits = (v) => String(v ?? '').replace(/\D/g, '');
const SAMPLE_CHARS = [
  chibi({ hair: 'long', outfit: 'aodai', outfitColor: '#c9484f', accessory: 'bouquet' }),
  chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', face: 'wink' }),
];

function Toggle({ on, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      style={{ background: 'none', border: '0', padding: '8px 0', cursor: 'pointer', minHeight: '44px' }}
    >
      <span className={on ? 'toggle on' : 'toggle'}>
        <i />
      </span>
    </button>
  );
}

export default function AdminCustomizer() {
  const cfg = useApi('/admin/customizer');
  const [state, setState] = useMergedState({
    tab: 'layers',
    group: 'outfit',
    edit: null, // option being edited, or { isNew: true } for a new one
    preset: null, // preset being edited
    prices: {}, // optionId or 'second' -> edited value
    busy: false,
    error: '',
    saved: '',
  });

  const st = state;
  const config = cfg.data;
  const run = async (fn, saved = '') => {
    setState({ busy: true, error: '', saved: '' });
    try {
      await fn();
      setState({ busy: false, saved });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  if (!config) {
    return (
      <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
        <div className="admin-side">
          <AdminSidebar active="opt" />
        </div>
        <main style={{ flex: '999 1 640px', padding: 'clamp(20px, 3vw, 40px)' }}>
          <p className="bsm mut" role={cfg.error ? 'alert' : 'status'}>
            {cfg.error ? cfg.error.message : 'Đang tải cấu hình...'}
          </p>
        </main>
      </div>
    );
  }

  const groupRows = (grp) => (grp === 'box' ? config.boxes : config.groups[grp]);
  const boxLabel = (code) => config.boxes.find((b) => b.code === code)?.label ?? code;
  // Replaces one option in the loaded config after a save, wherever it lives.
  const putOption = (row, remove = false) =>
    cfg.setData((c) => {
      const swap = (list) => (remove ? list.filter((o) => o.id !== row.id) : list.some((o) => o.id === row.id) ? list.map((o) => (o.id === row.id ? row : o)) : [...list, row]);
      return row.grp === 'box' ? { ...c, boxes: swap(c.boxes) } : { ...c, groups: { ...c.groups, [row.grp]: swap(c.groups[row.grp]) } };
    });
  const putPreset = (row, remove = false) =>
    cfg.setData((c) => ({
      ...c,
      presets: remove ? c.presets.filter((p) => p.id !== row.id) : c.presets.some((p) => p.id === row.id) ? c.presets.map((p) => (p.id === row.id ? row : p)) : [...c.presets, row],
    }));

  const g = st.group;
  const isColor = COLOR_GROUPS.includes(g);
  const money = (n) => (n ? '+' + formatPrice(n) : 'Miễn phí');
  const previewOf = (o) => {
    const [field, crop] = PREVIEW[g] || [];
    if (!crop) return null;
    const m = field ? chibi({ [field]: o.code }) : chibi({ [o.code]: true });
    return { m: { ...m, layers: o.layerUrl ? [o.layerUrl] : [] }, crop };
  };
  const rows = groupRows(g).map((o) => ({
    ...o,
    preview: previewOf(o),
    swatch: g === 'box' ? o.wash : o.color,
    extra: g === 'box' ? formatPrice(o.price) + ' giá nền' : money(o.price),
    boxesText: g === 'box' ? 'Giá nền' : o.boxes ? o.boxes.map(boxLabel).join(', ') : 'Tất cả hộp',
    toggle: () =>
      run(async () => putOption(await api('/admin/options/' + o.id, { method: 'PATCH', body: { hidden: !o.hidden } }))),
    edit: () => setState({ edit: { ...o, price: String(o.price) }, error: '', saved: '' }),
    remove: () => {
      if (!window.confirm(`Xóa "${o.label}"? Thiết kế đang dùng tùy chọn này sẽ phải chọn lại. Nếu chỉ tạm ngưng, hãy ẩn thay vì xóa.`)) return;
      run(async () => {
        await api('/admin/options/' + o.id, { method: 'DELETE' });
        putOption(o, true);
        if (st.edit?.id === o.id) setState({ edit: null });
      });
    },
    rowStyle: st.edit?.id === o.id ? 'background:#fdeeee' : o.hidden ? 'opacity:.6' : '',
  }));

  const e = st.edit;
  const setEdit = (patch) => setState({ edit: { ...e, ...patch }, saved: '' });
  const saveEdit = () =>
    run(async () => {
      const body = {
        label: e.label,
        price: Number(digits(e.price)),
        ...(isColor ? { color: e.color } : {}),
        ...(g === 'box' ? { wash: e.wash, description: e.description } : { boxes: e.boxes?.length ? e.boxes : null }),
        ...(PREVIEW[g] ? { layerKey: e.layerKey ?? null } : {}),
      };
      const row = e.isNew
        ? await api('/admin/options', { method: 'POST', body: { ...body, grp: g } })
        : await api('/admin/options/' + e.id, { method: 'PATCH', body });
      putOption(row);
      setState({ edit: { ...row, price: String(row.price) } });
    }, 'Đã lưu tùy chọn');
  const uploadLayer = (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    run(async () => {
      const up = await upload('/admin/uploads', file);
      setState({ edit: { ...e, layerKey: up.key, layerUrl: up.url } });
    });
  };

  // Prices tab: edits stay local until "Lưu giá".
  const priceOf = (o) => (st.prices[o.id] !== undefined ? st.prices[o.id] : String(o.price));
  const secondValue = st.prices.second !== undefined ? st.prices.second : String(config.secondPrice);
  const priceInput = (o) => ({
    id: 'pi-' + o.id,
    label: o.label,
    value: priceOf(o),
    onChange: (ev) => setState({ prices: { ...st.prices, [o.id]: digits(ev.target.value) }, saved: '' }),
  });
  const withPrices = (list) => list.map((o) => ({ ...o, price: Number(digits(priceOf(o))) }));
  const draftConfig = {
    boxes: withPrices(config.boxes),
    groups: Object.fromEntries(Object.entries(config.groups).map(([k, v]) => [k, withPrices(v)])),
    secondPrice: Number(digits(secondValue)),
  };
  const sampleBox = config.boxes[0];
  const sample = sampleBox ? quoteDesign(draftConfig, { box: sampleBox.code, count: 2, chars: SAMPLE_CHARS }) : null;
  const savePrices = () =>
    run(async () => {
      const changed = [...config.boxes, ...Object.values(config.groups).flat()].filter(
        (o) => st.prices[o.id] !== undefined && Number(digits(st.prices[o.id])) !== o.price,
      );
      for (const o of changed) putOption(await api('/admin/options/' + o.id, { method: 'PATCH', body: { price: Number(digits(st.prices[o.id])) } }));
      if (st.prices.second !== undefined) {
        const s = await api('/admin/settings', { method: 'PUT', body: { secondCharacterPrice: Number(digits(st.prices.second)) } });
        cfg.setData((c) => ({ ...c, secondPrice: s.secondCharacterPrice }));
      }
      setState({ prices: {} });
    }, 'Đã lưu giá');

  // Presets tab.
  const p = st.preset;
  const setPreset = (patch) => setState({ preset: { ...p, ...patch }, saved: '' });
  const setPresetChar = (i, k, v) => setPreset({ chars: p.chars.map((ch, j) => (j === i ? { ...ch, [k]: v } : ch)) });
  const savePreset = () =>
    run(async () => {
      const body = { name: p.name, box: p.box, count: p.count, chars: p.chars.slice(0, p.count) };
      const row = p.id
        ? await api('/admin/presets/' + p.id, { method: 'PATCH', body })
        : await api('/admin/presets', { method: 'POST', body });
      putPreset(row);
      setState({ preset: null });
    }, 'Đã lưu mẫu gợi ý');
  const presetSelects = [
    ['skin', 'Tông da', 'skin'],
    ['hair', 'Kiểu tóc', 'hair'],
    ['hairColor', 'Màu tóc', 'hairColor'],
    ['face', 'Biểu cảm', 'face'],
    ['outfit', 'Trang phục', 'outfit'],
    ['outfitColor', 'Màu trang phục', 'outfitColor'],
    ['accessory', 'Phụ kiện', 'acc'],
  ];

  const vals = {
    tabs: [
      ['layers', 'Kho tùy chọn'],
      ['prices', 'Giá phụ phí'],
      ['presets', 'Mẫu gợi ý'],
    ].map((t) => ({
      label: t[1],
      on: st.tab === t[0],
      cls: st.tab === t[0] ? 'chip on' : 'chip',
      pick: () => setState({ tab: t[0], edit: null, preset: null, error: '', saved: '' }),
    })),
    isLayers: st.tab === 'layers',
    isPrices: st.tab === 'prices',
    isPresets: st.tab === 'presets',
    groups: OPTION_GROUPS.map(([id, label]) => ({
      label,
      on: g === id,
      cls: g === id ? 'chip on' : 'chip',
      pick: () => setState({ group: id, edit: null, error: '', saved: '' }),
    })),
    groupTitle: OPTION_GROUPS.find(([id]) => id === g)[1],
    canAdd: g !== 'gl',
    addNew: () =>
      setState({
        edit: { isNew: true, label: '', price: '0', color: '#fd9999', wash: '#fbeab4', description: '', boxes: null, layerKey: null },
        error: '',
        saved: '',
      }),
    rows,
    priceGroups: [
      { title: 'Giá nền theo loại hộp', items: config.boxes.map(priceInput) },
      {
        title: 'Nhân vật và trang phục',
        items: [
          {
            id: 'pi-second',
            label: 'Nhân vật thứ hai',
            value: secondValue,
            onChange: (ev) => setState({ prices: { ...st.prices, second: digits(ev.target.value) }, saved: '' }),
          },
          ...config.groups.outfit.map(priceInput),
        ],
      },
      { title: 'Phụ kiện, kính và râu', items: [...config.groups.acc, ...config.groups.gl].map(priceInput) },
      {
        title: 'Phụ phí khác (tóc, biểu cảm, màu)',
        items: ['hair', 'face', 'skin', 'hairColor', 'outfitColor'].flatMap((k) => config.groups[k]).filter((o) => o.price || st.prices[o.id] !== undefined).map(priceInput),
      },
    ].filter((pg) => pg.items.length),
    presets: config.presets.map((pr) => {
      const box = config.boxes.find((b) => b.code === pr.box);
      return {
        ...pr,
        a: chibi(pr.chars[0]),
        b: pr.count === 2 && pr.chars[1] ? chibi(pr.chars[1]) : null,
        wash: box?.wash || '#f6efe6',
        sub: boxLabel(pr.box) + ', ' + pr.count + ' nhân vật',
        toggle: () =>
          run(async () => putPreset(await api('/admin/presets/' + pr.id, { method: 'PATCH', body: { hidden: !pr.hidden } }))),
        edit: () =>
          setState({ preset: { ...pr, chars: [chibi(pr.chars[0]), chibi(pr.chars[1] || SAMPLE_CHARS[1])] }, error: '', saved: '' }),
        remove: () => {
          if (!window.confirm(`Xóa mẫu "${pr.name}"?`)) return;
          run(async () => {
            await api('/admin/presets/' + pr.id, { method: 'DELETE' });
            putPreset(pr, true);
          });
        },
      };
    }),
  };

  const feedback = (
    <>
      {st.error ? (
        <p className="bsm" role="alert" style={errorBox}>
          {st.error}
        </p>
      ) : null}
      {st.saved ? (
        <p className="bsm" role="status">
          {st.saved}
        </p>
      ) : null}
    </>
  );

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
                {vals.groups.map((gr, index) => (
                  <button key={index} type="button" className={gr.cls} aria-pressed={gr.on} onClick={gr.pick}>
                    {gr.label}
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
                      {g === 'gl'
                        ? 'Kính và râu là công tắc bật tắt; sửa được tên, giá, ảnh lớp và ẩn hiện.'
                        : 'Thêm, sửa, xóa hoặc ẩn lớp ảnh. Có thể giới hạn chỉ dùng cho một số loại hộp.'}
                    </span>
                  </div>
                  {vals.canAdd ? (
                    <button type="button" className="btn btn-ink" onClick={vals.addNew}>
                      <Icon name="plus" />
                      {g === 'box' ? 'Thêm loại hộp' : 'Thêm tùy chọn'}
                    </button>
                  ) : null}
                </div>
                <div className="scroll-x">
                  <table className="tbl" style={{ minWidth: '680px' }}>
                    <thead>
                      <tr>
                        <th>Hình</th>
                        <th>Tên tùy chọn</th>
                        <th>Dùng cho hộp</th>
                        <th>{g === 'box' ? 'Giá' : 'Phụ phí'}</th>
                        <th>Hiển thị</th>
                        <th>
                          <span className="sr">Thao tác</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vals.rows.map((r) => (
                        <tr key={r.id} style={css(r.rowStyle)}>
                          <td>
                            {r.preview ? <MiniChibi cfg={r.preview.m} crop={r.preview.crop} /> : null}
                            {!r.preview && r.swatch ? (
                              <span className="swatch" style={{ display: 'block', background: r.swatch }} />
                            ) : null}
                          </td>
                          <td>
                            <span style={{ fontWeight: '600' }}>{r.label}</span>
                            {r.layerUrl ? <div className="cap">Có ảnh lớp</div> : null}
                          </td>
                          <td>
                            <span className="tag t-sand">{r.boxesText}</span>
                          </td>
                          <td>{r.extra}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Toggle on={!r.hidden} label={(r.hidden ? 'Hiện ' : 'Ẩn ') + r.label} onClick={r.toggle} />
                              <span className="cap">{r.hidden ? 'Đang ẩn' : 'Đang hiện'}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                aria-label={`Sửa ${r.label}`}
                                onClick={r.edit}
                              >
                                <Icon name="pen" />
                              </button>
                              {g !== 'gl' ? (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-icon"
                                  aria-label={`Xóa ${r.label}`}
                                  onClick={r.remove}
                                >
                                  <Icon name="trash" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {e ? (
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
                      <h2 className="hh">{e.isNew ? 'Thêm vào: ' + vals.groupTitle : 'Sửa: ' + e.label}</h2>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        aria-label="Đóng"
                        onClick={() => setState({ edit: null })}
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
                        <input id="en" className="input" value={e.label} onChange={(ev) => setEdit({ label: ev.target.value })} />
                      </div>
                      <div className="field">
                        <label htmlFor="ep">{g === 'box' ? 'Giá nền (đồng)' : 'Phụ phí (đồng)'}</label>
                        <input
                          id="ep"
                          className="input"
                          inputMode="numeric"
                          value={e.price}
                          onChange={(ev) => setEdit({ price: digits(ev.target.value) })}
                        />
                      </div>
                      {isColor ? (
                        <div className="field">
                          <label htmlFor="ec">Màu</label>
                          <input
                            id="ec"
                            type="color"
                            className="input"
                            value={e.color || '#000000'}
                            disabled={!e.isNew}
                            onChange={(ev) => setEdit({ color: ev.target.value })}
                          />
                          {!e.isNew ? <span className="cap">Mã màu là mã của tùy chọn nên không đổi được; thêm màu mới nếu cần.</span> : null}
                        </div>
                      ) : null}
                      {g === 'box' ? (
                        <>
                          <div className="field">
                            <label htmlFor="ew">Màu nền sân khấu</label>
                            <input id="ew" type="color" className="input" value={e.wash || '#fbeab4'} onChange={(ev) => setEdit({ wash: ev.target.value })} />
                          </div>
                          <div className="field">
                            <label htmlFor="ed">Mô tả ngắn</label>
                            <input id="ed" className="input" value={e.description} onChange={(ev) => setEdit({ description: ev.target.value })} />
                          </div>
                        </>
                      ) : null}
                    </div>
                    {g !== 'box' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span className="flabel">Dùng cho loại hộp (không chọn là dùng cho tất cả)</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {config.boxes.map((b) => {
                            const on = !!e.boxes?.includes(b.code);
                            return (
                              <button
                                key={b.code}
                                type="button"
                                className={on ? 'chip on' : 'chip'}
                                aria-pressed={on}
                                onClick={() =>
                                  setEdit({ boxes: on ? e.boxes.filter((x) => x !== b.code) : [...(e.boxes || []), b.code] })
                                }
                              >
                                {b.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {PREVIEW[g] ? (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {e.layerUrl ? (
                          <img src={e.layerUrl} alt="Ảnh lớp" style={{ width: '72px', height: '94px', objectFit: 'contain', background: '#f6efe6', borderRadius: '12px' }} />
                        ) : null}
                        <label className="btn btn-line">
                          <Icon name="upload" />
                          {e.layerUrl ? 'Thay ảnh lớp' : 'Tải ảnh lớp'}
                          <input type="file" accept="image/png,image/webp" hidden onChange={uploadLayer} />
                        </label>
                        {e.layerUrl ? (
                          <button type="button" className="btn btn-ghost" onClick={() => setEdit({ layerKey: null, layerUrl: null })}>
                            Bỏ ảnh lớp
                          </button>
                        ) : null}
                        <span className="cap" style={{ flexBasis: '100%' }}>
                          PNG nền trong suốt, cùng khung 200 x 260 với hình nhân vật. Ảnh được chồng lên hình vẽ sẵn ở xem trước.
                        </span>
                      </div>
                    ) : null}
                    {feedback}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ink" onClick={saveEdit} disabled={st.busy}>
                        {st.busy ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                feedback
              )}
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
                      {pg.items.map((pi) => (
                        <div key={pi.id} className="field">
                          <label htmlFor={pi.id}>{pi.label}</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              id={pi.id}
                              className="input"
                              inputMode="numeric"
                              style={{ paddingRight: '44px' }}
                              value={pi.value}
                              onChange={pi.onChange}
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
                {feedback}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-ink" onClick={savePrices} disabled={st.busy}>
                    {st.busy ? 'Đang lưu...' : 'Lưu giá'}
                  </button>
                  <button type="button" className="btn btn-line" onClick={() => setState({ prices: {}, saved: '' })}>
                    Bỏ thay đổi chưa lưu
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
                {sample?.error ? <p className="bsm">{sample.error}</p> : null}
                {sample && !sample.error ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {sample.lines.map((s, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span className="bsm">{s.label}</span>
                          <span className="bsm" style={{ fontWeight: '500' }}>
                            {(s.extra ? '+' : '') + formatPrice(s.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <hr className="hr" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="flabel">Tạm tính</span>
                      <span className="hlg">{formatPrice(sample.total)}</span>
                    </div>
                  </>
                ) : null}
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
                <button
                  type="button"
                  className="btn btn-ink"
                  onClick={() =>
                    setState({
                      preset: { name: '', box: config.boxes[0]?.code, count: 1, chars: SAMPLE_CHARS.map((c) => ({ ...c })) },
                      error: '',
                      saved: '',
                    })
                  }
                >
                  <Icon name="plus" />
                  Thêm mẫu gợi ý
                </button>
              </div>
              {p ? (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderColor: '#2a1f2d' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <h2 className="hh">{p.id ? 'Sửa mẫu: ' + p.name : 'Mẫu gợi ý mới'}</h2>
                    <button type="button" className="btn btn-ghost btn-icon" aria-label="Đóng" onClick={() => setState({ preset: null })}>
                      <Icon name="x" />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '16px' }}>
                    <div className="field">
                      <label htmlFor="pn">Tên mẫu</label>
                      <input id="pn" className="input" value={p.name} onChange={(ev) => setPreset({ name: ev.target.value })} />
                    </div>
                    <div className="field">
                      <label htmlFor="pbx">Loại hộp</label>
                      <select id="pbx" className="input" value={p.box} onChange={(ev) => setPreset({ box: ev.target.value })}>
                        {config.boxes.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="pcn">Số nhân vật</label>
                      <select id="pcn" className="input" value={p.count} onChange={(ev) => setPreset({ count: Number(ev.target.value) })}>
                        <option value={1}>1 nhân vật</option>
                        <option value={2}>2 nhân vật</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {p.chars.slice(0, p.count).map((ch, i) => (
                      <div key={i} style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '64px' }}>
                            <Chibi {...ch} />
                          </div>
                          <span className="flabel">Nhân vật {i + 1}</span>
                        </div>
                        {presetSelects.map(([field, label, grp]) => (
                          <div key={field} className="field">
                            <label htmlFor={`ps-${i}-${field}`}>{label}</label>
                            <select
                              id={`ps-${i}-${field}`}
                              className="input"
                              value={String(ch[field])}
                              onChange={(ev) => setPresetChar(i, field, ev.target.value)}
                            >
                              {field === 'accessory' ? <option value="none">Không có</option> : null}
                              {config.groups[grp].map((o) => (
                                <option key={o.code} value={o.code}>
                                  {o.label}
                                  {o.hidden ? ' (đang ẩn)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {['glasses', 'beard'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              className={ch[t] ? 'chip on' : 'chip'}
                              aria-pressed={!!ch[t]}
                              onClick={() => setPresetChar(i, t, !ch[t])}
                            >
                              {config.groups.gl.find((o) => o.code === t)?.label || t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {feedback}
                  <div>
                    <button type="button" className="btn btn-ink" onClick={savePreset} disabled={st.busy || !p.name.trim()}>
                      {st.busy ? 'Đang lưu...' : 'Lưu mẫu'}
                    </button>
                  </div>
                </div>
              ) : (
                feedback
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(250px, 100%), 1fr))',
                  gap: '24px',
                }}
              >
                {vals.presets.map((pr) => (
                  <article
                    key={pr.id}
                    className="card"
                    style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: pr.hidden ? 0.6 : 1 }}
                  >
                    <div
                      style={{
                        background: pr.wash,
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
                        <Chibi {...pr.a} />
                      </div>
                      {pr.b ? (
                        <div style={{ width: '26%' }}>
                          <Chibi {...pr.b} />
                        </div>
                      ) : null}
                    </div>
                    <div style={{ paddingInline: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="bsm" style={{ fontWeight: '600' }}>
                        {pr.name}
                      </span>
                      <span className="cap">{pr.sub}</span>
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
                        <Toggle on={!pr.hidden} label={(pr.hidden ? 'Hiện ' : 'Ẩn ') + pr.name} onClick={pr.toggle} />
                        <span className="cap">{pr.hidden ? 'Đang ẩn' : 'Hiện cho khách'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" className="btn btn-ghost btn-icon" aria-label={'Sửa mẫu ' + pr.name} onClick={pr.edit}>
                          <Icon name="pen" />
                        </button>
                        <button type="button" className="btn btn-ghost btn-icon" aria-label={'Xóa mẫu ' + pr.name} onClick={pr.remove}>
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
