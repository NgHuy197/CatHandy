import { useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Chibi from '../components/Chibi';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import reveal from '../lib/reveal';
import { chibi, formatPrice } from '../lib/chibi';

export default function AdminProducts() {
  const detailRef = useRef(null);
  const [state, setState] = useMergedState({
    sel: 'p1',
    hidden: {},
    isNew: false,
    fTitle: 'Cặp đôi áo dài',
    fSub: 'Hộp gỗ chibi, 2 nhân vật',
    fPrice: '389000',
  });

  const st = state;
  const P = [
    {
      id: 'p1',
      title: 'Cặp đôi áo dài',
      sub: 'Hộp gỗ chibi, 2 nhân vật',
      cat: 'Hộp gỗ chibi',
      price: 389000,
      wash: '#fddede',
      a: chibi({ hair: 'long', outfitColor: '#c9484f' }),
    },
    {
      id: 'p2',
      title: 'Chibi vest xanh',
      sub: 'Hộp mica chibi, 1 nhân vật',
      cat: 'Quà tặng cho nam',
      price: 289000,
      wash: '#d6ebfa',
      a: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', glasses: true }),
    },
    {
      id: 'p3',
      title: 'Bé hoa tặng mẹ',
      sub: 'Hộp gỗ chibi, 1 nhân vật',
      cat: 'Hộp gỗ chibi',
      price: 259000,
      wash: '#e8e0f8',
      a: chibi({ hair: 'bun', outfit: 'shirt', outfitColor: '#cbbdf0', accessory: 'bouquet' }),
    },
    {
      id: 'p4',
      title: 'Bộ cô dâu chú rể mini',
      sub: 'Quà cưới, 2 nhân vật',
      cat: 'Quà cưới cao cấp',
      price: 549000,
      wash: '#fbeab4',
      a: chibi({ hair: 'long', outfit: 'wedding', outfitColor: '#fffaf0' }),
    },
    {
      id: 'p5',
      title: 'Hoa cài tóc chibi',
      sub: 'Phụ kiện quà tặng',
      cat: 'Phụ kiện quà tặng',
      price: 59000,
      wash: '#fbeab4',
      a: chibi({ hair: 'long', hairColor: '#5a3a2a', outfit: 'shirt', accessory: 'flower' }),
    },
  ];
  const tg = (on) => (on ? 'toggle on' : 'toggle');
  const load = (p) => {
    setState({ sel: p.id, isNew: false, fTitle: p.title, fSub: p.sub, fPrice: String(p.price) });
    reveal(detailRef.current);
  };
  const vals = {
    rows: P.map((p) => {
      const hidden = !!st.hidden[p.id];
      return Object.assign({}, p, {
        price: formatPrice(p.price),
        visible: !hidden,
        toggleCls: tg(!hidden),
        visibleText: hidden ? 'Đang ẩn' : 'Đang bán',
        toggleLabel: (hidden ? 'Hiện ' : 'Ẩn ') + p.title,
        toggle: () => setState({ hidden: Object.assign({}, st.hidden, { [p.id]: !hidden }) }),
        edit: () => load(p),
        style: !st.isNew && st.sel === p.id ? 'background:#fdeeee' : hidden ? 'opacity:.6' : '',
      });
    }),
    openNew: () => {
      setState({ isNew: true, sel: null, fTitle: '', fSub: '', fPrice: '' });
      reveal(detailRef.current);
    },
    formTitle: st.isNew ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm',
    formMode: st.isNew ? 'Mới' : 'Đang sửa',
    fTitle: st.fTitle,
    fSub: st.fSub,
    fPrice: st.fPrice,
    onTitle: (e) => setState({ fTitle: e.target.value }),
    onSub: (e) => setState({ fSub: e.target.value }),
    onPrice: (e) => setState({ fPrice: e.target.value }),
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
                  {vals.rows.map((r, index) => (
                    <tr key={index} style={css(r.style)}>
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
                            <div style={{ position: 'absolute', width: '64px', left: '-4px', top: '-2px' }}>
                              <Chibi {...r.a} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600' }}>{r.title}</span>
                            <span className="cap">{r.sub}</span>
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
          <aside
            ref={detailRef}
            className="card detail-anchor"
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
            <div className="field">
              <label htmlFor="pt">Tên sản phẩm</label>
              <input
                id="pt"
                className="input"
                value={vals.fTitle}
                onChange={vals.onTitle}
                placeholder="Ví dụ: Cặp đôi áo dài"
              />
            </div>
            <div className="field">
              <label htmlFor="ps">Mô tả ngắn</label>
              <textarea
                id="ps"
                className="input"
                rows="3"
                value={vals.fSub}
                onChange={vals.onSub}
                placeholder="Loại hộp, số nhân vật, điểm nổi bật"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label htmlFor="pp">Giá (đồng)</label>
                <input
                  id="pp"
                  className="input"
                  inputMode="numeric"
                  value={vals.fPrice}
                  onChange={vals.onPrice}
                />
              </div>
              <div className="field">
                <label htmlFor="pc">Loại</label>
                <select id="pc" className="input">
                  <option>Hộp gỗ chibi</option>
                  <option>Hộp mica chibi</option>
                  <option>Quà cưới cao cấp</option>
                  <option>Quà tặng cho nam</option>
                  <option>Phụ kiện quà tặng</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="flabel">Ảnh và video sản phẩm</span>
              <div
                className="ph"
                style={{
                  minHeight: '120px',
                  borderRadius: '16px',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <Icon name="upload" className="ic ic-24" />
                <span className="bsm">Kéo ảnh vào đây hoặc chọn từ máy</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ink">
                Lưu sản phẩm
              </button>
              <button type="button" className="btn btn-line" onClick={vals.openNew}>
                Làm mới
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
