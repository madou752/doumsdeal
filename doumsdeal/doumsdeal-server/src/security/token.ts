import crypto from 'crypto';

// Jeton signé (HMAC-SHA256) : "<payload base64url>.<signature base64url>".
// Le mot de passe n'est plus jamais stocké côté client.
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function getSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (secret && secret.length >= 32) return secret;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('AUTH_SECRET manquant ou trop court (32 caractères minimum)');
    }
    // En dev uniquement : secret aléatoire par démarrage (les sessions sautent au redémarrage)
    if (!devSecret) {
        devSecret = crypto.randomBytes(48).toString('hex');
        console.warn('AUTH_SECRET absent du .env : secret temporaire utilisé (dev uniquement).');
    }
    return devSecret;
}
let devSecret = '';

// Empreinte du hash du mot de passe : changer de mot de passe invalide les anciens jetons.
export function passwordFingerprint(passwordHash: string): string {
    return crypto.createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);
}

function sign(payload: string): string {
    return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createToken(user: { id: number; password: string }): string {
    const payload = Buffer.from(JSON.stringify({
        sub: user.id,
        pwd: passwordFingerprint(user.password),
        exp: Date.now() + TOKEN_TTL_MS,
    })).toString('base64url');
    return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): { sub: number; pwd: string } | null {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;

    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
        if (typeof data.sub !== 'number' || typeof data.pwd !== 'string' || typeof data.exp !== 'number') return null;
        if (data.exp < Date.now()) return null;
        return { sub: data.sub, pwd: data.pwd };
    } catch {
        return null;
    }
}
