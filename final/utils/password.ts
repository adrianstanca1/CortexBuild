import { User } from '../types';

const getCrypto = (): Crypto => {
    if (typeof globalThis.crypto !== 'undefined') {
        return globalThis.crypto as Crypto;
    }
    throw new Error('Secure crypto APIs are not available in this environment.');
};

const cryptoApi = getCrypto();
const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

const generateSalt = (length = 16): string => {
    const bytes = new Uint8Array(length);
    cryptoApi.getRandomValues(bytes);
    return toHex(bytes.buffer);
};

const deriveHash = async (password: string, salt: string): Promise<string> => {
    const data = encoder.encode(`${salt}:${password}`);
    const digest = await cryptoApi.subtle.digest('SHA-256', data);
    return toHex(digest);
};

const timingSafeEqual = (a: string, b: string): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
};

export const createPasswordRecord = async (password: string): Promise<{ hash: string; salt: string }> => {
    const salt = generateSalt();
    const hash = await deriveHash(password, salt);
    return { hash, salt };
};

export const verifyPassword = async (password: string, hash: string, salt: string): Promise<boolean> => {
    const derivedHash = await deriveHash(password, salt);
    return timingSafeEqual(derivedHash, hash);
};

export const upgradeLegacyPassword = async <T extends Partial<User> & { password?: string; passwordHash?: string; passwordSalt?: string }>(
    user: T
): Promise<T> => {
    if (!user.passwordHash && !user.passwordSalt && user.password) {
        const { hash, salt } = await createPasswordRecord(user.password);
        user.passwordHash = hash;
        user.passwordSalt = salt;
        delete user.password;
    }
    return user;
};

export const sanitizeUser = <T extends Partial<User>>(user: T): T => {
    const { password, passwordHash, passwordSalt, ...rest } = user;
    return rest as T;
};
