import { useSyncExternalStore } from 'react';
import { api } from './api';

// Public settings from GET /api/config: the Google client id and the shop's contact details.
const EMPTY = { googleClientId: null, shop: {} };
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
