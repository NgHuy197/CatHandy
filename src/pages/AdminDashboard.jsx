import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';

export default function AdminDashboard() {
  const [state, setState] = useMergedState({ range: 'week' });

  const r = state.range;
  const fmt = (v) => v.toFixed(1).replace('.', ',');
  const week = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    v: [1.2, 0.8, 2.1, 1.5, 3.0, 2.4, 1.1],
    orders: 20,
    title: 'Doanh thu theo ngày, tuần này',
  };
  const month = {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    v: [9.4, 12.1, 10.8, 14.6],
    orders: 78,
    title: 'Doanh thu theo tuần, tháng này',
  };
  const d = r === 'week' ? week : month;
  const max = Math.max.apply(null, d.v);
  const total = d.v.reduce((a, b) => a + b, 0);
  const pct = (n, m) => Math.round((n / m) * 100) + '%';
  const list = (arr) => {
    const m = Math.max.apply(
      null,
      arr.map((x) => x[1]),
    );
    return arr.map((x) => ({ label: x[0], n: x[1], w: pct(x[1], m) }));
  };
  const vals = {
    isWeek: r === 'week',
    isMonth: r === 'month',
    weekCls: r === 'week' ? 'chip on' : 'chip',
    monthCls: r === 'month' ? 'chip on' : 'chip',
    setWeek: () => setState({ range: 'week' }),
    setMonth: () => setState({ range: 'month' }),
    chartTitle: d.title,
    bars: d.v.map((v, i) => ({ label: d.labels[i], value: fmt(v), h: Math.round((v / max) * 170) + 'px' })),
    kpis: [
      {
        label: 'Doanh thu',
        value: fmt(total) + ' triệu',
        note: r === 'week' ? 'Tuần này, số liệu mẫu' : 'Tháng này, số liệu mẫu',
      },
      { label: 'Số đơn', value: String(d.orders), note: 'Số liệu mẫu' },
      { label: 'Đơn mới chưa xem', value: '3', note: 'Cần liên hệ khách' },
      { label: 'Đang chế tác', value: '7', note: 'Từ chuẩn bị đến chờ duyệt' },
    ],
    statuses: list([
      ['Mới, chưa xem', 3],
      ['Đang chuẩn bị nguyên liệu', 2],
      ['Đang làm đồ', 5],
      ['Chờ khách duyệt', 2],
      ['Đã giao bên vận chuyển', 8],
    ]),
    boxes: list([
      ['Hộp gỗ chibi', 58],
      ['Hộp mica chibi', 31],
      ['Bộ quà cưới', 11],
    ]),
    options: list([
      ['Áo dài', 42],
      ['Bó hoa', 37],
      ['Vest', 28],
      ['Kính tròn', 15],
    ]),
  };

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
            <button
              type="button"
              className="btn btn-line btn-icon"
              aria-label="Thông báo, 3 đơn mới"
              style={{ position: 'relative' }}
            >
              <Icon name="bell" />
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
                3
              </span>
            </button>
          </div>
        </div>
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'stretch' }}>
          <div
            style={{
              flex: '1 1 420px',
              minWidth: '0',
              background: '#fddede',
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
              <h2 className="hh">Đơn mới CH-0003 vừa đến</h2>
              <span className="tag t-danger">Chưa xem</span>
            </div>
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
                  [SĐT khách]
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="cap" style={{ color: '#2a1f2d' }}>
                  Địa chỉ
                </span>
                <span className="bsm" style={{ fontWeight: '600' }}>
                  [Địa chỉ nhận hàng]
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
                Cấu hình chibi khách chọn
              </span>
              <span className="bsm">Hộp gỗ chibi, 2 nhân vật</span>
              <span className="bsm">Nhân vật 1: tóc dài đen, cười nhẹ, áo dài đỏ, bó hoa</span>
              <span className="bsm">Nhân vật 2: tóc ngắn đen, nháy mắt, vest xanh navy</span>
              <span className="bsm">Ghi chú: [ghi chú của khách]</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/admin/don-hang" className="btn btn-ink">
                Mở chi tiết đơn
              </Link>
              <button type="button" className="btn btn-line">
                Đánh dấu đã xem
              </button>
            </div>
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
              <span className="cap">Bot Telegram, gửi ngay khi có đơn mới</span>
            </div>
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
                Đơn mới CH-0003
              </span>
              <span className="bsm">SĐT: [SĐT khách]</span>
              <span className="bsm">Địa chỉ: [địa chỉ nhận hàng]</span>
              <span className="bsm">Hộp gỗ chibi, 2 nhân vật</span>
              <span className="bsm">NV1: tóc dài đen, áo dài đỏ, bó hoa</span>
              <span className="bsm">NV2: tóc ngắn đen, vest xanh navy</span>
              <span className="bsm">Ghi chú: [ghi chú của khách]</span>
              <span className="bsm deep" style={{ textDecoration: 'underline' }}>
                Mở đơn trong trang quản trị
              </span>
            </div>
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
              <span className="cap">Đơn vị: triệu đồng. Số liệu mẫu.</span>
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
              <span className="cap">Số liệu mẫu</span>
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
              <h2 className="hh">Loại hộp được chọn nhiều</h2>
              <span className="cap">Số liệu mẫu</span>
            </div>
            {vals.boxes.map((s, index) => (
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
              <h2 className="hh">Tùy chọn được chọn nhiều</h2>
              <span className="cap">Số liệu mẫu</span>
            </div>
            {vals.options.map((s, index) => (
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
                <tr>
                  <td>
                    <Link to="/admin/don-hang" className="deep" style={{ fontWeight: '600' }}>
                      CH-0003
                    </Link>
                  </td>
                  <td>Khách A</td>
                  <td>Hộp gỗ chibi, 2 nhân vật</td>
                  <td>474.000đ</td>
                  <td>
                    <span className="tag t-danger">Mới, chưa xem</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Link to="/admin/don-hang" className="deep" style={{ fontWeight: '600' }}>
                      CH-0002
                    </Link>
                  </td>
                  <td>Khách B</td>
                  <td>Hộp mica chibi, 1 nhân vật</td>
                  <td>369.000đ</td>
                  <td>
                    <span className="tag t-butter">Đang làm đồ</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Link to="/admin/don-hang" className="deep" style={{ fontWeight: '600' }}>
                      CH-0001
                    </Link>
                  </td>
                  <td>Khách C</td>
                  <td>Hộp gỗ chibi, 2 nhân vật</td>
                  <td>763.000đ</td>
                  <td>
                    <span className="tag t-powder">Chờ khách duyệt</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Link to="/admin/don-hang" className="deep" style={{ fontWeight: '600' }}>
                      CH-0000
                    </Link>
                  </td>
                  <td>Khách D</td>
                  <td>Bộ quà cưới</td>
                  <td>[tổng tiền]</td>
                  <td>
                    <span className="tag t-ok">Đã giao vận chuyển</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
