import { useSyncExternalStore } from 'react';
import { api } from './api';
import { chibi } from './chibi';

const KEY = 'cat-handy-cart';

// Sample items from the design, shown until the visitor changes the cart.
const SAMPLE_CHARS = [
  { hair: 'long', outfit: 'aodai', outfitColor: '#c9484f', accessory: 'bouquet' },
  { skin: '#e8b896', hair: 'short', outfit: 'vest', outfitColor: '#34405a', face: 'wink' },
];
const SAMPLE = {
  items: [
    {
      id: 'sample-custom',
      isCustom: true,
      title: 'Hộp gỗ chibi',
      sub: '2 nhân vật',
      price: 474000,
      qty: 1,
      wash: '#fbeab4',
      a: chibi(SAMPLE_CHARS[0]),
      b: chibi(SAMPLE_CHARS[1]),
      lines: [
        'Nhân vật 1: Tóc dài đen, da be, cười nhẹ, áo dài đỏ, bó hoa',
        'Nhân vật 2: Tóc ngắn đen, da nâu sáng, nháy mắt, vest xanh navy',
      ],
      note: '',
      design: { box: 'wood', count: 2, chars: SAMPLE_CHARS.map(chibi), note: '' },
    },
    {
      id: 'chibi-vest-xanh',
      isCustom: false,
      slug: 'chibi-vest-xanh',
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

// Items saved by an older version of the site lack what the order API needs; they are dropped.
const orderable = (it) => (it.isCustom ? !!it.design : !!it.slug);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...saved, items: saved.items.filter(orderable) } : SAMPLE;
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

// variant is { color, size } as the product's variants define them; variantLabel is shown in the cart.
export function addReadyItem({ slug, title, sub, price, wash, a, b, variant, variantLabel, qty = 1 }) {
  const id = [slug, variant?.color, variant?.size].filter(Boolean).join('|');
  const found = data.items.find((it) => it.id === id);
  if (found) return setQty(id, found.qty + qty);
  const item = { id, isCustom: false, slug, title, sub: variantLabel ? `${sub}, ${variantLabel}` : sub, price, wash, a, b, variant, qty };
  update({ items: [...data.items, item] });
}

// item.design is { box, count, chars, note } as the customizer built it; the server prices it again.
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

// Saves the order through the Worker, which prices every item again and assigns the order code.
// Throws with a message to show the visitor when the order is refused or the network fails.
export async function placeOrder(customer) {
  const items = data.items.map((it) =>
    it.isCustom
      ? { isCustom: true, qty: it.qty, design: it.design, title: it.title }
      : { slug: it.slug, variant: it.variant, qty: it.qty, title: it.title },
  );
  const body = await api('/orders', { method: 'POST', body: { customer, items } });
  const lastOrder = {
    code: body.code,
    customer,
    items: body.items.map(
      (it) => `${it.title}${it.variant ? `, ${it.variant.toLowerCase()}` : ''} (${it.isCustom ? 'chibi tự thiết kế' : 'có sẵn'})`,
    ),
    total: body.total,
  };
  update({ items: [], lastOrder });
}
