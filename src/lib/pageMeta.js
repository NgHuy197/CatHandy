import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'Cat Handy';
const DEFAULT_DESC = 'Quà tặng chibi handmade: hộp gỗ, hộp mica, quà cưới. Tự thiết kế nhân vật, xem giá ngay, duyệt ảnh trước khi giao.';

// Tab title and description per route; the first prefix that matches wins.
const PAGES = [
  ['/admin', 'Quản trị'],
  ['/san-pham/', null],
  ['/chinh-sach/', null],
  ['/san-pham', 'Sản phẩm', 'Hộp gỗ chibi, hộp mica, quà cưới và phụ kiện làm sẵn hoặc đặt làm theo ý bạn.'],
  ['/tao-chibi', 'Tự tay tạo chibi', 'Chọn hộp, tóc, trang phục và phụ kiện, xem hình và giá đổi ngay khi bạn chọn.'],
  ['/gio-hang', 'Giỏ hàng'],
  ['/dat-hang/thanh-cong', 'Đã gửi đơn'],
  ['/dat-hang', 'Đặt hàng'],
  ['/dang-nhap', 'Đăng nhập'],
  ['/tai-khoan', 'Tài khoản'],
  ['/tra-cuu', 'Tra cứu đơn hàng', 'Xem tiến độ đơn và duyệt ảnh sản phẩm hoàn thiện bằng số điện thoại hoặc mã đơn.'],
];

export function setPageMeta(title, description = DEFAULT_DESC) {
  document.title = title ? `${title} | ${SITE}` : `${SITE} | Quà chibi handmade tự thiết kế`;
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.appendChild(tag);
  }
  tag.content = description;
}

// Sets the generic title on every navigation; pages with their own (a product, the 404 page) set it themselves.
export default function usePageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pathname === '/' ? null : PAGES.find(([prefix]) => pathname.startsWith(prefix));
    if (pathname !== '/' && (!page || page[1] === null)) return;
    setPageMeta(page?.[1], page?.[2]);
  }, [pathname]);
}
