import { useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import reveal from '../lib/reveal';

export default function AdminCustomers() {
  const detailRef = useRef(null);
  const [state, setState] = useMergedState({ sel: 'c3' });

  const st = state;
  const D = [
    {
      id: 'c1',
      name: 'Khách A',
      phone: '[SĐT khách A]',
      orders: 1,
      spent: '474.000đ',
      login: 'Mua nhanh',
      tagCls: 'tag t-sand',
      wash: '#fddede',
      history: [
        {
          id: 'CH-0003',
          what: 'Cặp đôi áo dài, hộp gỗ chibi',
          total: '474.000đ',
          status: 'Mới',
          tagCls: 'tag t-danger',
        },
      ],
    },
    {
      id: 'c2',
      name: 'Khách B',
      phone: '[SĐT khách B]',
      orders: 2,
      spent: '738.000đ',
      login: 'Có tài khoản',
      tagCls: 'tag t-ok',
      wash: '#d3efe9',
      history: [
        {
          id: 'CH-0002',
          what: 'Chibi hộp mica, 1 nhân vật',
          total: '369.000đ',
          status: 'Đang làm đồ',
          tagCls: 'tag t-butter',
        },
        {
          id: 'CH-00xx',
          what: 'Chibi hộp mica, 1 nhân vật',
          total: '369.000đ',
          status: 'Đã giao VC',
          tagCls: 'tag t-ok',
        },
      ],
    },
    {
      id: 'c3',
      name: 'Khách C',
      phone: '[SĐT khách C]',
      orders: 2,
      spent: '1.312.000đ',
      login: 'Có tài khoản',
      tagCls: 'tag t-ok',
      wash: '#fbeab4',
      history: [
        {
          id: 'CH-0001',
          what: 'Cặp đôi áo dài và Chibi vest xanh',
          total: '763.000đ',
          status: 'Chờ duyệt',
          tagCls: 'tag t-powder',
        },
        {
          id: 'CH-00xx',
          what: 'Bộ cô dâu chú rể mini',
          total: '549.000đ',
          status: 'Đã giao VC',
          tagCls: 'tag t-ok',
        },
      ],
    },
    {
      id: 'c4',
      name: 'Khách D',
      phone: '[SĐT khách D]',
      orders: 1,
      spent: '689.000đ',
      login: 'Có tài khoản',
      tagCls: 'tag t-ok',
      wash: '#e8e0f8',
      history: [
        {
          id: 'CH-0000',
          what: 'Bộ quà cưới cao cấp',
          total: '689.000đ',
          status: 'Đã giao VC',
          tagCls: 'tag t-ok',
        },
      ],
    },
  ].map((d) => Object.assign({}, d, { initial: d.name.slice(-1) }));
  const cur = D.filter((d) => d.id === st.sel)[0];
  const vals = {
    rows: D.map((d) =>
      Object.assign({}, d, {
        on: d.id === st.sel,
        pick: () => {
          setState({ sel: d.id });
          reveal(detailRef.current);
        },
        style: d.id === st.sel ? 'background:#fdeeee' : '',
      }),
    ),
    cur,
  };

  return (
    <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div className="admin-side">
        <AdminSidebar active="cust" />
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
              Khách hàng
            </h1>
            <p className="bsm mut">Xem hồ sơ, lịch sử mua hàng và tổng chi tiêu của từng khách.</p>
          </div>
          <div className="field" style={{ flex: '0 1 260px', minWidth: '0' }}>
            <label htmlFor="cq" className="sr">
              Tìm khách hàng
            </label>
            <div style={{ position: 'relative' }}>
              <Icon
                name="search"
                style={{ position: 'absolute', left: '14px', top: '12px', color: '#6b5f66' }}
              />
              <input
                id="cq"
                className="input"
                style={{ paddingLeft: '44px' }}
                placeholder="Tìm theo tên hoặc SĐT"
              />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <section
            className="card"
            style={{ flex: '999 1 520px', minWidth: '0', padding: '0', overflow: 'hidden' }}
          >
            <div className="scroll-x">
              <table className="tbl" style={{ minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th>Khách</th>
                    <th>Số đơn</th>
                    <th>Tổng chi tiêu</th>
                    <th>Đăng nhập</th>
                  </tr>
                </thead>
                <tbody>
                  {vals.rows.map((r, index) => (
                    <tr key={index} style={css(r.style)}>
                      <td>
                        <button
                          type="button"
                          onClick={r.pick}
                          aria-pressed={r.on}
                          style={{
                            background: 'none',
                            border: '0',
                            padding: '0',
                            textAlign: 'left',
                            cursor: 'pointer',
                            font: 'inherit',
                            color: 'inherit',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <span
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: r.wash,
                              display: 'grid',
                              placeItems: 'center',
                              font: "600 14px/20px 'Be Vietnam Pro', sans-serif",
                              flex: 'none',
                            }}
                          >
                            {r.initial}
                          </span>
                          <span style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600' }}>{r.name}</span>
                            <span className="cap">{r.phone}</span>
                          </span>
                        </button>
                      </td>
                      <td>{r.orders}</td>
                      <td style={{ fontWeight: '600' }}>{r.spent}</td>
                      <td>
                        <span className={r.tagCls}>{r.login}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <aside
            ref={detailRef}
            className="detail-anchor"
            style={{
              flex: '1 1 340px',
              maxWidth: '460px',
              minWidth: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: vals.cur.wash,
                    display: 'grid',
                    placeItems: 'center',
                    font: "400 24px/30px 'iCiel Queulat Uni', sans-serif",
                  }}
                >
                  {vals.cur.initial}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h2 className="hh">{vals.cur.name}</h2>
                  <span className="cap">Khách từ [tháng đăng ký]</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f6efe6', borderRadius: '12px', padding: '12px 16px' }}>
                  <div className="cap">Tổng chi tiêu</div>
                  <div className="hh">{vals.cur.spent}</div>
                </div>
                <div style={{ background: '#f6efe6', borderRadius: '12px', padding: '12px 16px' }}>
                  <div className="cap">Số đơn</div>
                  <div className="hh">{vals.cur.orders}</div>
                </div>
              </div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="cap">Liên hệ</span>
                <span className="bsm">{vals.cur.phone}</span>
                <span className="bsm mut">[Email nếu có]</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="cap">Địa chỉ nhận hàng mặc định</span>
                <span className="bsm">[Địa chỉ mặc định]</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href="#" className="btn btn-ink">
                  Chat Zalo
                </a>
                <a href="#" className="btn btn-line">
                  Gọi điện
                </a>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 className="hh">Lịch sử mua hàng</h3>
              {vals.cur.history.map((h, index) => (
                <Link
                  key={index}
                  to="/admin/don-hang"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #e3d8ca',
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="bsm" style={{ fontWeight: '600' }}>
                      {h.id}
                    </span>
                    <span className="cap">{h.what}</span>
                  </span>
                  <span
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}
                  >
                    <span className="bsm" style={{ fontWeight: '500' }}>
                      {h.total}
                    </span>
                    <span className={h.tagCls}>{h.status}</span>
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
