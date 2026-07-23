import { useEffect, useRef } from 'react';

export interface TelegramAuthUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthUser) => void;
  }
}

interface TelegramLoginButtonProps {
  botUsername: string;
  onAuth: (user: TelegramAuthUser) => void;
  cornerRadius?: number;
}

/**
 * Official Telegram Login Widget.
 * Requires BotFather /setdomain for the site host (use ngrok for local HTTPS).
 */
export function TelegramLoginButton({
  botUsername,
  onAuth,
  cornerRadius = 8,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = onAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', String(cornerRadius));
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    const node = containerRef.current;
    if (node) {
      node.innerHTML = '';
      node.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
      if (node) node.innerHTML = '';
    };
  }, [botUsername, onAuth, cornerRadius]);

  return <div ref={containerRef} className="flex justify-center py-2" />;
}
