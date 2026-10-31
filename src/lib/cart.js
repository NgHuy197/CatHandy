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
  orderCount: 0,
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

// No order API yet: the order only lives in this browser. Replace with a POST when the backend exists.
export function placeOrder(customer) {
  const orderCount = data.orderCount + 1;
  const lastOrder = {
    code: 'CH-' + String(orderCount).padStart(4, '0'),
    customer,
    items: data.items.map((it) => `${it.title} (${it.isCustom ? 'chibi tự thiết kế' : 'có sẵn'})`),
    total: cartTotal(data.items),
  };
  update({ items: [], lastOrder, orderCount });
}
