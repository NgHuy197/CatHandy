import { useCallback, useState } from 'react';

// useState with class-style partial updates, for screens that hold several related fields.
export default function useMergedState(initial) {
  const [state, set] = useState(initial);
  const setState = useCallback((patch) => set((prev) => ({ ...prev, ...patch })), []);
  return [state, setState];
}
