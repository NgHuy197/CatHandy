import { useSyncExternalStore } from 'react';
import { chibi } from './chibi';

const KEY = 'cat-handy-cart';

// Sample items from the design, shown until the visitor changes the cart.
const SAMPLE = {
  items: [
    {
      id: 'sample-custom',
      isCustom: true,
      title: 'Cặp đôi áo dài',
      sub: 'Hộp gỗ chibi, 2 nhân vật',
      price: 474000,
      qty: 1,
      wash: '#fddede',
      a: chibi({ hair: 'long', outfitColor: '#c9484f', accessory: 'bouquet' }),
      b: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', face: 'wink' }),
      lines: ['Nhân vật 1: Tóc dài đen, áo dài đỏ, bó hoa', 'Nhân vật 2: Tóc ngắn đen, vest xanh navy'],
      note: '',
    },
    {
      id: 'Chibi vest xanh',
      isCustom: false,
      title: 'Chibi vest xanh',
      sub: 'Hộp mica chibi, 1 nhân vật',
      price: 289000,
      qty: 1,
      wash: '#d6ebfa',
      a: chibi({ skin: '#e8b896', outfit: 'vest', outfitColor: '#34405a', glasses: true }),
    },
  ],
  lastOrder: null,
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || SAMPLE;
  } catch {
    return SAMPLE;
  }
}

let data = load();
const listeners = new Set();

function update(patch) {
  data = { ...data, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Private windows can refuse storage; the cart still works until reload.
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const useCart = () => useSyncExternalStore(subscribe, () => data);

export const cartCount = (items) => items.reduce((s, it) => s + it.qty, 0);
export const cartTotal = (items) => items.reduce((s, it) => s + it.price * it.qty, 0);

export function addReadyItem({ title, sub, price, wash, a, b }) {
  const found = data.items.find((it) => it.id === title);
  if (found) return setQty(title, found.qty + 1);
  update({ items: [...data.items, { id: title, isCustom: false, title, sub, price, wash, a, b, qty: 1 }] });
}

export function addCustomItem(item) {
  const id = 'custom-' + Date.now();
  update({ items: [...data.items, { ...item, id, isCustom: true, qty: 1 }] });
  return id;
}

export function setQty(id, qty) {
  const next = Math.max(1, Math.min(9, qty));
  update({ items: data.items.map((it) => (it.id === id ? { ...it, qty: next } : it)) });
}

export function removeItem(id) {
  update({ items: data.items.filter((it) => it.id !== id) });
}

// Saves the order in D1 through the Worker (worker/index.js), which sets the code and the final total.
// Throws with a message to show the visitor when the order is refused or the network fails.
export async function placeOrder(customer) {
  let res;
  try {
    res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer, items: data.items }),
    });
  } catch {
    throw new Error('Không kết nối được tới shop, bạn kiểm tra mạng rồi thử lại nhé.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Không gửi được đơn, bạn thử lại sau nhé.');

  const lastOrder = {
    code: body.code,
    customer,
    items: body.items.map((it) => `${it.title} (${it.isCustom ? 'chibi tự thiết kế' : 'có sẵn'})`),
    total: body.total,
  };
  update({ items: [], lastOrder });
}
