import { formatPrice } from '../../shared/format';

// Sends a Telegram message to the shop owner in the background, so the customer's request never waits on it.
// Does nothing until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
export function notifyShop(c, text) {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = c.env;
  if (!token || !chatId) return;
  const send = fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  })
    .then(async (res) => {
      if (!res.ok) console.error('Telegram', res.status, await res.text());
    })
    .catch((err) => console.error('Telegram', err));
  c.executionCtx.waitUntil(send);
}

export const adminOrderUrl = (c, code) =>
  `${c.env.SITE_URL || new URL(c.req.url).origin}/admin/don-hang?ma=${encodeURIComponent(code)}`;

export function newOrderMessage(c, order, lines) {
  const items = lines.flatMap((l) => {
    const head = `${l.qty} x ${l.title}${l.variant ? ` (${l.variant})` : ''}${l.isCustom ? `, ${l.sub}` : ''}: ${formatPrice(l.unitPrice * l.qty)}`;
    if (!l.isCustom) return [head];
    return [head, ...l.design.lines.map((d) => '   ' + d), ...(l.design.note ? ['   Ghi chú thiết kế: ' + l.design.note] : [])];
  });
  return [
    `Đơn mới ${order.code}: ${formatPrice(order.total)}`,
    `Khách: ${order.customerName}`,
    `SĐT: ${order.phone}`,
    `Địa chỉ: ${order.address}`,
    ...(order.note ? [`Ghi chú: ${order.note}`] : []),
    '',
    ...items,
    '',
    `Mở đơn: ${adminOrderUrl(c, order.code)}`,
  ].join('\n');
}
