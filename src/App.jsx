import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Main from './pages/Main';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Customizer from './pages/Customizer';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDone from './pages/OrderDone';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Track from './pages/Track';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminCustomizer from './pages/AdminCustomizer';
import AdminCustomers from './pages/AdminCustomers';
import AdminProducts from './pages/AdminProducts';
import RequireAdmin from './components/RequireAdmin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
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
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/don-hang" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
        <Route path="/admin/tuy-chon" element={<RequireAdmin><AdminCustomizer /></RequireAdmin>} />
        <Route path="/admin/khach-hang" element={<RequireAdmin><AdminCustomers /></RequireAdmin>} />
        <Route path="/admin/san-pham" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
      </Routes>
    </>
  );
}
