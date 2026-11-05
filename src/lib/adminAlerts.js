import { useEffect, useSyncExternalStore } from 'react';
import { api } from './api';

// Count of orders no admin has opened yet, polled while an admin page is open.
const POLL_MS = 30000;
let unseen = 0;
let watchers = 0;
let timer = null;
const listeners = new Set();

export function refreshUnseen() {
  return api('/admin/summary').then(
    (d) => {
      if (d.unseen !== unseen) {
        unseen = d.unseen;
        listeners.forEach((fn) => fn());
      }
    },
    () => {},
  );
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useUnseenOrders() {
  useEffect(() => {
    if (watchers++ === 0) {
      refreshUnseen();
      timer = setInterval(refreshUnseen, POLL_MS);
    }
    return () => {
      if (--watchers === 0) clearInterval(timer);
    };
  }, []);
  return useSyncExternalStore(subscribe, () => unseen);
}
