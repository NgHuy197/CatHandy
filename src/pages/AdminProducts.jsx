import { useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Chibi from '../components/Chibi';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import reveal from '../lib/reveal';
import { chibi, formatPrice } from '../lib/chibi';
import { api, upload, useApi } from '../lib/api';
import { CATEGORY_LABELS } from '../lib/products';

const MATERIALS = ['Gỗ', 'Mica', 'Khác'];
const errorBox = { background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' };

const emptyForm = {
  id: null,
  title: '',
  sub: '',
  description: '',
  price: '',
  category: 'go',
  material: 'Gỗ',
  ready: true,
  wash: '#fddede',
  boxCode: '',
  images: [],
  colors: [],
  sizes: [],
  chibiA: chibi({}),
  chibiB: null,
};

const toForm = (p) => ({
  id: p.id,
  title: p.title,
  sub: p.sub,
  description: p.description,
  price: String(p.price),
  category: p.category,
  material: p.material,
  ready: p.ready,
  wash: p.wash,
  boxCode: p.boxCode || '',
  images: p.images.map((key, i) => ({ key, url: p.imageUrls[i] })),
  colors: p.variants?.colors || [],
  sizes: (p.variants?.sizes || []).map((s) => ({ ...s, price: String(s.price) })),
  chibiA: p.chibiA,
  chibiB: p.chibiB,
});

const digits = (v) => String(v).replace(/\D/g, '');

export default function AdminProducts() {
  const detailRef = useRef(null);
  const list = useApi('/admin/products');
  const config = useApi('/admin/customizer');
  const [state, setState] = useMergedState({ form: emptyForm, busy: false, error: '', saved: '' });

  const st = state;
  const f = st.form;
  const setForm = (patch) => setState({ form: { ...f, ...patch }, saved: '' });
  const run = async (fn, saved = '') => {
    setState({ busy: true, error: '', saved: '' });
    try {
      await fn();
      setState({ busy: false, saved });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  const replaceRow = (row) => list.setData((rows) => rows.map((p) => (p.id === row.id ? row : p)));
  const tg = (on) => (on ? 'toggle on' : 'toggle');

  const vals = {
    rows: (list.data || []).map((p) =>
      Object.assign({}, p, {
        a: chibi(p.chibiA),
        cat: CATEGORY_LABELS[p.category],
        price: formatPrice(p.price),
        visible: !p.hidden,
        toggleCls: tg(!p.hidden),
        visibleText: p.hidden ? 'Đang ẩn' : 'Đang bán',
        toggleLabel: (p.hidden ? 'Hiện ' : 'Ẩn ') + p.title,
        toggle: () =>
          run(async () => replaceRow(await api('/admin/products/' + p.id, { method: 'PATCH', body: { hidden: !p.hidden } }))),
        edit: () => {
          setState({ form: toForm(p), error: '', saved: '' });
          reveal(detailRef.current);
        },
        remove: () => {
          if (!window.confirm(`Xóa "${p.title}"? Đơn cũ vẫn giữ thông tin sản phẩm.`)) return;
          run(async () => {
            await api('/admin/products/' + p.id, { method: 'DELETE' });
            list.setData((rows) => rows.filter((x) => x.id !== p.id));
            if (f.id === p.id) setState({ form: emptyForm });
          });
        },
        style: f.id === p.id ? 'background:#fdeeee' : p.hidden ? 'opacity:.6' : '',
      }),
    ),
    openNew: () => {
      setState({ form: emptyForm, error: '', saved: '' });
      reveal(detailRef.current);
    },
    formTitle: f.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới',
    formMode: f.id ? 'Đang sửa' : 'Mới',
    boxes: config.data?.boxes || [],
    presets: config.data?.presets || [],
    pickPreset: (e) => {
      const p = vals.presets.find((x) => String(x.id) === e.target.value);
      if (p) setForm({ chibiA: chibi(p.chars[0]), chibiB: p.count === 2 ? chibi(p.chars[1]) : null, boxCode: p.box });
    },
    addImages: (e) => {
      const files = [...(e.target.files || [])];
      e.target.value = '';
      if (!files.length) return;
      run(async () => {
        const added = [];
        for (const file of files) added.push(await upload('/admin/uploads', file));
        setState({ form: { ...f, images: [...f.images, ...added] } });
      });
    },
    removeImage: (key) => setForm({ images: f.images.filter((im) => im.key !== key) }),
    addColor: () => setForm({ colors: [...f.colors, { value: '#fd9999', label: '' }] }),
    addSize: () => setForm({ sizes: [...f.sizes, { code: 'c' + (f.sizes.length + 1), label: '', price: f.price }] }),
    setColor: (i, patch) => setForm({ colors: f.colors.map((c, j) => (j === i ? { ...c, ...patch } : c)) }),
    setSize: (i, patch) => setForm({ sizes: f.sizes.map((s, j) => (j === i ? { ...s, ...patch } : s)) }),
    dropColor: (i) => setForm({ colors: f.colors.filter((_, j) => j !== i) }),
    dropSize: (i) => setForm({ sizes: f.sizes.filter((_, j) => j !== i) }),
    save: (e) => {
      e.preventDefault();
      const body = {
        title: f.title,
        sub: f.sub,
        description: f.description,
        price: Number(digits(f.price)),
        category: f.category,
        material: f.material,
        ready: f.ready,
        wash: f.wash,
        boxCode: f.boxCode || null,
        images: f.images.map((im) => im.key),
        variants: {
          colors: f.colors.filter((c) => c.label.trim()),
          sizes: f.sizes.filter((s) => s.label.trim()).map((s) => ({ ...s, price: Number(digits(s.price)) })),
        },
        chibiA: f.chibiA,
        chibiB: f.chibiB,
      };
      run(async () => {
        const row = await api(f.id ? '/admin/products/' + f.id : '/admin/products', {
          method: f.id ? 'PATCH' : 'POST',
          body,
        });
        if (f.id) replaceRow(row);
        else list.setData((rows) => [...rows, row]);
        setState({ form: toForm(row) });
      }, 'Đã lưu sản phẩm');
    },
  };

  return (
    <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div className="admin-side">
        <AdminSidebar active="prod" />
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
              Sản phẩm có sẵn
            </h1>
            <p className="bsm mut">Quản lý các set quà làm sẵn: ảnh, mô tả và giá.</p>
          </div>
          <button type="button" className="btn btn-ink btn-lg" onClick={vals.openNew}>
            <Icon name="plus" />
            Thêm sản phẩm
          </button>
        </div>
        {list.error ? (
          <p className="bsm" role="alert" style={errorBox}>
            {list.error.message}
          </p>
        ) : null}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <section
            className="card"
            style={{ flex: '999 1 520px', minWidth: '0', padding: '0', overflow: 'hidden' }}
          >
            <div className="scroll-x">
              <table className="tbl" style={{ minWidth: '620px' }}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Loại</th>
                    <th>Giá</th>
                    <th>Hiển thị</th>
                    <th>
                      <span className="sr">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vals.rows.map((r) => (
                    <tr key={r.id} style={css(r.style)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '12px',
                              background: r.wash,
                              overflow: 'hidden',
                              position: 'relative',
                              flex: 'none',
                            }}
                          >
                            {r.imageUrls[0] && !/\.mp4$/i.test(r.imageUrls[0]) ? (
                              <img src={r.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ position: 'absolute', width: '64px', left: '-4px', top: '-2px' }}>
                                <Chibi {...r.a} />
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600' }}>{r.title}</span>
                            <span className="cap">
                              {r.sub}
                              {r.ready ? '' : ', đặt làm'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tag t-sand">{r.cat}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{r.price}</td>
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
                            aria-label={`Sửa ${r.title}`}
                            onClick={r.edit}
                          >
                            <Icon name="pen" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            aria-label={`Xóa ${r.title}`}
                            onClick={r.remove}
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
          </section>
          <form
            ref={detailRef}
            className="card detail-anchor"
            onSubmit={vals.save}
            style={{
              flex: '1 1 340px',
              maxWidth: '440px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
            >
              <h2 className="hh">{vals.formTitle}</h2>
              <span className="tag t-sand">{vals.formMode}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '16px',
                  background: f.wash,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '2%',
                  paddingBottom: '6px',
                  flex: 'none',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '42%' }}>
                  <Chibi {...chibi(f.chibiA)} />
                </div>
                {f.chibiB ? (
                  <div style={{ width: '42%' }}>
                    <Chibi {...chibi(f.chibiB)} />
                  </div>
                ) : null}
              </div>
              <div className="field" style={{ flex: '1', minWidth: '0' }}>
                <label htmlFor="pk">Hình nhân vật trên thẻ</label>
                <select id="pk" className="input" value="" onChange={vals.pickPreset}>
                  <option value="">Lấy từ mẫu gợi ý...</option>
                  {vals.presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="pt">Tên sản phẩm</label>
              <input
                id="pt"
                className="input"
                required
                value={f.title}
                onChange={(e) => setForm({ title: e.target.value })}
                placeholder="Ví dụ: Cặp đôi áo dài"
              />
            </div>
            <div className="field">
              <label htmlFor="ps">Mô tả ngắn</label>
              <input
                id="ps"
                className="input"
                value={f.sub}
                onChange={(e) => setForm({ sub: e.target.value })}
                placeholder="Loại hộp, số nhân vật"
              />
            </div>
            <div className="field">
              <label htmlFor="pd">Mô tả chi tiết</label>
              <textarea
                id="pd"
                className="input"
                rows="3"
                value={f.description}
                onChange={(e) => setForm({ description: e.target.value })}
                placeholder="Chất liệu, kích thước, điểm nổi bật"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label htmlFor="pp">Giá (đồng)</label>
                <input
                  id="pp"
                  className="input"
                  inputMode="numeric"
                  required
                  value={f.price}
                  onChange={(e) => setForm({ price: digits(e.target.value) })}
                />
              </div>
              <div className="field">
                <label htmlFor="pc">Loại</label>
                <select id="pc" className="input" value={f.category} onChange={(e) => setForm({ category: e.target.value })}>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="pm">Chất liệu</label>
                <select id="pm" className="input" value={f.material} onChange={(e) => setForm({ material: e.target.value })}>
                  {MATERIALS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="pr">Tình trạng</label>
                <select
                  id="pr"
                  className="input"
                  value={f.ready ? 'ready' : 'custom'}
                  onChange={(e) => setForm({ ready: e.target.value === 'ready' })}
                >
                  <option value="ready">Có sẵn</option>
                  <option value="custom">Đặt làm</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="pb">Hộp cho nút "Tự tay tạo chibi"</label>
                <select id="pb" className="input" value={f.boxCode} onChange={(e) => setForm({ boxCode: e.target.value })}>
                  <option value="">Không có</option>
                  {vals.boxes.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="pw">Màu nền thẻ</label>
                <input id="pw" type="color" className="input" value={f.wash} onChange={(e) => setForm({ wash: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="flabel">Màu (khách chọn, đổi màu trang phục nhân vật 1)</span>
              {f.colors.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    aria-label="Mã màu"
                    className="input"
                    style={{ width: '56px', padding: '4px' }}
                    value={c.value}
                    onChange={(e) => vals.setColor(i, { value: e.target.value })}
                  />
                  <input
                    className="input"
                    aria-label="Tên màu"
                    placeholder="Tên màu, ví dụ Đỏ"
                    value={c.label}
                    onChange={(e) => vals.setColor(i, { label: e.target.value })}
                  />
                  <button type="button" className="btn btn-ghost btn-icon" aria-label="Bỏ màu này" onClick={() => vals.dropColor(i)}>
                    <Icon name="x" />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-line" style={{ alignSelf: 'flex-start' }} onClick={vals.addColor}>
                <Icon name="plus" />
                Thêm màu
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="flabel">Kích thước (mỗi cỡ một giá)</span>
              {f.sizes.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    className="input"
                    aria-label="Tên cỡ"
                    placeholder="Tên cỡ, ví dụ Vừa"
                    value={s.label}
                    onChange={(e) => vals.setSize(i, { label: e.target.value })}
                  />
                  <input
                    className="input"
                    aria-label="Giá cỡ này"
                    inputMode="numeric"
                    style={{ width: '120px' }}
                    value={s.price}
                    onChange={(e) => vals.setSize(i, { price: digits(e.target.value) })}
                  />
                  <button type="button" className="btn btn-ghost btn-icon" aria-label="Bỏ cỡ này" onClick={() => vals.dropSize(i)}>
                    <Icon name="x" />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-line" style={{ alignSelf: 'flex-start' }} onClick={vals.addSize}>
                <Icon name="plus" />
                Thêm cỡ
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="flabel">Ảnh và video sản phẩm</span>
              {f.images.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                  {f.images.map((im) => (
                    <div key={im.key} style={{ position: 'relative' }}>
                      {/\.mp4$/i.test(im.key) ? (
                        <video src={im.url} muted style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                      ) : (
                        <img src={im.url} alt="" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                      )}
                      <button
                        type="button"
                        className="btn btn-line btn-icon"
                        aria-label="Bỏ ảnh"
                        onClick={() => vals.removeImage(im.key)}
                        style={{ position: 'absolute', top: '4px', right: '4px', width: '32px', height: '32px', minHeight: '32px', background: '#ffffff' }}
                      >
                        <Icon name="x" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <label
                className="ph"
                style={{
                  minHeight: '120px',
                  borderRadius: '16px',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'center',
                  padding: '16px',
                  cursor: 'pointer',
                }}
              >
                <Icon name="upload" className="ic ic-24" />
                <span className="bsm">Chọn ảnh (JPG, PNG, WebP) hoặc video MP4 từ máy</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" multiple hidden onChange={vals.addImages} />
              </label>
            </div>
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
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-ink" disabled={st.busy}>
                {st.busy ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </button>
              <button type="button" className="btn btn-line" onClick={vals.openNew}>
                Làm mới
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
