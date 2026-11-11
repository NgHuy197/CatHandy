// Starting drafts for the policy pages, inserted by the "Chèn bản mẫu" button in /admin/cai-dat.
// They describe how this site actually handles data and orders; the shop fills in the [bracketed] parts and
// should have them checked against current Vietnamese rules before publishing.
export const POLICY_TEMPLATES = {
  privacy: `Cat Handy ([tên chủ shop hoặc hộ kinh doanh]) tôn trọng và bảo vệ thông tin cá nhân của khách hàng. Trang này cho biết shop thu thập thông tin gì, dùng vào việc gì và bạn có những quyền gì.

## 1. Thông tin shop thu thập
- Khi đặt hàng: họ tên, số điện thoại, địa chỉ nhận hàng và ghi chú bạn nhập, cùng bản thiết kế chibi bạn chọn.
- Khi tạo tài khoản: họ tên, email và mật khẩu (mật khẩu được mã hóa, shop không xem được). Nếu đăng nhập bằng Google, shop nhận họ tên và email từ Google.
- Khi viết đánh giá: nội dung và ảnh bạn gửi kèm.
Website không thu thập thông tin thẻ ngân hàng và không có cổng thanh toán trực tuyến.

## 2. Mục đích sử dụng
- Liên hệ với bạn qua Zalo hoặc điện thoại để chốt chi tiết, hướng dẫn thanh toán và gửi ảnh duyệt.
- Làm quà, giao hàng và hỗ trợ sau bán hàng.
- Điền sẵn thông tin cho lần đặt sau nếu bạn có tài khoản.
Shop không dùng thông tin của bạn để quảng cáo và không bán thông tin cho bất kỳ ai.

## 3. Chia sẻ thông tin
- Đơn vị vận chuyển nhận họ tên, số điện thoại và địa chỉ để giao hàng.
- Thông báo đơn mới được gửi tới chủ shop qua ứng dụng Telegram.
- Dữ liệu website được lưu trên hạ tầng của Cloudflare.
Ngoài các trường hợp trên, shop chỉ cung cấp thông tin khi cơ quan nhà nước có thẩm quyền yêu cầu theo quy định pháp luật.

## 4. Thời gian lưu trữ
Thông tin đơn hàng được lưu [số năm] năm để phục vụ bảo hành và đối soát. Thông tin tài khoản được lưu tới khi bạn yêu cầu xóa.

## 5. Quyền của bạn
Bạn có thể xem và sửa thông tin nhận hàng trong trang Tài khoản. Bạn có quyền yêu cầu shop cung cấp, chỉnh sửa hoặc xóa thông tin cá nhân của mình, hoặc rút lại sự đồng ý, bằng cách liên hệ shop theo thông tin bên dưới. Shop phản hồi trong vòng [số ngày] ngày làm việc.

## 6. Cookie và lưu trữ trên trình duyệt
Website dùng một cookie để giữ trạng thái đăng nhập. Giỏ hàng được lưu ngay trên trình duyệt của bạn, không gửi về shop cho tới khi bạn đặt hàng.

## 7. Liên hệ
[Tên chủ shop hoặc hộ kinh doanh]
Địa chỉ: [địa chỉ]
Điện thoại / Zalo: [số điện thoại]
Email: [email]`,

  returns: `Mỗi món quà ở Cat Handy được làm thủ công theo yêu cầu riêng, nên chính sách đổi trả như sau.

## 1. Duyệt ảnh trước khi giao
Với quà tự thiết kế, shop gửi ảnh sản phẩm hoàn thiện để bạn duyệt trên trang Tra cứu đơn hoặc qua Zalo. Bạn có thể yêu cầu chỉnh sửa [số lần] lần miễn phí trước khi duyệt. Shop chỉ giao cho đơn vị vận chuyển sau khi bạn đồng ý.

## 2. Trường hợp được đổi hoặc làm lại
- Sản phẩm bị hư hỏng, vỡ trong quá trình vận chuyển.
- Sản phẩm khác với bản thiết kế bạn đã duyệt.
Bạn báo cho shop trong vòng [số ngày] ngày kể từ khi nhận hàng, kèm video mở hộp và ảnh chụp sản phẩm.

## 3. Trường hợp không áp dụng
- Bạn đổi ý sau khi đã duyệt ảnh, vì sản phẩm làm riêng theo thiết kế của bạn.
- Hư hỏng do sử dụng hoặc bảo quản không đúng cách.

## 4. Cách xử lý
Shop làm lại hoặc sửa sản phẩm miễn phí, hoặc hoàn tiền [một phần / toàn bộ] qua chuyển khoản trong vòng [số ngày] ngày làm việc, tùy theo thỏa thuận với bạn. Shop chịu phí gửi lại trong các trường hợp lỗi của shop.

## 5. Hủy đơn
Bạn có thể hủy đơn miễn phí trước khi shop bắt đầu làm. Nếu shop đã chuẩn bị nguyên liệu hoặc đang làm, [cách xử lý tiền cọc].`,

  shipping: `## 1. Thời gian làm và giao hàng
- Thời gian làm quà: khoảng [2-4] ngày sau khi chốt đơn và bạn duyệt ảnh, có thể lâu hơn vào các dịp lễ.
- Thời gian vận chuyển: [1-2] ngày nội thành, [3-5] ngày đi tỉnh, tùy đơn vị vận chuyển.

## 2. Đơn vị vận chuyển và phí
Shop gửi hàng qua [tên đơn vị vận chuyển]. Phí vận chuyển [được báo khi chốt đơn qua Zalo / miễn phí cho đơn từ ...].

## 3. Kiểm tra khi nhận hàng
Bạn nên quay video khi mở hộp để shop hỗ trợ nhanh nếu sản phẩm gặp vấn đề trong lúc vận chuyển.

## 4. Theo dõi đơn
Bạn xem tiến độ đơn ở trang Tra cứu đơn hàng bằng mã đơn hoặc số điện thoại đã đặt.`,

  payment: `Website không thu tiền trực tuyến. Sau khi bạn gửi đơn, shop liên hệ qua Zalo hoặc điện thoại để chốt chi tiết và hướng dẫn thanh toán.

## 1. Hình thức thanh toán
- Chuyển khoản ngân hàng: [tên ngân hàng], số tài khoản [số tài khoản], chủ tài khoản [tên].
- Thanh toán khi nhận hàng (COD): [có / không áp dụng, điều kiện].

## 2. Đặt cọc
Với quà tự thiết kế, shop nhận cọc [phần trăm hoặc số tiền] trước khi bắt đầu làm. Phần còn lại thanh toán [trước khi giao / khi nhận hàng].

## 3. Lưu ý
Shop chỉ nhận chuyển khoản vào tài khoản ghi ở trên và không bao giờ hỏi mật khẩu hay mã OTP của bạn.`,
};
