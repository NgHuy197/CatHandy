import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Main from './pages/Main';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDone from './pages/OrderDone';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Track from './pages/Track';
import RequireAdmin from './components/RequireAdmin';
import usePageMeta from './lib/pageMeta';

// The customizer and the admin are big and most visitors open neither, so they load on demand.
const Customizer = lazy(() => import('./pages/Customizer'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminCustomizer = lazy(() => import('./pages/AdminCustomizer'));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="cat" style={{ padding: '48px 24px' }}>
      <p className="bsm mut" role="status">
        Đang tải...
      </p>
    </div>
  );
}

const admin = (page) => <RequireAdmin>{page}</RequireAdmin>;

export default function App() {
  usePageMeta();
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/san-pham" element={<Catalog />} />
          <Route path="/san-pham/:slug" element={<Product />} />
          <Route path="/tao-chibi" element={<Customizer />} />
          <Route path="/gio-hang" element={<Cart />} />
          <Route path="/dat-hang" element={<Checkout />} />
          <Route path="/dat-hang/thanh-cong" element={<OrderDone />} />
          <Route path="/dang-nhap" element={<Auth />} />
          <Route path="/tai-khoan" element={<Account />} />
          <Route path="/tra-cuu" element={<Track />} />
          <Route path="/admin" element={admin(<AdminDashboard />)} />
          <Route path="/admin/don-hang" element={admin(<AdminOrders />)} />
          <Route path="/admin/tuy-chon" element={admin(<AdminCustomizer />)} />
          <Route path="/admin/khach-hang" element={admin(<AdminCustomers />)} />
          <Route path="/admin/san-pham" element={admin(<AdminProducts />)} />
          <Route path="/admin/cai-dat" element={admin(<AdminSettings />)} />
        </Routes>
      </Suspense>
    </>
  );
}
