import { useSyncExternalStore } from 'react';
import { api } from './api';

// The signed-in user, shared by every page. user is undefined while the first /auth/me is in flight.
let state = { user: undefined };
const listeners = new Set();

function set(user) {
  state = { user };
  listeners.forEach((fn) => fn());
}

api('/auth/me').then(
  (d) => set(d.user),
  () => set(null),
);

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const useAuth = () => useSyncExternalStore(subscribe, () => state);

const signedIn = (d) => {
  set(d.user);
  return d.user;
};

export const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(signedIn);

export const register = (name, email, password) =>
  api('/auth/register', { method: 'POST', body: { name, email, password } }).then(signedIn);

export const loginWithGoogle = (credential) => api('/auth/google', { method: 'POST', body: { credential } }).then(signedIn);

export const logout = () => api('/auth/logout', { method: 'POST' }).then(() => set(null));

export const updateProfile = (patch) => api('/account', { method: 'PATCH', body: patch }).then(signedIn);

export const changePassword = (current, password) =>
  api('/account/password', { method: 'POST', body: { current, password } }).then(signedIn);
