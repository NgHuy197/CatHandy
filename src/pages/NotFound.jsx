import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { setPageMeta } from '../lib/pageMeta';

// Any address no route matches, such as an old or mistyped link.
export default function NotFound() {
  useEffect(() => {
    setPageMeta('Không tìm thấy trang');
  }, []);

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main className="wrap" style={{ paddingBlock: '48px 96px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
        <span className="lbl">Lỗi 404</span>
        <h1 className="hlg">Không tìm thấy trang này</h1>
        <p className="sub">Đường dẫn có thể đã cũ hoặc gõ nhầm.</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-ink">
            Về trang chủ
          </Link>
          <Link to="/san-pham" className="btn btn-line">
            Xem sản phẩm
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
