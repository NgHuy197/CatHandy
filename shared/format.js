export const formatPrice = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

// Phone numbers are stored and looked up without spaces, dots or dashes.
export const normalizePhone = (s) => String(s || '').replace(/[^\d+]/g, '');

export const mediaUrl = (key) => (key ? '/api/media/' + key : null);

// D1 timestamps are UTC "YYYY-MM-DD HH:MM:SS"; shown in Vietnam time.
const parseUtc = (s) => new Date(String(s).replace(' ', 'T') + (/Z$|[+-]\d\d:?\d\d$/.test(s) ? '' : 'Z'));
export const formatDate = (s) => parseUtc(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
export const formatDateTime = (s) =>
  parseUtc(s).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
