interface CookieOptions {
  maxAge?: number;
  SameSite?: 'Strict' | 'Lax' | 'None';
  path?: string;
}

export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;
  const { maxAge, SameSite = 'Lax', path = '/' } = options;
  let cookie = `${name}=${encodeURIComponent(value)}; path=${path}; SameSite=${SameSite}`;
  if (maxAge !== undefined) {
    cookie += `; max-age=${maxAge}`;
  }
  document.cookie = cookie;
}

export function deleteCookie(name: string, options: CookieOptions = {}): void {
  const { SameSite = 'Lax', path = '/' } = options;
  document.cookie = `${name}=; path=${path}; SameSite=${SameSite}; max-age=0`;
}

export function triggerAuthChangeEvent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('auth-change'));
}
