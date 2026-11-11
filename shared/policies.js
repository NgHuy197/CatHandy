// Policy pages the admin writes at /admin/cai-dat and the site shows at /chinh-sach/<slug>.
// Each one is stored as its own settings row ("policy:<key>"); a page left empty has no row and is hidden.
export const POLICIES = [
  { key: 'privacy', slug: 'bao-mat', title: 'Chính sách bảo mật thông tin' },
  { key: 'returns', slug: 'doi-tra', title: 'Chính sách đổi trả và hoàn tiền' },
  { key: 'shipping', slug: 'van-chuyen', title: 'Chính sách vận chuyển' },
  { key: 'payment', slug: 'thanh-toan', title: 'Hướng dẫn thanh toán' },
];

export const POLICY_MAX = 30000;

export const policyBySlug = (slug) => POLICIES.find((p) => p.slug === slug);
export const policyPath = (key) => '/chinh-sach/' + POLICIES.find((p) => p.key === key).slug;
