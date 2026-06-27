import { jwtVerify } from 'jose';

export interface PlatformUser {
  sub: string;
  email: string | null;
  workspaceId: string | null;
  workspaceRole: string | null;
  apps: Record<string, { read: boolean; write: boolean; admin: boolean }>;
}

export async function verifyPlatformToken(token: string): Promise<PlatformUser | null> {
  const secret = process.env.PLATFORM_JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (!payload.sub || !payload.workspaceId) return null;

    const apps = (payload.apps as Record<string, any>) || {};
    const sabitrackPerms = apps.sabitrack;
    if (!sabitrackPerms?.read) return null;

    return {
      sub: payload.sub as string,
      email: (payload.email as string) || null,
      workspaceId: (payload.workspaceId as string) || null,
      workspaceRole: (payload.workspaceRole as string) || null,
      apps,
    };
  } catch {
    return null;
  }
}
