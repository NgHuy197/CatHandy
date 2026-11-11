import { useEffect, useState, useSyncExternalStore } from 'react';
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
// replaceId puts the design in place of that cart item (keeping its quantity) instead of adding a new one.
export function addCustomItem(item, replaceId) {
  const old = replaceId && data.items.find((it) => it.id === replaceId);
  const next = { ...item, id: 'custom-' + Date.now(), isCustom: true, qty: old?.qty ?? 1 };
  update({ items: old ? data.items.map((it) => (it === old ? next : it)) : [...data.items, next] });
  return next.id;
}

export function setQty(id, qty) {
  const next = Math.max(1, Math.min(9, qty));
  update({ items: data.items.map((it) => (it.id === id ? { ...it, qty: next } : it)) });
}

export function removeItem(id) {
  update({ items: data.items.filter((it) => it.id !== id) });
}

// What the order API needs to price an item; the price saved in the cart is never sent.
const toOrderItem = (it) =>
  it.isCustom
    ? { isCustom: true, qty: it.qty, design: it.design, title: it.title }
    : { slug: it.slug, variant: it.variant, qty: it.qty, title: it.title };

// Prices are saved when an item goes into the cart, and the admin may change them afterwards. This asks the Worker
// for today's prices and stores any that differ. Resolves true when one changed; if the check fails the saved
// prices stay, since placing the order prices everything again anyway.
export async function refreshPrices() {
  const sent = data.items;
  if (!sent.length) return false;
  let body;
  try {
    body = await api('/orders/quote', { method: 'POST', body: { items: sent.map(toOrderItem) } });
  } catch {
    return false;
  }
  // Matched by id: the visitor may have changed quantities or removed items while the request was out.
  const fresh = new Map(sent.map((it, i) => [it.id, body.items?.[i]?.price]));
  let changed = false;
  const items = data.items.map((it) => {
    const price = fresh.get(it.id);
    if (typeof price !== 'number' || price === it.price) return it;
    changed = true;
    return { ...it, price };
  });
  if (changed) update({ items });
  return changed;
}

// For pages that show cart prices: refreshes them once on open. True once a price turned out to have changed.
export function useFreshPrices() {
  const [repriced, setRepriced] = useState(false);
  useEffect(() => {
    refreshPrices().then((changed) => changed && setRepriced(true));
  }, []);
  return repriced;
}

// Style of the note those pages show when that happens.
export const repricedBox = { background: 'var(--wash-butter)', borderRadius: '12px', padding: '12px 16px' };

// Saves the order through the Worker, which prices every item again and assigns the order code.
// Throws with a message to show the visitor when the order is refused or the network fails.
export async function placeOrder(customer) {
  const items = data.items.map(toOrderItem);
  const body = await api('/orders', { method: 'POST', body: { customer, items } });
  const lastOrder = {
    code: body.code,
    customer,
    items: body.items.map(
      (it) => `${it.qty} x ${it.title}${it.variant ? `, ${it.variant.toLowerCase()}` : ''} (${it.isCustom ? 'chibi tự thiết kế' : 'có sẵn'})`,
    ),
    total: body.total,
  };
  update({ items: [], lastOrder });
}
