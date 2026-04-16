import {Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

export const requireAuth = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Basic ')) {
        res.status(401).json({ message: "Authentification requise (Basic Auth)" });
        return;
    }

    try {
        const base64Credentials = authHeader.split(' ')[1];
        if (!base64Credentials) {
            res.status(401).json({ message: "Format d'authentification invalid" });
            return;
        }
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [email, password] = credentials.split(':');

        if (!email || !password) {
            res.status(401).json({ message: "Format d'authentification invalid" });
            return;
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            res.status(401).json({ message: "Utilisateur non trouvé" });
            return;
        }

        if (!user.is_active) {
            res.status(403).json({ message: "Votre compte a été suspendu" });
            return;
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Mot de passe incorrect" });
            return;
        }
        (req as any).user = user;
        next();
    }catch (error) {
        res.status(500).json({ message: "Erreur du serveur lors de l'authentification" });
    }
}