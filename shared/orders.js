// Crafting workflow, in order. `group` drives the admin list filters.
export const ORDER_STATUSES = [
  { code: 'new', label: 'Đơn mới', short: 'Mới', tag: 'tag t-danger', group: 'new' },
  { code: 'preparing', label: 'Đang chuẩn bị nguyên liệu', short: 'Chuẩn bị', tag: 'tag t-sand', group: 'craft' },
  { code: 'crafting', label: 'Đang làm đồ', short: 'Đang làm đồ', tag: 'tag t-butter', group: 'craft' },
  { code: 'finished', label: 'Đã hoàn thiện, gửi ảnh duyệt', short: 'Đã hoàn thiện', tag: 'tag t-lav', group: 'craft' },
  { code: 'awaiting', label: 'Chờ khách duyệt', short: 'Chờ duyệt', tag: 'tag t-powder', group: 'wait' },
  { code: 'revision', label: 'Chỉnh sửa theo yêu cầu', short: 'Chỉnh sửa', tag: 'tag', group: 'craft' },
  { code: 'approved', label: 'Khách đã duyệt, chờ giao', short: 'Đã duyệt', tag: 'tag t-mint', group: 'wait' },
  { code: 'shipped', label: 'Đã giao bên vận chuyển', short: 'Đã giao VC', tag: 'tag t-ok', group: 'done' },
];

export const statusInfo = (code) => ORDER_STATUSES.find((s) => s.code === code) || ORDER_STATUSES[0];

export const STATUS_CODES = ORDER_STATUSES.map((s) => s.code);

// Steps the customer sees on the tracking page, and which one an order is on (5 = all done).
export const TRACK_STEPS = [
  'Đang chuẩn bị nguyên liệu',
  'Đang làm đồ',
  'Đã hoàn thiện, gửi ảnh duyệt',
  'Chờ bạn duyệt ảnh',
  'Đã giao bên vận chuyển',
];
export const trackStep = (status) =>
  ({ new: 0, preparing: 0, crafting: 1, finished: 2, awaiting: 3, revision: 3, approved: 4, shipped: 5 })[status] ?? 0;
