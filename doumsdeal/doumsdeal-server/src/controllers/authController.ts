import { Request, Response } from "express";
import { prisma } from '../prisma';
import bcrypt from "bcrypt";
import { logAction } from '../services/logService';


export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                res.status(400).json({ message: "Tous les champs sont requis" });
                return;
            }

            const existingUser = await prisma.users.findUnique({ where: { email } });
            if (existingUser) {
                res.status(409).json({ message: "Un utilisateur avec cet email existe déjà" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.users.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                },
            });

            logAction({ user_id: newUser.id, action: 'REGISTER', target_type: 'user', target_id: newUser.id, details: `Inscription de ${username}` });
            res.status(201).json({ message: "Utilisateur créé avec succès", userId: newUser.id });

        } catch (error) {
            console.error("ERREUR INSCRIPTION :", error);
            res.status(500).json({ message: "Erreur du serveur lors de l'inscription" });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "Email et mot de passe requis" });
                return;
            }

            const user = await prisma.users.findUnique({ where: { email } });
            if (!user) {
                res.status(401).json({ message: "Email ou mot de passe incorrect" });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ message: "Email ou mot de passe incorrect" });
                return;
            }

            logAction({ user_id: user.id, action: 'LOGIN', target_type: 'user', target_id: user.id, details: `Connexion de ${user.username}` });
            res.status(200).json({
                message: "Connexion réussie",
                user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar_url: user.avatar_url },
            });

        } catch (error) {
            console.error("ERREUR CONNEXION :", error);
            res.status(500).json({ message: "Erreur du serveur lors de la connexion" });
        }
    }

    static async getMe(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            res.status(200).json({
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                role: user.role,
                created_at: user.created_at,
            });
        } catch (error) {
            res.status(500).json({ message: "Erreur serveur" });
        }
    }

    static async updateMe(req: Request, res: Response): Promise<void> {
        try {
            const user = (req as any).user;
            const { username, password } = req.body;

            const data: any = {};
            if (username) data.username = username;
            if (password) data.password = await bcrypt.hash(password, 10);
            if (req.file) data.avatar_url = '/upload/' + req.file.filename;

            const updated = await prisma.users.update({
                where: { id: user.id },
                data,
                select: { id: true, username: true, email: true, role: true, avatar_url: true },
            });

            res.status(200).json(updated);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
        }
    }
}