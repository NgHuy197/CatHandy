import { useEffect, useRef } from 'react';
import { loginWithGoogle } from '../lib/auth';
import { useConfig } from '../lib/config';

let gsiScript;
const loadGsi = () =>
  (gsiScript ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      gsiScript = null;
      reject(new Error('Không tải được đăng nhập Google.'));
    };
    document.head.appendChild(s);
  }));

// GOOGLE_CLIENT_ID from the Worker, or null while loading or when Google sign-in is not set up.
export const useGoogleClientId = () => useConfig().googleClientId;

// Google's button plus the One-Tap prompt.
export default function GoogleSignIn({ clientId, onSignedIn, onError }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGsi().then(
      () => {
        if (cancelled || !boxRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => loginWithGoogle(credential).then(onSignedIn, onError),
        });
        window.google.accounts.id.renderButton(boxRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'vi',
        });
        window.google.accounts.id.prompt();
      },
      (err) => onError?.(err),
    );
    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [clientId, onSignedIn, onError]);

  return <div ref={boxRef} style={{ minHeight: '44px' }} />;
}
