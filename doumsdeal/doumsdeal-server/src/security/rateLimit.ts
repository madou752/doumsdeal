import { Request, Response, NextFunction } from 'express';

// Limiteur en mémoire (suffisant pour un seul serveur) : bloque le brute-force sur login / inscription.
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
    const hits = new Map<string, { count: number; resetAt: number }>();

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
    }, windowMs).unref();

    return (req: Request, res: Response, next: NextFunction): void => {
        const key = `${req.ip}:${req.path}`;
        const now = Date.now();
        const entry = hits.get(key);

        if (!entry || entry.resetAt <= now) {
            hits.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }

        entry.count++;
        if (entry.count > max) {
            res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
            res.status(429).json({ message: "Trop de tentatives, réessayez dans quelques minutes" });
            return;
        }
        next();
    };
}
