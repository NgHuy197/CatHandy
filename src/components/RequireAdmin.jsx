import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// Admin pages render only for admins; everyone else is sent to sign in. The API checks again on every call.
export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  if (user === undefined) {
    return (
      <div className="cat" style={{ padding: '48px 24px' }}>
        <p className="bsm mut" role="status">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }
  if (!user) return <Navigate to={'/dang-nhap?next=' + encodeURIComponent(pathname + search)} replace />;
  if (user.role !== 'admin') {
    return (
      <div className="cat" style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
        <h1 className="hlg">Trang dành cho quản trị viên</h1>
        <p className="bsm mut">Tài khoản {user.email} không có quyền quản trị.</p>
        <Link to="/" className="btn btn-ink">
          Về trang chủ
        </Link>
      </div>
    );
  }
  return children;
}
