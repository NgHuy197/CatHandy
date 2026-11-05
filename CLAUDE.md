# Cat Handy

Website e-commerce quà tặng handmade (hộp gỗ/mica chibi, quà cưới...) với trình thiết kế nhân vật chibi. Giao diện và nội dung hiển thị bằng tiếng Việt.

## Spec chức năng

Danh sách chức năng đầy đủ của dự án (storefront, admin, tính năng giai đoạn sau) nằm ở `docs/features.md`. Đây là nguồn tham chiếu chính cho phạm vi sản phẩm: khi thêm hay sửa tính năng, đối chiếu với file này trước.

@docs/features.md

## Stack và lệnh

- Vite + React 19 + react-router-dom 7, JavaScript (JSX), không dùng TypeScript.
- Chạy trên Cloudflare Workers: một Worker phục vụ cả bản build React (static assets) lẫn API. Chỉ `/api/*` chạy vào code Worker, các đường dẫn khác trả về `index.html` (`wrangler.jsonc`).
- API viết bằng Hono, database D1 qua Drizzle ORM. Worker không phải Node đầy đủ: tránh thư viện cần native module (bcrypt, sharp...).
- `npm install`, `npm run dev` (cổng 5173, chạy cả React, Worker và D1 local trong `.wrangler/`), `npm run build`, `npm run preview`, `npm run deploy`.
- Lần đầu chạy local: `npm run db:migrate:local` rồi `npm run db:seed:local`.
- Đổi schema: sửa `db/schema.js`, chạy `npm run db:generate` rồi `npm run db:migrate:local`. Không sửa tay file trong `migrations/`.

## Trạng thái hiện tại

Đã có khung backend. Trang đặt hàng gửi đơn lên `POST /api/orders` và lưu vào D1; API còn có danh sách và chi tiết sản phẩm, tra cứu đơn theo mã (bảng route trong `README.md`). Giỏ hàng vẫn nằm trong `localStorage` (`src/lib/cart.js`); catalog, tài khoản, tra cứu đơn và các màn admin chưa gọi API mà vẫn dùng dữ liệu mẫu. Chưa có đăng nhập nên chưa có API admin. `database_id` trong `wrangler.jsonc` còn là placeholder cho tới khi tạo D1 thật trên Cloudflare (các bước trong `README.md`). Các tính năng trong spec như thông báo Telegram, đăng nhập Google vẫn là việc cần làm.

## Cấu trúc

- `src/App.jsx`: khai báo toàn bộ route.
- `src/pages/`: mỗi route một file; trang admin có tiền tố `Admin`.
- `src/components/`: thành phần dùng chung (`Chibi.jsx` và `MiniChibi.jsx` vẽ nhân vật, `SiteHeader`, `SiteFooter`, `AdminSidebar`).
- `src/lib/`: logic dùng chung (`cart.js`, `chibi.js`).
- `src/styles/cat.css`: toàn bộ CSS.
- `worker/index.js`: API Hono, toàn bộ route nằm dưới `/api`.
- `db/schema.js`: schema Drizzle (`products`, `orders`, `order_items`). `migrations/` là SQL do drizzle-kit sinh, `db/seed.sql` là catalog mẫu.
- `wrangler.jsonc`: cấu hình Worker, static assets và binding D1 (`c.env.DB` trong Hono).

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
- Server không tin giá client gửi lên: món có sẵn lấy giá từ bảng `products`. Giá chibi tự thiết kế hiện vẫn do trình duyệt tính; khi chuyển giá sang cấu hình admin thì tính lại ở server.
- Mã đơn là chuỗi ngẫu nhiên (`CH-XXXXXX`), không tăng dần, và API tra cứu công khai không trả về tên, số điện thoại hay địa chỉ của khách.
- Mục 4 của spec ("Tính năng mở rộng") là giai đoạn sau, không làm trừ khi được yêu cầu.
