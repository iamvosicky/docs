const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' };
const JWT_SECRET = process.env.JWT_SECRET || 'docs-app-secret-change-in-production';
const JWT_EXPIRES_IN = 60 * 60 * 24; // 24 hours in seconds

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function textEncode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    textEncode(JWT_SECRET),
    ALGORITHM,
    false,
    ['sign', 'verify']
  );
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRES_IN,
  };

  const encodedHeader = base64UrlEncode(textEncode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(textEncode(JSON.stringify(fullPayload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, textEncode(signingInput));

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const key = await getKey();
    const signature = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify('HMAC', key, signature, textEncode(signingInput));

    if (!isValid) return null;

    const payload: JwtPayload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encodedPayload))
    );

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
