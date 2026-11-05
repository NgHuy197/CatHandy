import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import { api, useApi } from '../lib/api';
import { refreshUnseen, useUnseenOrders } from '../lib/adminAlerts';
import { formatPrice } from '../lib/chibi';
import { formatDateTime } from '../../shared/format';
import { statusInfo } from '../../shared/orders';

export default function AdminDashboard() {
  const [state, setState] = useMergedState({ range: 'week' });
  const navigate = useNavigate();
  const unseen = useUnseenOrders();
  const report = useApi('/admin/reports?range=' + state.range);
  const recent = useApi('/admin/orders?group=all');
  const summary = useApi('/admin/summary');

  const r = state.range;
  const d = report.data;
  const fmt = (v) => v.toFixed(1).replace('.', ',');
  const millions = (n) => n / 1e6;
  const max = d ? Math.max(1, ...d.bars.map((b) => b.revenue)) : 1;
  const pct = (n, m) => (m ? Math.round((n / m) * 100) : 0) + '%';
  const list = (arr) => {
    const m = Math.max(0, ...arr.map((x) => x.count));
    return arr.map((x) => ({ label: x.label, n: x.count, w: pct(x.count, m) }));
  };
  const orders = recent.data || [];
  // The newest order no admin has opened yet, shown as the alert card.
  const fresh = orders.find((o) => !o.seenAt);
  const freshCustom = fresh?.items.find((it) => it.isCustom);
  const vals = {
    isWeek: r === 'week',
    isMonth: r === 'month',
    weekCls: r === 'week' ? 'chip on' : 'chip',
    monthCls: r === 'month' ? 'chip on' : 'chip',
    setWeek: () => setState({ range: 'week' }),
    setMonth: () => setState({ range: 'month' }),
    chartTitle: r === 'week' ? 'Doanh thu theo ngày, tuần này' : 'Doanh thu theo tuần, tháng này',
    bars: d
      ? d.bars.map((b) => ({ label: b.label, value: fmt(millions(b.revenue)), h: Math.round((b.revenue / max) * 170) + 'px' }))
      : [],
    kpis: d
      ? [
          { label: 'Doanh thu', value: fmt(millions(d.revenue)) + ' triệu', note: r === 'week' ? 'Tuần này' : 'Tháng này' },
          { label: 'Số đơn', value: String(d.orders), note: r === 'week' ? 'Tuần này' : 'Tháng này' },
          { label: 'Đơn mới chưa xem', value: String(unseen), note: 'Cần liên hệ khách' },
          { label: 'Đang chế tác', value: String(d.inProgress), note: 'Từ chuẩn bị đến chờ giao' },
        ]
      : [],
    statuses: d ? list(d.statuses) : [],
    boxes: d ? list(d.boxes) : [],
    options: d ? list(d.options) : [],
    markSeen: async () => {
      await api('/admin/orders/' + fresh.code).catch(() => {});
      recent.setData((rows) => rows.map((o) => (o.code === fresh.code ? { ...o, seenAt: new Date().toISOString() } : o)));
      refreshUnseen();
    },
    open: (code) => navigate('/admin/don-hang?ma=' + code),
  };
  const preview = fresh || orders[0];
  const previewCustom = preview?.items.find((it) => it.isCustom);

  return (
    <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div className="admin-side">
        <AdminSidebar active="dash" />
      </div>
      <main
        style={{
          flex: '999 1 640px',
          minWidth: '0',
          padding: 'clamp(20px, 3vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="lbl">Quản trị</span>
            <h1 className="hlg" style={{ fontSize: '40px', lineHeight: '46px' }}>
              Tổng quan
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px' }} role="group" aria-label="Khoảng thời gian">
              <button
                type="button"
                className={vals.weekCls}
                aria-pressed={vals.isWeek}
                onClick={vals.setWeek}
              >
                Tuần này
              </button>
              <button
                type="button"
                className={vals.monthCls}
                aria-pressed={vals.isMonth}
                onClick={vals.setMonth}
              >
                Tháng này
              </button>
            </div>
            <Link
              to="/admin/don-hang"
              className="btn btn-line btn-icon"
              aria-label={'Thông báo, ' + unseen + ' đơn mới'}
              style={{ position: 'relative' }}
            >
              <Icon name="bell" />
              {unseen ? (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '999px',
                    background: '#b0343f',
                    color: '#fff',
                    font: "600 11px/18px 'Be Vietnam Pro', sans-serif",
                    textAlign: 'center',
                  }}
                >
                  {unseen}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
        {report.error ? (
          <p className="bsm" role="alert">
            {report.error.message}
          </p>
        ) : null}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'stretch' }}>
          <div
            style={{
              flex: '1 1 420px',
              minWidth: '0',
              background: fresh ? '#fddede' : '#f6efe6',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="bell" />
              </span>
              <h2 className="hh">{fresh ? `Đơn mới ${fresh.code} vừa đến` : 'Không có đơn mới chưa xem'}</h2>
              {fresh ? <span className="tag t-danger">Chưa xem</span> : null}
            </div>
            {fresh ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="cap" style={{ color: '#2a1f2d' }}>
                      Số điện thoại
                    </span>
                    <span className="bsm" style={{ fontWeight: '600' }}>
                      {fresh.customerName}, {fresh.phone}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="cap" style={{ color: '#2a1f2d' }}>
                      Địa chỉ
                    </span>
                    <span className="bsm" style={{ fontWeight: '600' }}>
                      {fresh.address}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span className="cap" style={{ color: '#2a1f2d' }}>
                    {freshCustom ? 'Cấu hình chibi khách chọn' : 'Sản phẩm'}
                  </span>
                  {fresh.items.map((it, i) => (
                    <span key={i} className="bsm">
                      {it.qty} x {[it.title, it.sub, it.variant].filter(Boolean).join(', ')}
                    </span>
                  ))}
                  {freshCustom?.design.lines.map((l) => (
                    <span key={l} className="bsm">
                      {l}
                    </span>
                  ))}
                  {fresh.note || freshCustom?.design.note ? (
                    <span className="bsm">Ghi chú: {[fresh.note, freshCustom?.design.note].filter(Boolean).join('. ')}</span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-ink" onClick={() => vals.open(fresh.code)}>
                    Mở chi tiết đơn
                  </button>
                  <button type="button" className="btn btn-line" onClick={vals.markSeen}>
                    Đánh dấu đã xem
                  </button>
                </div>
              </>
            ) : (
              <p className="bsm mut">Đơn mới sẽ hiện ở đây và trong mục Đơn hàng, kèm thông báo Telegram nếu đã cấu hình bot.</p>
            )}
          </div>
          <div
            style={{
              flex: '1 1 320px',
              minWidth: '0',
              background: '#ffffff',
              border: '1px solid #e3d8ca',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 className="hh">Tin nhắn gửi chủ shop</h2>
              <span className="cap">
                {summary.data?.telegram
                  ? 'Bot Telegram, gửi ngay khi có đơn mới'
                  : 'Chưa bật: đặt TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID để nhận tin qua Telegram'}
              </span>
            </div>
            {preview ? (
              <div
                style={{
                  background: '#d6ebfa',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span className="bsm" style={{ fontWeight: '600' }}>
                  Đơn mới {preview.code}: {formatPrice(preview.total)}
                </span>
                <span className="bsm">SĐT: {preview.phone}</span>
                <span className="bsm">Địa chỉ: {preview.address}</span>
                {preview.items.map((it, i) => (
                  <span key={i} className="bsm">
                    {it.qty} x {it.title}
                    {it.isCustom ? ', ' + it.sub : ''}
                  </span>
                ))}
                {previewCustom?.design.lines.map((l) => (
                  <span key={l} className="bsm">
                    {l}
                  </span>
                ))}
                {preview.note ? <span className="bsm">Ghi chú: {preview.note}</span> : null}
                <Link to={'/admin/don-hang?ma=' + preview.code} className="bsm deep" style={{ textDecoration: 'underline' }}>
                  Mở đơn trong trang quản trị
                </Link>
              </div>
            ) : (
              <p className="bsm mut">Chưa có đơn nào.</p>
            )}
          </div>
        </section>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
            gap: '16px',
          }}
        >
          {vals.kpis.map((k, index) => (
            <div
              key={index}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <span className="cap">{k.label}</span>
              <span className="hlg">{k.value}</span>
              <span className="cap">{k.note}</span>
            </div>
          ))}
        </section>
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'stretch' }}>
          <div
            className="card"
            style={{
              flex: '1.4 1 460px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 className="hh">{vals.chartTitle}</h2>
              <span className="cap">Đơn vị: triệu đồng, tính theo ngày đặt đơn.</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px',
                height: '240px',
                paddingTop: '8px',
              }}
            >
              {vals.bars.map((b, index) => (
                <div
                  key={index}
                  style={{
                    flex: '1',
                    minWidth: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '6px',
                    height: '100%',
                  }}
                >
                  <span className="cap" style={{ color: '#2a1f2d', fontWeight: '600' }}>
                    {b.value}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '48px',
                      borderRadius: '8px 8px 0 0',
                      background: '#b0343f',
                      height: b.h,
                    }}
                  />
                  <span className="cap">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="card"
            style={{
              flex: '1 1 300px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2 className="hh">Số đơn theo trạng thái</h2>
              <span className="cap">Tất cả đơn hiện có</span>
            </div>
            {vals.statuses.map((s, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span className="bsm">{s.label}</span>
                  <span className="bsm" style={{ fontWeight: '600' }}>
                    {s.n}
                  </span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: '#ebe1d5' }}>
                  <div style={{ height: '8px', borderRadius: '999px', background: '#b0343f', width: s.w }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'stretch' }}>
          {[
            ['Loại hộp được chọn nhiều', vals.boxes],
            ['Tùy chọn được chọn nhiều', vals.options],
          ].map(([title, rows]) => (
            <div
              key={title}
              className="card"
              style={{
                flex: '1 1 300px',
                minWidth: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h2 className="hh">{title}</h2>
                <span className="cap">Chibi tự thiết kế, {r === 'week' ? 'tuần này' : 'tháng này'}</span>
              </div>
              {!rows.length && d ? <p className="bsm mut">Chưa có dữ liệu.</p> : null}
              {rows.map((s, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span className="bsm">{s.label}</span>
                    <span className="bsm" style={{ fontWeight: '600' }}>
                      {s.n}
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: '#ebe1d5' }}>
                    <div style={{ height: '8px', borderRadius: '999px', background: '#2a1f2d', width: s.w }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
        <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
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
            <h2 className="hh">Đơn gần đây</h2>
            <Link to="/admin/don-hang" className="btn btn-line">
              Xem tất cả đơn
            </Link>
          </div>
          <div className="scroll-x">
            <table className="tbl" style={{ minWidth: '640px' }}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách</th>
                  <th>Sản phẩm</th>
                  <th>Tổng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => {
                  const s = statusInfo(o.status);
                  return (
                    <tr key={o.code}>
                      <td>
                        <Link to={'/admin/don-hang?ma=' + o.code} className="deep" style={{ fontWeight: '600' }}>
                          {o.code}
                        </Link>
                        <div className="cap">{formatDateTime(o.createdAt)}</div>
                      </td>
                      <td>{o.customerName}</td>
                      <td>{o.items.map((it) => [it.title, it.sub].filter(Boolean).join(', ')).join('; ')}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td>
                        <span className={o.seenAt ? s.tag : 'tag t-danger'}>{o.seenAt ? s.label : 'Mới, chưa xem'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
