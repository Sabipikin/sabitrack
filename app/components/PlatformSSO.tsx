'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * One-login receiver: the layout's inline script stashes the platform token
 * from the #sso fragment; this exchanges it for a Supabase session and
 * reloads so the app boots signed in.
 */
export default function PlatformSSO() {
  useEffect(() => {
    const platformToken = sessionStorage.getItem('platformSSO');
    if (!platformToken) return;
    sessionStorage.removeItem('platformSSO');

    (async () => {
      try {
        const res = await fetch('/api/platform-sso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform_token: platformToken }),
        });
        if (!res.ok) return;
        const { access_token, refresh_token } = await res.json();
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) window.location.reload();
      } catch {
        // fall through to the normal login screen
      }
    })();
  }, []);

  return null;
}
