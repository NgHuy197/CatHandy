import { useSyncExternalStore } from 'react';
import { api } from './api';

const KEY = 'cat-handy-cart';

const EMPTY = { items: [], lastOrder: null };

// Dropped when a saved cart loads: items from older versions of the site that lack what the order API needs,
// and the design-sample item an earlier build pre-filled every new cart with.
const keep = (it) => it.id !== 'sample-custom' && (it.isCustom ? !!it.design : !!it.slug);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...saved, items: (saved.items || []).filter(keep) } : EMPTY;
  } catch {
    return EMPTY;
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
