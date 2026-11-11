import { useSyncExternalStore } from 'react';
import { api } from './api';
import { POLICIES } from '../../shared/policies';

// Public settings from GET /api/config: the Google client id, the shop's contact details and which policy pages have text.
const EMPTY = { googleClientId: null, shop: {}, policies: [] };
let state = EMPTY;
const listeners = new Set();

export function refreshConfig() {
  return api('/config').then(
    (c) => {
      state = c;
      listeners.forEach((fn) => fn());
    },
    () => {},
  );
}
refreshConfig();

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const useConfig = () => useSyncExternalStore(subscribe, () => state);
export const useShop = () => useConfig().shop;
// The policy pages (from shared/policies.js) the admin has filled in.
export const useFilledPolicies = () => {
  const slugs = useConfig().policies || [];
  return POLICIES.filter((p) => slugs.includes(p.slug));
};
