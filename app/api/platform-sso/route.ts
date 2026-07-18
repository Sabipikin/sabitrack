import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyPlatformToken } from '@/lib/platform-auth';

/**
 * One-login: exchange a Sabi Platform session for a Supabase session.
 *
 * Works without a service-role key: the account's password is derived with an
 * HMAC of the server-side platform secret, so only this route can compute it.
 * First visit signs the user up; later visits sign in. Users who registered
 * manually with their own password keep using the normal login form.
 */
export async function POST(req: NextRequest) {
  const { platform_token: platformToken } = await req.json().catch(() => ({}));
  if (!platformToken) {
    return NextResponse.json({ error: 'platform_token required' }, { status: 400 });
  }

  const user = await verifyPlatformToken(platformToken);
  if (!user || !user.email) {
    return NextResponse.json(
      { error: 'Invalid platform session — sign in on the Sabi platform first' },
      { status: 401 },
    );
  }

  const email = user.email.toLowerCase();
  const password = createHmac('sha256', process.env.PLATFORM_JWT_SECRET!)
    .update(`sabitrack-sso:${email}`)
    .digest('hex');

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );

  let session = (await supabase.auth.signInWithPassword({ email, password })).data.session;
  if (!session) {
    const signUp = await supabase.auth.signUp({ email, password });
    session = signUp.data.session;
    if (!session) {
      // Account exists with its own password, or email confirmation is required.
      return NextResponse.json(
        { error: 'This email already has a SabiTrack password — use the login form' },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
