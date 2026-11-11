export const formatPrice = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

// Phone numbers are stored and looked up without spaces, dots or dashes, and with the Vietnam +84 prefix written as 0,
// so an order placed as "+84 909 000 111" is found again by "0909000111".
export const normalizePhone = (s) => {
  const p = String(s || '').replace(/[^\d+]/g, '');
  if (p.startsWith('+84')) return '0' + p.slice(3);
  if (p.startsWith('84') && (p.length === 11 || p.length === 12)) return '0' + p.slice(2);
  return p;
};

export const mediaUrl = (key) => (key ? '/api/media/' + key : null);

// D1 timestamps are UTC "YYYY-MM-DD HH:MM:SS"; shown in Vietnam time.
const parseUtc = (s) => new Date(String(s).replace(' ', 'T') + (/Z$|[+-]\d\d:?\d\d$/.test(s) ? '' : 'Z'));
export const formatDate = (s) => parseUtc(s).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
export const formatDateTime = (s) =>
  parseUtc(s).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
