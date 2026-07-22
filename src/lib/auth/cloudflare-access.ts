/**
 * Cloudflare Zero Trust (Access) verification.
 *
 * Khi bật CF Access cho route /admin/*, Cloudflare inject header
 * `Cf-Access-Jwt-Assertion` chứa JWT đã ký. Middleware verify token
 * bằng JWKS public key từ Cloudflare.
 *
 * Env vars cần thiết:
 *   CF_ACCESS_TEAM_NAME  — tên team (vd: "thiecuoi")
 *   CF_ACCESS_AUD        — Application Audience (AUD) tag
 *
 * Nếu KHÔNG set env vars → bypass (cho phép dev local không qua CF).
 */

import { jwtVerify, createRemoteJWKSet } from "jose";

// Cache JWKS keyset per team
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
 * Verify Cloudflare Access JWT.
 * Returns payload if valid, null if invalid/missing.
 * If CF_ACCESS_TEAM_NAME is not set, returns a bypass payload.
 */
export async function verifyCfAccess(
  cfJwt: string | null | undefined,
): Promise<CfAccessPayload | null> {
  const teamName = process.env.CF_ACCESS_TEAM_NAME;
  const aud = process.env.CF_ACCESS_AUD;

  // Bypass: CF Access not configured (local dev)
  if (!teamName || !aud) {
    return { email: "dev@local", sub: "bypass", iat: 0, exp: 0 };
  }

  if (!cfJwt) return null;

  try {
    const jwks = getJWKS(teamName);
    const { payload } = await jwtVerify(cfJwt, jwks, {
      issuer: `https://${teamName}.cloudflareaccess.com`,
      audience: aud,
    });
    return payload as unknown as CfAccessPayload;
  } catch {
    return null;
  }
}
