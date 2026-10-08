import { decodeToken, isTokenExpired } from './token';

/** Builds an unsigned token with the given claims (the signature isn't checked client-side). */
function tokenWith(claims: object): string {
  const encode = (value: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.signature`;
}

describe('token helpers', () => {
  it('reads the claims, including non-ASCII names', () => {
    const claims = decodeToken(tokenWith({ id: 13, role: 'student', firstName: 'Niño', exp: 2_000_000_000 }));

    expect(claims?.id).toBe(13);
    expect(claims?.role).toBe('student');
    expect(claims?.firstName).toBe('Niño');
  });

  it('returns null for missing or malformed tokens', () => {
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken('not-a-token')).toBeNull();
    expect(decodeToken('a.!!!.c')).toBeNull();
  });

  it('treats a token as expired once its exp time has passed', () => {
    const token = tokenWith({ id: 1, exp: 1_000 });

    expect(isTokenExpired(token, 999_000)).toBeFalse();
    expect(isTokenExpired(token, 1_000_000)).toBeTrue();
  });

  it('treats missing tokens and tokens without an expiry as expired', () => {
    expect(isTokenExpired(null)).toBeTrue();
    expect(isTokenExpired(tokenWith({ id: 1 }))).toBeTrue();
  });
});
