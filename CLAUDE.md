# Cat Handy

Website e-commerce quà tặng handmade (hộp gỗ/mica chibi, quà cưới...) với trình thiết kế nhân vật chibi. Giao diện và nội dung hiển thị bằng tiếng Việt.

## Spec chức năng

Danh sách chức năng đầy đủ của dự án (storefront, admin, tính năng giai đoạn sau) nằm ở `docs/features.md`. Đây là nguồn tham chiếu chính cho phạm vi sản phẩm: khi thêm hay sửa tính năng, đối chiếu với file này trước.

@docs/features.md

## Stack và lệnh

- Vite + React 19 + react-router-dom 7, JavaScript (JSX), không dùng TypeScript.
- Chạy trên Cloudflare Workers: một Worker phục vụ cả bản build React (static assets) lẫn API. Chỉ `/api/*` chạy vào code Worker, các đường dẫn khác trả về `index.html` (`wrangler.jsonc`).
- API viết bằng Hono, database D1 qua Drizzle ORM. Worker không phải Node đầy đủ: tránh thư viện cần native module (bcrypt, sharp...).
- File upload (ảnh sản phẩm, ảnh hoàn thiện đơn, ảnh lớp tùy chọn, ảnh đánh giá) lưu trong R2 (`c.env.MEDIA`), phục vụ qua `/api/media/<key>`.
- `npm install`, `npm run dev` (cổng 5173, chạy cả React, Worker, D1 và R2 local trong `.wrangler/`), `npm run build`, `npm run preview`, `npm run deploy`.
- Lần đầu chạy local: `cp .dev.vars.example .dev.vars`, `npm run db:migrate:local`, `npm run db:seed:local`.
- Đổi schema: sửa `db/schema.js`, chạy `npm run db:generate` rồi `npm run db:migrate:local`. Không sửa tay file trong `migrations/`.
- Cấu hình (`ADMIN_EMAILS`, `GOOGLE_CLIENT_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SITE_URL`): `.dev.vars` khi chạy local, `wrangler secret put` khi deploy. Mô tả trong `.dev.vars.example`.

## Trạng thái hiện tại

Đã làm xong backend cho mục 1 đến 3 của spec và các trang đều gọi API, không còn dữ liệu mẫu (trừ nội dung giới thiệu tĩnh ở trang chủ). Giỏ hàng nằm trong `localStorage` (`src/lib/cart.js`) và bắt đầu rỗng. Đăng nhập bằng email/mật khẩu hoặc Google One-Tap (cần `GOOGLE_CLIENT_ID`). Thông tin liên hệ của shop do admin nhập ở `/admin/cai-dat`; mục nào để trống thì site ẩn đi. Mục "Hình thật từ những người đã nhận quà" ở trang chủ ẩn cho tới khi `CUSTOMER_PHOTOS` trong `Main.jsx` có ảnh thật; số năm hoạt động của shop chưa hiển thị vì chưa có số liệu. Chưa có: quên mật khẩu (cần dịch vụ gửi email). `database_id` trong `wrangler.jsonc` còn là placeholder cho tới khi tạo D1 thật (các bước trong `README.md`).

## Cấu trúc

- `src/App.jsx`: khai báo toàn bộ route.
- `src/pages/`: mỗi route một file; trang admin có tiền tố `Admin`.
- `src/components/`: thành phần dùng chung (`Chibi.jsx` và `MiniChibi.jsx` vẽ nhân vật, chồng thêm ảnh lớp qua prop `layers`; `SiteHeader`, `SiteFooter`, `AdminSidebar`, `RequireAdmin`, `GoogleSignIn`).
- `src/lib/`: logic dùng chung phía trình duyệt. `api.js` (gọi API, hook `useApi`), `auth.js` (người đang đăng nhập), `config.js` (Google client id, thông tin liên hệ shop), `cart.js`, `wishlist.js`, `adminAlerts.js` (đếm đơn chưa xem), `products.js`, `preview.js` (xuất ảnh xem trước PNG), `pageMeta.js` (tiêu đề tab và meta description theo route).
- `src/App.jsx` tải trình thiết kế và các trang admin theo kiểu lazy; trang mới nặng hoặc ít khách mở cũng nên lazy.
- `src/styles/cat.css`: toàn bộ CSS.
- `shared/`: code dùng chung cho cả trình duyệt và Worker. `customizer.js` (tính giá, mô tả nhân vật, ảnh lớp), `orders.js` (danh sách trạng thái đơn), `format.js`.
- `worker/index.js`: gắn các route trong `worker/routes/` (`auth`, `account`, `catalog`, `orders`, `admin`) dưới `/api`. `worker/lib/`: đăng nhập và session, upload R2, Telegram, đọc cấu hình customizer, thông tin shop (`shop.js`), giới hạn tần suất (`limits.js`).
- `db/schema.js`: schema Drizzle. `migrations/` là SQL do drizzle-kit sinh, `db/seed.sql` là dữ liệu khởi đầu (sản phẩm, tùy chọn custom, giá, mẫu gợi ý).
- `wrangler.jsonc`: cấu hình Worker, static assets, binding D1 (`c.env.DB`), R2 (`c.env.MEDIA`) và các bộ giới hạn tần suất (`RL_*`).

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
| `/admin/cai-dat` | `AdminSettings.jsx` | 2.1 Footer và thông tin liên hệ, 2.5 Nút liên hệ nhanh |

## Quy ước

- Không tích hợp cổng thanh toán: shop liên hệ khách qua Zalo hoặc điện thoại để chốt đơn và hướng dẫn thanh toán.
- Giá trong trình thiết kế là giá nền theo loại hộp cộng phụ phí từng tùy chọn, lấy từ bảng `options` và `settings` do admin sửa ở `/admin/tuy-chon`. Mọi phép tính giá custom đi qua `quoteDesign` trong `shared/customizer.js`; đừng thêm hằng số giá ở nơi khác.
- Server không tin giá client gửi lên: món có sẵn lấy giá từ bảng `products` (theo cỡ nếu có), chibi tự thiết kế được tính lại bằng `quoteDesign` với cấu hình hiện tại.
- Mã đơn là chuỗi ngẫu nhiên (`CH-XXXXXX`), không tăng dần, và API tra cứu công khai không trả về tên, số điện thoại hay địa chỉ của khách.
- Tra cứu bằng SĐT chỉ trả mã đơn bị che. Duyệt hoặc yêu cầu chỉnh ảnh cần cả mã đơn lẫn SĐT khớp nhau (hoặc đang đăng nhập đúng tài khoản đặt đơn), để người chỉ biết SĐT không thao tác thay khách được.
- Mỗi route admin trong Worker đều qua `requireAdmin`; `RequireAdmin` phía React chỉ để điều hướng, không thay cho kiểm tra ở server.
- Quyền admin: `ADMIN_EMAILS` chỉ nâng quyền khi đăng nhập Google (email đã được Google xác minh). Đăng ký bằng mật khẩu không bao giờ được nâng quyền, vì không ai xác minh email đó. Cấp quyền cho tài khoản mật khẩu bằng lệnh SQL trong `README.md`.
- Đánh giá sản phẩm: mỗi tài khoản một đánh giá mỗi sản phẩm (gửi lại thì thay), chỉ khi đơn có sản phẩm đó đã giao vận chuyển.
- Route công khai có thể bị spam (đặt đơn, đăng nhập, tra cứu, upload) phải đi qua middleware trong `worker/lib/limits.js`.
- Một câu lệnh D1 tối đa 100 tham số: insert nhiều dòng thì chia nhóm, `inArray` thì giữ danh sách dưới 100 phần tử.
- Đơn do tài khoản admin đặt được lưu như đơn mua nhanh theo SĐT, vì thường là admin nhập hộ đơn cho khách.
- Mục 4 của spec ("Tính năng mở rộng") là giai đoạn sau, không làm trừ khi được yêu cầu.
