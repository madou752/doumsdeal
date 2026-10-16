import {Request, Response, NextFunction} from 'express';
import { prisma } from '../prisma';
import { verifyToken, passwordFingerprint } from './token';

export const requireAuth = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: "Authentification requise" });
        return;
    }

    try {
        const payload = verifyToken(authHeader.slice('Bearer '.length).trim());
        if (!payload) {
            res.status(401).json({ message: "Session invalide ou expirée, reconnectez-vous" });
            return;
        }

        const user = await prisma.users.findUnique({ where: { id: payload.sub } });

        // Utilisateur supprimé, ou mot de passe changé depuis l'émission du jeton
        if (!user || passwordFingerprint(user.password) !== payload.pwd) {
            res.status(401).json({ message: "Session invalide ou expirée, reconnectez-vous" });
            return;
        }

        if (!user.is_active) {
            res.status(403).json({ message: "Votre compte a été suspendu" });
            return;
        }

        (req as any).user = user;
        next();
    }catch (error) {
        res.status(500).json({ message: "Erreur du serveur lors de l'authentification" });
    }
}
