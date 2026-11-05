import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Chibi from '../components/Chibi';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import reveal from '../lib/reveal';
import { api, upload, useApi } from '../lib/api';
import { refreshUnseen } from '../lib/adminAlerts';
import { downloadPreview } from '../lib/preview';
import { formatPrice } from '../lib/chibi';
import { formatDateTime } from '../../shared/format';
import { ORDER_STATUSES, statusInfo } from '../../shared/orders';

const WASH = ['#fddede', '#d3efe9', '#fbeab4', '#e8e0f8'];
const errorBox = { background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' };

export default function AdminOrders() {
  const detailRef = useRef(null);
  const previewRefs = useRef([]);
  const [params, setParams] = useSearchParams();
  const [state, setState] = useMergedState({
    filter: 'all',
    q: '',
    draft: '',
    saved: '',
    error: '',
    busy: false,
  });
  const st = state;
  const list = useApi('/admin/orders?group=' + st.filter + (st.q.trim() ? '&q=' + encodeURIComponent(st.q.trim()) : ''));
  // ?ma= comes from the Telegram alert link and the customer page.
  const sel = params.get('ma') || list.data?.[0]?.code || null;
  const detail = useApi(sel ? '/admin/orders/' + sel : null);
  const cur = detail.data && detail.data.code === sel ? detail.data : null;

  // Opening an order marks it seen on the server; reflect that in the list and the sidebar badge.
  useEffect(() => {
    if (!cur) return;
    list.setData((rows) => rows?.map((o) => (o.code === cur.code ? { ...o, seenAt: cur.seenAt } : o)));
    refreshUnseen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur?.code]);

  const patchCur = (patch) => {
    detail.setData((d) => ({ ...d, ...patch }));
    if (patch.status) list.setData((rows) => rows?.map((o) => (o.code === cur.code ? { ...o, status: patch.status } : o)));
  };
  const run = async (fn, saved = '') => {
    setState({ busy: true, error: '', saved: '' });
    try {
      await fn();
      setState({ busy: false, saved });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  const setStatus = (status) =>
    run(async () => {
      await api('/admin/orders/' + cur.code, { method: 'PATCH', body: { status } });
      patchCur({ status });
    }, 'Đã cập nhật tiến độ');

  const FIL = [
    ['all', 'Tất cả'],
    ['new', 'Mới'],
    ['craft', 'Đang chế tác'],
    ['wait', 'Chờ duyệt'],
    ['done', 'Đã giao VC'],
  ];
  const info = cur ? statusInfo(cur.status) : null;
  const vals = {
    filters: FIL.map((f) => ({
      label: f[1],
      on: st.filter === f[0],
      cls: st.filter === f[0] ? 'chip on' : 'chip',
      pick: () => setState({ filter: f[0] }),
    })),
    list: (list.data || []).map((o) => {
      const s = statusInfo(o.status);
      const on = o.code === sel;
      return {
        id: o.code,
        unseen: !o.seenAt,
        customer: o.customerName,
        boxLabel: o.items.map((it) => it.title).join(', '),
        total: formatPrice(o.total),
        time: formatDateTime(o.createdAt),
        statusLabel: s.short,
        tagCls: s.tag,
        pick: () => {
          setParams({ ma: o.code }, { replace: true });
          setState({ saved: '', error: '', draft: '' });
          reveal(detailRef.current);
        },
        style:
          'display:flex;flex-direction:column;gap:6px;align-items:flex-start;text-align:left;width:100%;padding:16px;border-radius:20px;cursor:pointer;font-family:"Be Vietnam Pro",sans-serif;color:#2a1f2d;border:' +
          (on ? '1px solid #2a1f2d' : !o.seenAt ? '2px solid #b0343f' : '1px solid #e3d8ca') +
          ';background:' +
          (on ? '#fdeeee' : '#ffffff'),
      };
    }),
    statusOpts: ORDER_STATUSES.map((s) => ({
      label: s.label,
      on: cur?.status === s.code,
      cls: cur?.status === s.code ? 'chip on' : 'chip',
      pick: () => setStatus(s.code),
    })),
    showPhotos: cur && ['finished', 'awaiting', 'revision', 'approved', 'shipped'].includes(cur.status),
    canSend: cur && ['finished', 'revision'].includes(cur.status),
    sendPhoto: () => setStatus('awaiting'),
    addPhotos: (e) => {
      const files = [...(e.target.files || [])];
      e.target.value = '';
      if (!files.length) return;
      run(async () => {
        for (const f of files) {
          const photo = await upload('/admin/orders/' + cur.code + '/photos', f);
          detail.setData((d) => ({ ...d, photos: [...d.photos, photo] }));
        }
      });
    },
    removePhoto: (id) =>
      run(async () => {
        await api('/admin/orders/' + cur.code + '/photos/' + id, { method: 'DELETE' });
        detail.setData((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));
      }),
    draft: st.draft,
    onDraft: (e) => setState({ draft: e.target.value }),
    addNote: () => {
      if (!st.draft.trim()) return;
      run(async () => {
        const note = await api('/admin/orders/' + cur.code + '/notes', { method: 'POST', body: { body: st.draft } });
        detail.setData((d) => ({ ...d, notes: [...d.notes, note] }));
        setState({ draft: '' });
      });
    },
    download: (i) =>
      previewRefs.current[i] &&
      downloadPreview(previewRefs.current[i], `${cur.code}-${i + 1}.png`, WASH[i % WASH.length]),
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
            <input
              className="input"
              type="search"
              aria-label="Tìm theo mã đơn, tên hoặc số điện thoại"
              placeholder="Tìm mã đơn, tên, SĐT"
              value={st.q}
              onChange={(e) => setState({ q: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {vals.filters.map((f, index) => (
                <button key={index} type="button" className={f.cls} aria-pressed={f.on} onClick={f.pick}>
                  {f.label}
                </button>
              ))}
            </div>
            {list.error ? (
              <p className="bsm" role="alert" style={errorBox}>
                {list.error.message}
              </p>
            ) : null}
            {list.data && !vals.list.length ? <p className="bsm mut">Không có đơn nào.</p> : null}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vals.list.map((o) => (
                <button key={o.id} type="button" onClick={o.pick} style={css(o.style)}>
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
                  {o.unseen ? (
                    <span className="tag t-danger" style={{ fontSize: '12px' }}>
                      Chưa xem
                    </span>
                  ) : null}
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
            {!cur ? (
              <p className="bsm mut" role={detail.error ? 'alert' : 'status'}>
                {detail.error ? detail.error.message : sel ? 'Đang tải đơn...' : 'Chọn một đơn để xem chi tiết.'}
              </p>
            ) : (
              <>
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
                      <h2 className="hlg">{cur.code}</h2>
                      <span className={info.tag}>{info.short}</span>
                    </div>
                    <span className="cap">{formatDateTime(cur.createdAt)}</span>
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
                        {cur.customerName}
                      </span>
                      <span className="bsm mut">{cur.phone}</span>
                      <span className="cap">{cur.userEmail ? 'Tài khoản ' + cur.userEmail : 'Mua nhanh, không tài khoản'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="cap">Địa chỉ nhận hàng</span>
                      <span className="bsm">{cur.address}</span>
                    </div>
                    {cur.note ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="cap">Ghi chú của khách</span>
                        <span className="bsm">{cur.note}</span>
                      </div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a href={'https://zalo.me/' + cur.phone.replace(/^\+84/, '0')} target="_blank" rel="noreferrer" className="btn btn-ink">
                      Chat Zalo với khách
                    </a>
                    <a href={'tel:' + cur.phone} className="btn btn-line">
                      Gọi điện
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      flex: '1 1 320px',
                      minWidth: '0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                    }}
                  >
                    {cur.items.map((it, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
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
                          <h3 className="hh">{it.isCustom ? 'Cấu hình khách chọn' : 'Sản phẩm có sẵn'}</h3>
                          <button type="button" className="btn btn-line" onClick={() => vals.download(i)}>
                            <Icon name="download" />
                            Tải ảnh xem trước
                          </button>
                        </div>
                        <div
                          ref={(el) => {
                            previewRefs.current[i] = el;
                          }}
                          style={{
                            position: 'relative',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            aspectRatio: '4 / 3',
                            background: WASH[i % WASH.length],
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
                          {it.design?.a ? (
                            <div style={{ width: '24%', position: 'relative' }}>
                              <Chibi {...it.design.a} />
                            </div>
                          ) : null}
                          {it.design?.b ? (
                            <div style={{ width: '24%', position: 'relative' }}>
                              <Chibi {...it.design.b} />
                            </div>
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { k: 'Sản phẩm', v: [it.title, it.sub, it.variant].filter(Boolean).join(', ') },
                            { k: 'Số lượng', v: `${it.qty} x ${formatPrice(it.unitPrice)}` },
                            ...(it.isCustom ? it.design.lines.map((l) => {
                              const [k, ...rest] = l.split(': ');
                              return rest.length ? { k, v: rest.join(': ') } : { k: 'Nhân vật', v: l };
                            }) : []),
                            ...(it.isCustom ? [{ k: 'Ghi chú thiết kế', v: it.design.note || 'Không có' }] : []),
                          ].map((r, index) => (
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
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingInline: '8px' }}>
                      <span className="flabel">Tổng đơn</span>
                      <span className="hh">{formatPrice(cur.total)}</span>
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
                            disabled={st.busy}
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
                      {vals.showPhotos ? (
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
                              Ảnh sản phẩm hoàn thiện để khách duyệt
                            </span>
                            {cur.photos.length ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '8px' }}>
                                {cur.photos.map((p) => (
                                  <div key={p.id} style={{ position: 'relative' }}>
                                    <img
                                      src={p.url}
                                      alt=""
                                      style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '12px', display: 'block' }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-line btn-icon"
                                      aria-label="Xóa ảnh"
                                      onClick={() => vals.removePhoto(p.id)}
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
                                minHeight: '96px',
                                borderRadius: '12px',
                                flexDirection: 'column',
                                gap: '6px',
                                textAlign: 'center',
                                padding: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              <Icon name="upload" className="ic ic-24" />
                              <span className="bsm">Chọn ảnh từ máy (JPG, PNG, WebP)</span>
                              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={vals.addPhotos} />
                            </label>
                            {vals.canSend ? (
                              <button
                                type="button"
                                className="btn btn-ink"
                                onClick={vals.sendPhoto}
                                disabled={st.busy || !cur.photos.length}
                              >
                                Gửi ảnh cho khách duyệt
                              </button>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                      {st.error ? (
                        <p className="bsm" role="alert" style={errorBox}>
                          {st.error}
                        </p>
                      ) : null}
                      {st.saved ? (
                        <>
                          <div
                            role="status"
                            className="tag t-ok"
                            style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '14px', gap: '8px' }}
                          >
                            <Icon name="check" />
                            {st.saved}
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
                      {cur.notes.map((n) => (
                        <div
                          key={n.id}
                          style={{ background: n.kind === 'revision' ? '#fbeab4' : '#f6efe6', borderRadius: '12px', padding: '12px 16px' }}
                        >
                          {n.kind === 'revision' ? (
                            <div className="cap" style={{ fontWeight: '600' }}>
                              Khách yêu cầu chỉnh sửa
                            </div>
                          ) : null}
                          <div className="bsm" style={{ whiteSpace: 'pre-line' }}>
                            {n.body}
                          </div>
                          <div className="cap">{formatDateTime(n.createdAt)}</div>
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
                        <button type="button" className="btn btn-line" onClick={vals.addNote} disabled={st.busy}>
                          Lưu ghi chú
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
