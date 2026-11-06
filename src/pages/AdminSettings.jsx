import { useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import useMergedState from '../lib/useMergedState';
import { api, useApi } from '../lib/api';
import { refreshConfig } from '../lib/config';

const FIELDS = [
  ['phone', 'Số điện thoại / Zalo của shop', '09xx xxx xxx', 'tel'],
  ['email', 'Email của shop', 'shop@email.com', 'email'],
  ['zaloUrl', 'Zalo', 'Số Zalo hoặc link https://zalo.me/...', 'text'],
  ['messengerUrl', 'Messenger', 'https://m.me/ten-fanpage', 'url'],
  ['shopeeUrl', 'Gian hàng Shopee', 'https://shopee.vn/...', 'url'],
  ['facebookUrl', 'Fanpage Facebook', 'https://facebook.com/...', 'url'],
];
const errorBox = { background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' };

export default function AdminSettings() {
  const shop = useApi('/admin/shop');
  const [state, setState] = useMergedState({ form: null, busy: false, error: '', saved: '' });
  useEffect(() => {
    if (shop.data) setState({ form: shop.data });
  }, [shop.data, setState]);

  const st = state;
  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', saved: '' });
    try {
      const value = await api('/admin/shop', { method: 'PUT', body: st.form });
      setState({ busy: false, form: value, saved: 'Đã lưu. Website hiển thị thông tin mới ngay.' });
      refreshConfig();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <div className="cat" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div className="admin-side">
        <AdminSidebar active="settings" />
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
            Cài đặt shop
          </h1>
          <p className="bsm mut">
            Thông tin liên hệ hiện ở chân trang, nút chat nổi và trang tra cứu đơn. Mục nào để trống sẽ được ẩn.
          </p>
        </div>
        {!st.form ? (
          <p className="bsm mut" role={shop.error ? 'alert' : 'status'}>
            {shop.error ? shop.error.message : 'Đang tải...'}
          </p>
        ) : (
          <form className="card" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
            <h2 className="hh">Thông tin liên hệ</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                gap: '16px',
              }}
            >
              {FIELDS.map(([key, label, placeholder, type]) => (
                <div key={key} className="field">
                  <label htmlFor={'shop-' + key}>{label}</label>
                  <input
                    id={'shop-' + key}
                    className="input"
                    type={type}
                    placeholder={placeholder}
                    value={st.form[key] || ''}
                    onChange={(e) => setState({ form: { ...st.form, [key]: e.target.value }, saved: '' })}
                  />
                </div>
              ))}
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
            <div>
              <button type="submit" className="btn btn-ink" disabled={st.busy}>
                {st.busy ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
