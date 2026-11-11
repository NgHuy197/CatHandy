import { useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import reveal from '../lib/reveal';
import { api, useApi } from '../lib/api';
import { formatPrice } from '../lib/chibi';
import { formatDate } from '../../shared/format';
import { statusInfo } from '../../shared/orders';

const WASH = ['#fddede', '#d3efe9', '#fbeab4', '#e8e0f8'];
const initial = (s) => (s || '?').trim().split(/\s+/).pop().charAt(0).toUpperCase();

// The site has no "forgot password" email, so the shop resets it here and sends the temporary password over Zalo.
function ResetPassword({ customer }) {
  const [st, setState] = useMergedState({ busy: false, password: '', error: '' });
  const reset = async () => {
    if (!window.confirm(`Đặt lại mật khẩu cho ${customer.name || customer.email}? Khách sẽ bị đăng xuất khỏi mọi thiết bị.`)) return;
    setState({ busy: true, error: '' });
    try {
      const { password } = await api(`/admin/customers/${encodeURIComponent(customer.key)}/password`, { method: 'POST' });
      setState({ busy: false, password });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <hr className="hr" />
      {st.password ? (
        <div style={{ background: '#f6efe6', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="cap">Mật khẩu tạm (chỉ hiện một lần)</span>
          <code className="hh" style={{ userSelect: 'all', letterSpacing: '1px' }}>
            {st.password}
          </code>
          <span className="cap">
            Gửi cho khách qua Zalo. Khách đăng nhập bằng {customer.email} rồi đổi mật khẩu ở Tài khoản, mục Hồ sơ.
          </span>
        </div>
      ) : (
        <div>
          <button type="button" className="btn btn-line" onClick={reset} disabled={st.busy}>
            {st.busy ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </div>
      )}
      {st.error ? (
        <p className="bsm" role="alert" style={{ color: 'var(--danger)' }}>
          {st.error}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminCustomers() {
  const detailRef = useRef(null);
  const [state, setState] = useMergedState({ sel: null, q: '' });
  const list = useApi('/admin/customers');

  const st = state;
  const q = st.q.trim().toLowerCase();
  const all = (list.data || []).map((d, i) => ({
    ...d,
    wash: WASH[i % WASH.length],
    initial: initial(d.name || d.email),
    name: d.name || d.email || 'Khách chưa có tên',
  }));
  const digits = q.replace(/\D/g, '');
  const D = all.filter(
    (d) =>
      !q ||
      d.name.toLowerCase().includes(q) ||
      (digits && (d.phone || '').includes(digits)) ||
      (d.email || '').toLowerCase().includes(q),
  );
  const selKey = st.sel || D[0]?.key || null;
  const detail = useApi(selKey ? '/admin/customers/' + encodeURIComponent(selKey) : null);
  const row = all.find((d) => d.key === selKey);
  const cur = detail.data && detail.data.key === selKey ? detail.data : null;

  const vals = {
    rows: D.map((d) =>
      Object.assign({}, d, {
        on: d.key === selKey,
        spentText: formatPrice(d.spent),
        login: d.registered ? 'Có tài khoản' : 'Mua nhanh',
        tagCls: d.registered ? 'tag t-ok' : 'tag t-sand',
        pick: () => {
          setState({ sel: d.key });
          reveal(detailRef.current);
        },
        style: d.key === selKey ? 'background:#fdeeee' : '',
      }),
    ),
    history: (cur?.orders || []).map((o) => {
      const s = statusInfo(o.status);
      return {
        id: o.code,
        what: o.items.map((it) => it.title).join(', ') + ', ' + formatDate(o.createdAt),
        total: formatPrice(o.total),
        status: s.short,
        tagCls: s.tag,
      };
    }),
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
                placeholder="Tìm theo tên, SĐT hoặc email"
                value={st.q}
                onChange={(e) => setState({ q: e.target.value })}
              />
            </div>
          </div>
        </div>
        {list.error ? (
          <p className="bsm" role="alert">
            {list.error.message}
          </p>
        ) : null}
        {list.data && !all.length ? <p className="bsm mut">Chưa có khách hàng nào.</p> : null}
        {all.length ? (
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
                    {vals.rows.map((r) => (
                      <tr key={r.key} style={css(r.style)}>
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
                              <span className="cap">{r.phone || r.email}</span>
                            </span>
                          </button>
                        </td>
                        <td>{r.orders}</td>
                        <td style={{ fontWeight: '600' }}>{r.spentText}</td>
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
              {cur && row ? (
                <>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: row.wash,
                          display: 'grid',
                          placeItems: 'center',
                          flex: 'none',
                          font: "400 24px/30px 'Coiny', sans-serif",
                        }}
                      >
                        {row.initial}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 className="hh">{cur.name || row.name}</h2>
                        <span className="cap">
                          {cur.since ? (cur.registered ? 'Có tài khoản từ ' : 'Mua lần đầu ') + formatDate(cur.since) : ''}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ background: '#f6efe6', borderRadius: '12px', padding: '12px 16px' }}>
                        <div className="cap">Tổng chi tiêu</div>
                        <div className="hh">{formatPrice(row.spent)}</div>
                      </div>
                      <div style={{ background: '#f6efe6', borderRadius: '12px', padding: '12px 16px' }}>
                        <div className="cap">Số đơn</div>
                        <div className="hh">{row.orders}</div>
                      </div>
                    </div>
                    <hr className="hr" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="cap">Liên hệ</span>
                      <span className="bsm">{cur.phone || 'Chưa có số điện thoại'}</span>
                      {cur.email ? <span className="bsm mut">{cur.email}</span> : null}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="cap">{cur.registered ? 'Địa chỉ nhận hàng mặc định' : 'Địa chỉ đơn gần nhất'}</span>
                      <span className="bsm">{cur.address || 'Chưa có'}</span>
                    </div>
                    {cur.phone ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a href={'https://zalo.me/' + cur.phone.replace(/^\+84/, '0')} target="_blank" rel="noreferrer" className="btn btn-ink">
                          Chat Zalo
                        </a>
                        <a href={'tel:' + cur.phone} className="btn btn-line">
                          Gọi điện
                        </a>
                      </div>
                    ) : null}
                    {cur.registered && cur.hasPassword ? <ResetPassword key={cur.key} customer={cur} /> : null}
                  </div>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 className="hh">Lịch sử mua hàng</h3>
                    {!vals.history.length ? <p className="bsm mut">Chưa có đơn nào.</p> : null}
                    {vals.history.map((h) => (
                      <Link
                        key={h.id}
                        to={'/admin/don-hang?ma=' + h.id}
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
                </>
              ) : (
                <p className="bsm mut" role={detail.error ? 'alert' : 'status'}>
                  {detail.error ? detail.error.message : 'Đang tải hồ sơ...'}
                </p>
              )}
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
