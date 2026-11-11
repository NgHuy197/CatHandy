import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import useMergedState from '../lib/useMergedState';
import { api, useApi } from '../lib/api';
import { refreshConfig } from '../lib/config';
import { POLICY_TEMPLATES } from '../lib/policyTemplates';
import { POLICIES, POLICY_MAX } from '../../shared/policies';

const FIELDS = [
  ['phone', 'Số điện thoại / Zalo của shop', '09xx xxx xxx', 'tel'],
  ['email', 'Email của shop', 'shop@email.com', 'email'],
  ['zaloUrl', 'Zalo', 'Số Zalo hoặc link https://zalo.me/...', 'text'],
  ['messengerUrl', 'Messenger', 'https://m.me/ten-fanpage', 'url'],
  ['shopeeUrl', 'Gian hàng Shopee', 'https://shopee.vn/...', 'url'],
  ['facebookUrl', 'Fanpage Facebook', 'https://facebook.com/...', 'url'],
];
const SELLER_FIELDS = [
  ['ownerName', 'Tên chủ shop hoặc hộ kinh doanh', 'Hộ kinh doanh Cat Handy', 'text'],
  ['businessId', 'Mã số thuế hoặc số đăng ký kinh doanh', '0123456789', 'text'],
  ['address', 'Địa chỉ kinh doanh', 'Số nhà, đường, phường, quận, tỉnh hoặc thành phố', 'text'],
  ['bctUrl', 'Link xác nhận đã thông báo Bộ Công Thương', 'https://online.gov.vn/...', 'url'],
];
const errorBox = { background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '16px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' };

// Saves one form: shows "Đang lưu", then the message or the error, and refreshes the public config the site reads.
function useSave(path) {
  const [state, setState] = useMergedState({ busy: false, error: '', saved: '' });
  const save = async (body, onSaved) => {
    setState({ busy: true, error: '', saved: '' });
    try {
      const value = await api(path, { method: 'PUT', body });
      onSaved(value);
      setState({ busy: false, saved: 'Đã lưu. Website hiển thị nội dung mới ngay.' });
      refreshConfig();
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };
  return { ...state, save, clear: () => setState({ saved: '' }) };
}

function SaveRow({ s, label }) {
  return (
    <>
      {s.error ? (
        <p className="bsm" role="alert" style={errorBox}>
          {s.error}
        </p>
      ) : null}
      {s.saved ? (
        <p className="bsm" role="status">
          {s.saved}
        </p>
      ) : null}
      <div>
        <button type="submit" className="btn btn-ink" disabled={s.busy}>
          {s.busy ? 'Đang lưu...' : label}
        </button>
      </div>
    </>
  );
}

export default function AdminSettings() {
  const shop = useApi('/admin/shop');
  const policies = useApi('/admin/policies');
  const [state, setState] = useMergedState({ form: null, texts: null, published: {} });
  const shopSave = useSave('/admin/shop');
  const policySave = useSave('/admin/policies');
  useEffect(() => {
    if (shop.data) setState({ form: shop.data });
  }, [shop.data, setState]);
  useEffect(() => {
    if (policies.data) setState({ texts: policies.data, published: policies.data });
  }, [policies.data, setState]);

  const st = state;
  const setField = (key, value) => {
    setState({ form: { ...st.form, [key]: value } });
    shopSave.clear();
  };
  const setText = (key, value) => {
    setState({ texts: { ...st.texts, [key]: value } });
    policySave.clear();
  };
  const input = ([key, label, placeholder, type]) => (
    <div key={key} className="field">
      <label htmlFor={'shop-' + key}>{label}</label>
      <input
        id={'shop-' + key}
        className="input"
        type={type}
        placeholder={placeholder}
        value={st.form[key] || ''}
        onChange={(e) => setField(key, e.target.value)}
      />
    </div>
  );

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
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault();
              shopSave.save(st.form, (value) => setState({ form: value }));
            }}
            style={formStyle}
          >
            <h2 className="hh">Thông tin liên hệ</h2>
            <div style={grid}>{FIELDS.map(input)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 className="hh">Thông tin người bán</h2>
              <p className="bsm mut">
                Hiện ở cuối trang. Website bán hàng cần ghi rõ chủ sở hữu, mã số thuế hoặc số đăng ký kinh doanh và địa
                chỉ. Sau khi thông báo website tại online.gov.vn, dán link xác nhận vào đây.
              </p>
            </div>
            <div style={grid}>{SELLER_FIELDS.map(input)}</div>
            <SaveRow s={shopSave} label="Lưu thông tin" />
          </form>
        )}
        {!st.texts ? (
          <p className="bsm mut" role={policies.error ? 'alert' : 'status'}>
            {policies.error ? policies.error.message : 'Đang tải chính sách...'}
          </p>
        ) : (
          <form
            className="card"
            onSubmit={(e) => {
              e.preventDefault();
              policySave.save(st.texts, (value) => setState({ texts: value, published: value }));
            }}
            style={formStyle}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 className="hh">Trang chính sách</h2>
              <p className="bsm mut">
                Trang nào có nội dung sẽ hiện link ở chân trang, trang để trống được ẩn. Dòng trống để tách đoạn, dòng
                bắt đầu bằng &quot;## &quot; là tiêu đề. Bản mẫu có sẵn các chỗ [trong ngoặc vuông] để shop điền; nên
                nhờ người am hiểu pháp luật xem lại trước khi đăng.
              </p>
            </div>
            {POLICIES.map((p) => (
              <div key={p.key} className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label htmlFor={'policy-' + p.key}>{p.title}</label>
                  <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {st.published[p.key] ? (
                      <Link to={'/chinh-sach/' + p.slug} target="_blank" className="cap deep">
                        Xem trang
                      </Link>
                    ) : null}
                    {!st.texts[p.key] ? (
                      <button type="button" className="btn btn-line" onClick={() => setText(p.key, POLICY_TEMPLATES[p.key])}>
                        Chèn bản mẫu
                      </button>
                    ) : null}
                  </span>
                </div>
                <textarea
                  id={'policy-' + p.key}
                  className="input"
                  rows={st.texts[p.key] ? 12 : 3}
                  maxLength={POLICY_MAX}
                  placeholder="Để trống thì trang này không hiện trên website."
                  value={st.texts[p.key] || ''}
                  onChange={(e) => setText(p.key, e.target.value)}
                />
              </div>
            ))}
            <SaveRow s={policySave} label="Lưu chính sách" />
          </form>
        )}
      </main>
    </div>
  );
}
