import { useCallback, useEffect, useState } from 'react';

// Calls the Worker API (worker/index.js). Throws an Error whose message is ready to show the visitor.
export async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Không kết nối được tới shop, bạn kiểm tra mạng rồi thử lại nhé.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Có lỗi xảy ra, bạn thử lại sau nhé.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export function upload(path, file) {
  const form = new FormData();
  form.append('file', file);
  return api(path, { method: 'POST', body: form });
}

// GET `path` on mount and whenever it changes; a null path waits. setData lets a page apply its own edits.
export function useApi(path) {
  const [state, setState] = useState({ data: undefined, error: null, loading: !!path });
  const load = useCallback(() => {
    if (!path) return Promise.resolve();
    setState((s) => ({ ...s, loading: true, error: null }));
    return api(path).then(
      (data) => setState({ data, error: null, loading: false }),
      (error) => setState((s) => ({ ...s, error, loading: false })),
    );
  }, [path]);
  useEffect(() => {
    load();
  }, [load]);
  const setData = useCallback((fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })), []);
  return { ...state, reload: load, setData };
}
