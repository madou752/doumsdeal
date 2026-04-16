import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user || user.role !== 'ADMIN') {
        res.status(403).json({ message: "Accès refusé : Espace réservé aux administrateurs." });
        return;
    }

    next();
};