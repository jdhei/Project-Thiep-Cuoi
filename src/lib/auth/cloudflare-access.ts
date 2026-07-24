import { jwtVerify, createRemoteJWKSet } from "jose";

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJWKS(teamName: string) {
  if (!jwksCache.has(teamName)) {
    const url = new URL(`https://${teamName}.cloudflareaccess.com/cdn-cgi/access/certs`);
    jwksCache.set(teamName, createRemoteJWKSet(url));
  }
  return jwksCache.get(teamName)!;
}

export interface CfAccessPayload {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Development/test có thể chạy không qua Cloudflare Access.
 * Production fail-closed nếu thiếu cấu hình hoặc thiếu token.
 */
export async function verifyCfAccess(
  cfJwt: string | null | undefined,
): Promise<CfAccessPayload | null> {
  const teamName = process.env.CF_ACCESS_TEAM_NAME?.trim();
  const aud = process.env.CF_ACCESS_AUD?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (!teamName || !aud) {
    return isProduction
      ? null
      : { email: "dev@local", sub: "bypass", iat: 0, exp: 0 };
  }

  if (!cfJwt) return null;

  try {
    const jwks = getJWKS(teamName);
    const { payload } = await jwtVerify(cfJwt, jwks, {
      issuer: `https://${teamName}.cloudflareaccess.com`,
      audience: aud,
    });

    if (typeof payload.email !== "string" || typeof payload.sub !== "string") {
      return null;
    }

    return payload as unknown as CfAccessPayload;
  } catch {
    return null;
  }
}
