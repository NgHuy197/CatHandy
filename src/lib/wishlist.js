import { useEffect, useSyncExternalStore } from 'react';
import { api } from './api';
import { useAuth } from './auth';

// Slugs on the signed-in visitor's wishlist, shared by the catalog, product and account pages.
let state = { userId: null, slugs: new Set() };
const listeners = new Set();

function set(next) {
  state = next;
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useWishlist() {
  const { user } = useAuth();
  const snap = useSyncExternalStore(subscribe, () => state);
  useEffect(() => {
    if (!user) {
      if (state.userId) set({ userId: null, slugs: new Set() });
    } else if (state.userId !== user.id) {
      set({ userId: user.id, slugs: new Set() });
      api('/account/wishlist').then(
        (list) => set({ userId: user.id, slugs: new Set(list.map((p) => p.slug)) }),
        () => {},
      );
    }
  }, [user]);
  return { signedIn: !!user, has: (slug) => snap.slugs.has(slug) };
}

// Optimistic: the heart flips at once and flips back if the request fails.
export async function toggleWish(slug) {
  const had = state.slugs.has(slug);
  const flip = (on) => {
    const slugs = new Set(state.slugs);
    on ? slugs.add(slug) : slugs.delete(slug);
    set({ ...state, slugs });
  };
  flip(!had);
  try {
    await api('/account/wishlist/' + slug, { method: had ? 'DELETE' : 'PUT' });
  } catch (err) {
    flip(had);
    throw err;
  }
}
