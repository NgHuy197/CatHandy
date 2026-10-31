import { useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Chibi from '../components/Chibi';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import reveal from '../lib/reveal';
import { chibi } from '../lib/chibi';

export default function AdminOrders() {
  const detailRef = useRef(null);
  const [state, setState] = useMergedState({
    sel: 'CH-0003',
    filter: 'all',
    status: { 'CH-0003': 0, 'CH-0002': 2, 'CH-0001': 4 },
    notes: {
      'CH-0003': [],
      'CH-0002': [{ text: 'Khách thích màu xanh nhạt hơn mẫu, đã nhắn lại.', when: '[giờ]' }],
      'CH-0001': [],
    },
    draft: '',
    saved: false,
  });

  const st = state;
  const STATUS = [
    'Mới, chưa xem',
    'Đang chuẩn bị nguyên liệu',
    'Đang làm đồ',
    'Đã hoàn thiện, gửi ảnh duyệt',
    'Chờ khách duyệt',
    'Chỉnh sửa theo yêu cầu',
    'Đã giao bên vận chuyển',
  ];
  const TAG = ['tag t-danger', 'tag t-sand', 'tag t-butter', 'tag t-lav', 'tag t-powder', 'tag', 'tag t-ok'];
  const SHORT = ['Mới', 'Chuẩn bị', 'Đang làm đồ', 'Đã hoàn thiện', 'Chờ duyệt', 'Chỉnh sửa', 'Đã giao VC'];
  const GROUP = ['new', 'craft', 'craft', 'craft', 'wait', 'craft', 'done'];
  const WASH = ['#fddede', '#d3efe9', '#fbeab4'];
  const base = [
    {
      id: 'CH-0003',
      customer: 'Khách A',
      time: 'Hôm nay, [giờ]',
      boxLabel: 'Hộp gỗ chibi',
      total: '474.000đ',
      a: chibi({ hair: 'long', outfitColor: '#c9484f', accessory: 'bouquet' }),
      b: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', face: 'wink' }),
      wash: WASH[0],
      rows: [
        { k: 'Sản phẩm', v: 'Hộp gỗ chibi, 2 nhân vật' },
        { k: 'Nhân vật 1', v: 'Tóc dài đen, cười nhẹ, áo dài đỏ, bó hoa' },
        { k: 'Nhân vật 2', v: 'Tóc ngắn đen, nháy mắt, vest xanh navy' },
        { k: 'Ghi chú khách', v: '[ghi chú của khách]' },
      ],
    },
    {
      id: 'CH-0002',
      customer: 'Khách B',
      time: 'Hôm qua, [giờ]',
      boxLabel: 'Hộp mica chibi',
      total: '369.000đ',
      a: chibi({ hair: 'bob', outfitColor: '#9ccbee' }),
      wash: WASH[1],
      rows: [
        { k: 'Sản phẩm', v: 'Hộp mica chibi, 1 nhân vật' },
        { k: 'Nhân vật', v: 'Tóc bob đen, cười nhẹ, áo dài xanh nhạt' },
        { k: 'Ghi chú khách', v: '[ghi chú của khách]' },
      ],
    },
    {
      id: 'CH-0001',
      customer: 'Khách C',
      time: '[ngày đặt]',
      boxLabel: 'Hộp gỗ chibi',
      total: '763.000đ',
      a: chibi({ hair: 'long', outfitColor: '#c9484f', accessory: 'bouquet' }),
      b: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', face: 'wink' }),
      wash: WASH[2],
      rows: [
        { k: 'Sản phẩm', v: 'Hộp gỗ chibi, 2 nhân vật, kèm Chibi vest xanh (có sẵn)' },
        { k: 'Nhân vật 1', v: 'Tóc dài đen, áo dài đỏ, bó hoa' },
        { k: 'Nhân vật 2', v: 'Tóc ngắn đen, vest xanh navy' },
        { k: 'Ghi chú khách', v: '[ghi chú của khách]' },
      ],
    },
  ].map((o) => Object.assign({}, o, { hasB: !!o.b, idx: st.status[o.id] }));
  const withS = base.map((o) => Object.assign({}, o, { statusLabel: SHORT[o.idx], tagCls: TAG[o.idx] }));
  const FIL = [
    ['all', 'Tất cả'],
    ['new', 'Mới'],
    ['craft', 'Đang chế tác'],
    ['wait', 'Chờ duyệt'],
    ['done', 'Đã giao VC'],
  ];
  const shown = withS.filter((o) => st.filter === 'all' || GROUP[o.idx] === st.filter);
  const cur = withS.filter((o) => o.id === st.sel)[0] || withS[0];
  const setStatus = (n) => setState({ status: Object.assign({}, st.status, { [cur.id]: n }), saved: true });
  const vals = {
    filters: FIL.map((f) => ({
      label: f[1],
      on: st.filter === f[0],
      cls: st.filter === f[0] ? 'chip on' : 'chip',
      pick: () => setState({ filter: f[0] }),
    })),
    list: shown.map((o) => ({
      id: o.id,
      customer: o.customer,
      boxLabel: o.boxLabel,
      total: o.total,
      time: o.time,
      statusLabel: o.statusLabel,
      tagCls: o.tagCls,
      pick: () => {
        setState({ sel: o.id, saved: false });
        reveal(detailRef.current);
      },
      style:
        'display:flex;flex-direction:column;gap:6px;align-items:flex-start;text-align:left;width:100%;padding:16px;border-radius:20px;cursor:pointer;font-family:"Be Vietnam Pro",sans-serif;color:#2a1f2d;border:1px solid ' +
        (o.id === cur.id ? '#2a1f2d' : '#e3d8ca') +
        ';background:' +
        (o.id === cur.id ? '#fdeeee' : '#ffffff'),
    })),
    cur,
    statusOpts: STATUS.map((label, i) => ({
      label,
      on: cur.idx === i,
      cls: cur.idx === i ? 'chip on' : 'chip',
      pick: () => setStatus(i),
    })),
    needPhoto: cur.idx === 3,
    sendPhoto: () => setStatus(4),
    saved: st.saved,
    notes: st.notes[cur.id] || [],
    draft: st.draft,
    onDraft: (e) => setState({ draft: e.target.value }),
    addNote: () => {
      if (!st.draft.trim()) return;
      setState({
        notes: Object.assign({}, st.notes, {
          [cur.id]: (st.notes[cur.id] || []).concat([{ text: st.draft.trim(), when: 'Vừa xong' }]),
        }),
        draft: '',
      });
    },
  };

  return (
    <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div className="admin-side">
        <AdminSidebar active="orders" />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="lbl">Quản trị</span>
          <h1 className="hlg" style={{ fontSize: '40px', lineHeight: '46px' }}>
            Đơn hàng và quy trình chế tác
          </h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <section
            className="stack-full"
            style={{
              flex: '1 1 300px',
              maxWidth: '380px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {vals.filters.map((f, index) => (
                <button key={index} type="button" className={f.cls} aria-pressed={f.on} onClick={f.pick}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vals.list.map((o, index) => (
                <button key={index} type="button" onClick={o.pick} style={css(o.style)}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <span className="hh" style={{ fontSize: '20px', lineHeight: '24px' }}>
                      {o.id}
                    </span>
                    <span className={o.tagCls}>{o.statusLabel}</span>
                  </div>
                  <span className="bsm" style={{ textAlign: 'left' }}>
                    {o.customer}, {o.boxLabel}
                  </span>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', width: '100%' }}
                  >
                    <span className="cap">{o.time}</span>
                    <span className="bsm" style={{ fontWeight: '600' }}>
                      {o.total}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <section
            ref={detailRef}
            className="detail-anchor"
            style={{
              flex: '999 1 420px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 className="hlg">{vals.cur.id}</h2>
                  <span className={vals.cur.tagCls}>{vals.cur.statusLabel}</span>
                </div>
                <span className="cap">{vals.cur.time}</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="cap">Khách</span>
                  <span className="bsm" style={{ fontWeight: '600' }}>
                    {vals.cur.customer}
                  </span>
                  <span className="bsm mut">[SĐT khách]</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="cap">Địa chỉ nhận hàng</span>
                  <span className="bsm">[Địa chỉ nhận hàng]</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href="#" className="btn btn-ink">
                  Chat Zalo với khách
                </a>
                <a href="#" className="btn btn-line">
                  Gọi điện
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
              <div
                className="card"
                style={{
                  flex: '1 1 320px',
                  minWidth: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <h3 className="hh">Cấu hình khách chọn</h3>
                  <button type="button" className="btn btn-line">
                    <Icon name="download" />
                    Tải ảnh xem trước
                  </button>
                </div>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    aspectRatio: '4 / 3',
                    background: vals.cur.wash,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '2%',
                    paddingBottom: '8%',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '10%',
                      right: '10%',
                      bottom: '8%',
                      height: '36%',
                      borderRadius: '16px',
                      background: 'rgba(214,160,87,0.28)',
                      border: '5px solid rgba(214,160,87,0.55)',
                    }}
                  />
                  <div style={{ width: '24%', position: 'relative' }}>
                    <Chibi {...vals.cur.a} />
                  </div>
                  {vals.cur.hasB ? (
                    <>
                      <div style={{ width: '24%', position: 'relative' }}>
                        <Chibi {...vals.cur.b} />
                      </div>
                    </>
                  ) : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {vals.cur.rows.map((r, index) => (
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
                      <span className="bsm mut">{r.k}</span>
                      <span className="bsm" style={{ fontWeight: '500', textAlign: 'right' }}>
                        {r.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  flex: '1 1 320px',
                  minWidth: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h3 className="hh">Tiến độ chế tác</h3>
                    <span className="cap">Cập nhật thủ công, khách thấy ở trang tra cứu đơn.</span>
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    role="group"
                    aria-label="Trạng thái chế tác"
                  >
                    {vals.statusOpts.map((s, index) => (
                      <button
                        key={index}
                        type="button"
                        className={s.cls}
                        aria-pressed={s.on}
                        onClick={s.pick}
                        style={{ justifyContent: 'space-between', width: '100%' }}
                      >
                        <span>{s.label}</span>
                        {s.on ? (
                          <>
                            <Icon
                              name="check"
                              style={{ width: '16px', height: '16px', strokeWidth: '2.4' }}
                            />
                          </>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  {vals.needPhoto ? (
                    <>
                      <div
                        style={{
                          background: '#fbeab4',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <span className="bsm" style={{ fontWeight: '600' }}>
                          Gửi ảnh sản phẩm hoàn thiện để khách duyệt
                        </span>
                        <div
                          className="ph"
                          style={{
                            minHeight: '96px',
                            borderRadius: '12px',
                            flexDirection: 'column',
                            gap: '6px',
                            textAlign: 'center',
                            padding: '12px',
                          }}
                        >
                          <Icon name="upload" className="ic ic-24" />
                          <span className="bsm">Kéo ảnh vào đây hoặc chọn từ máy</span>
                        </div>
                        <button type="button" className="btn btn-ink" onClick={vals.sendPhoto}>
                          Gửi ảnh cho khách duyệt
                        </button>
                      </div>
                    </>
                  ) : null}
                  {vals.saved ? (
                    <>
                      <div
                        role="status"
                        className="tag t-ok"
                        style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '14px', gap: '8px' }}
                      >
                        <Icon name="check" />
                        Đã cập nhật tiến độ
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <h3 className="hh">Ghi chú nội bộ</h3>
                    <span className="tag t-sand">Chỉ shop thấy</span>
                  </div>
                  {vals.notes.map((n, index) => (
                    <div
                      key={index}
                      style={{ background: '#f6efe6', borderRadius: '12px', padding: '12px 16px' }}
                    >
                      <div className="bsm">{n.text}</div>
                      <div className="cap">{n.when}</div>
                    </div>
                  ))}
                  <div className="field">
                    <label htmlFor="nn">Thêm ghi chú</label>
                    <textarea
                      id="nn"
                      className="input"
                      rows="2"
                      placeholder="Ví dụ: đã báo giá qua Zalo, chờ khách chốt"
                      value={vals.draft}
                      onChange={vals.onDraft}
                    />
                  </div>
                  <div>
                    <button type="button" className="btn btn-line" onClick={vals.addNote}>
                      Lưu ghi chú
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
