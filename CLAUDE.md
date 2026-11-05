# Cat Handy

Website e-commerce quà tặng handmade (hộp gỗ/mica chibi, quà cưới...) với trình thiết kế nhân vật chibi. Giao diện và nội dung hiển thị bằng tiếng Việt.

## Spec chức năng

Danh sách chức năng đầy đủ của dự án (storefront, admin, tính năng giai đoạn sau) nằm ở `docs/features.md`. Đây là nguồn tham chiếu chính cho phạm vi sản phẩm: khi thêm hay sửa tính năng, đối chiếu với file này trước.

@docs/features.md

## Stack và lệnh

- Vite + React 19 + react-router-dom 7, JavaScript (JSX), không dùng TypeScript.
- `npm install`, `npm run dev` (cổng 5173), `npm run build`, `npm run preview`.

## Trạng thái hiện tại

Mới có giao diện, chưa có backend. Giỏ hàng và đơn gần nhất lưu trong `localStorage` (`src/lib/cart.js`); catalog, tài khoản, tra cứu đơn và các màn admin dùng dữ liệu mẫu. Các tính năng trong spec như thông báo Telegram, đăng nhập Google, lưu đơn thật vẫn là việc cần làm sau khi có backend.

## Cấu trúc

- `src/App.jsx`: khai báo toàn bộ route.
- `src/pages/`: mỗi route một file; trang admin có tiền tố `Admin`.
- `src/components/`: thành phần dùng chung (`Chibi.jsx` và `MiniChibi.jsx` vẽ nhân vật, `SiteHeader`, `SiteFooter`, `AdminSidebar`).
- `src/lib/`: logic dùng chung (`cart.js`, `chibi.js`).
- `src/styles/cat.css`: toàn bộ CSS.

## Route và mục trong spec

| Route | File | Mục spec |
| --- | --- | --- |
| `/` | `Main.jsx` | 2.1 Trang chủ |
| `/san-pham`, `/san-pham/:slug` | `Catalog.jsx`, `Product.jsx` | 2.2 Tìm kiếm và chi tiết sản phẩm |
| `/tao-chibi` | `Customizer.jsx` | 1. Trình thiết kế chibi |
| `/gio-hang`, `/dat-hang`, `/dat-hang/thanh-cong` | `Cart.jsx`, `Checkout.jsx`, `OrderDone.jsx` | 2.4 Đặt hàng (không tích hợp thanh toán) |
| `/dang-nhap`, `/tai-khoan` | `Auth.jsx`, `Account.jsx` | 2.3 Tài khoản |
| `/tra-cuu` | `Track.jsx` | 2.5 Tra cứu đơn và duyệt ảnh |
| `/admin` | `AdminDashboard.jsx` | 3.5 Báo cáo |
| `/admin/don-hang` | `AdminOrders.jsx` | 3.1, 3.4 Đơn hàng và tiến độ chế tác |
| `/admin/tuy-chon` | `AdminCustomizer.jsx` | 3.3 Cấu hình custom và giá phụ phí |
| `/admin/khach-hang` | `AdminCustomers.jsx` | 3.2 Khách hàng |
| `/admin/san-pham` | `AdminProducts.jsx` | 3.5 Sản phẩm có sẵn |

## Quy ước

- Không tích hợp cổng thanh toán: shop liên hệ khách qua Zalo hoặc điện thoại để chốt đơn và hướng dẫn thanh toán.
- Giá trong trình thiết kế là giá nền theo loại hộp cộng phụ phí từng tùy chọn, và theo spec do admin cấu hình. Hiện các hằng số giá (`BOX`, `SECOND`, `OUT`, `ACC`, `GL`, `BE`) còn hard-code trong `src/pages/Customizer.jsx` làm dữ liệu mẫu; khi có backend thì chuyển sang đọc từ cấu hình admin (`/admin/tuy-chon`), đừng thêm hằng số giá mới rải rác ở nơi khác.
- Mục 4 của spec ("Tính năng mở rộng") là giai đoạn sau, không làm trừ khi được yêu cầu.
