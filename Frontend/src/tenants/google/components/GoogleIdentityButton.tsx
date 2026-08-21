import { useEffect, useRef, useState } from 'react';
import { authApi } from '../../../services/auth';

type CredentialResponse = { credential?: string };
type GoogleAccounts = {
  id: {
    initialize: (options: { client_id: string; callback: (response: CredentialResponse) => void; ux_mode: 'popup' }) => void;
    renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleIdentityServices = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity-services]');
    const script = existing ?? document.createElement('script');
    const onLoad = () => resolve();
    const onError = () => reject(new Error('Não foi possível carregar o login do Google.'));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client?hl=pt-BR';
      script.async = true;
      script.dataset.googleIdentityServices = 'true';
      document.head.appendChild(script);
    }
  });

  return googleScriptPromise;
};

export default function GoogleIdentityButton({
  mode,
  disabled,
  onCredential,
  onError,
}: {
  mode: 'login' | 'register';
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [available, setAvailable] = useState(true);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    let active = true;

    Promise.all([authApi.getGoogleAuthConfig(), loadGoogleIdentityServices()])
      .then(([{ clientId }]) => {
        if (!active || !containerRef.current) return;
        if (!clientId) {
          setAvailable(false);
          return;
        }

        const googleIdentity = window.google?.accounts.id;
        if (!googleIdentity) throw new Error('Não foi possível iniciar o login do Google.');
        googleIdentity.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: ({ credential }) => {
            if (credential) onCredentialRef.current(credential);
            else onErrorRef.current('O Google não retornou uma credencial válida.');
          },
        });
        containerRef.current.replaceChildren();
        googleIdentity.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          locale: 'pt-BR',
          width: Math.max(240, Math.min(400, Math.floor(containerRef.current.clientWidth || 400))),
        });
      })
      .catch((error) => {
        if (!active) return;
        setAvailable(false);
        onErrorRef.current(error instanceof Error ? error.message : 'Login com Google indisponível.');
      });

    return () => { active = false; };
  }, [mode]);

  if (!available) return null;
  return <div ref={containerRef} aria-disabled={disabled} className={disabled ? 'pointer-events-none opacity-60' : ''} />;
}
