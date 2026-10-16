import { Request, Response } from "express";
import { prisma } from '../prisma';
import bcrypt from "bcrypt";
import { logAction } from '../services/logService';
import { createToken } from '../security/token';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[\p{L}\p{N}_.-]{3,50}$/u;
const MIN_PASSWORD = 8;

function validatePassword(password: unknown): string | null {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD) return `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères`;
    if (password.length > 72) return "Le mot de passe est trop long (72 caractères maximum)";
    return null;
}

function publicUser(user: { id: number; username: string; email: string; role: any; avatar_url: string | null }) {
    return { id: user.id, username: user.username, email: user.email, role: user.role, avatar_url: user.avatar_url };
}

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password } = req.body;

            if (typeof username !== 'string' || typeof email !== 'string' || !password) {
                res.status(400).json({ message: "Tous les champs sont requis" });
                return;
            }
            if (!USERNAME_RE.test(username)) {
                res.status(400).json({ message: "Pseudo invalide (3 à 50 caractères : lettres, chiffres, _ . -)" });
                return;
            }
            if (!EMAIL_RE.test(email) || email.length > 255) {
                res.status(400).json({ message: "Adresse email invalide" });
                return;
            }
            const passwordError = validatePassword(password);
            if (passwordError) {
                res.status(400).json({ message: passwordError });
                return;
            }

            const normalizedEmail = email.trim().toLowerCase();
            const existingUser = await prisma.users.findFirst({
                where: { OR: [{ email: { equals: normalizedEmail, mode: 'insensitive' } }, { username }] },
            });
            if (existingUser) {
                res.status(409).json({ message: "Cet email ou ce pseudo est déjà utilisé" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.users.create({
                data: {
                    username,
                    email: normalizedEmail,
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

            if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
                res.status(400).json({ message: "Email et mot de passe requis" });
                return;
            }

            // Insensible à la casse : les comptes créés avant la normalisation des emails restent accessibles
            const user = await prisma.users.findFirst({ where: { email: { equals: email.trim(), mode: 'insensitive' } } });
            // Même message que le compte existe ou non : on ne révèle pas quels emails sont inscrits
            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.status(401).json({ message: "Email ou mot de passe incorrect" });
                return;
            }

            if (!user.is_active) {
                res.status(403).json({ message: "Votre compte a été suspendu" });
                return;
            }

            logAction({ user_id: user.id, action: 'LOGIN', target_type: 'user', target_id: user.id, details: `Connexion de ${user.username}` });
            res.status(200).json({
                message: "Connexion réussie",
                token: createToken(user),
                user: publicUser(user),
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
            if (username && username !== user.username) {
                if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
                    res.status(400).json({ message: "Pseudo invalide (3 à 50 caractères : lettres, chiffres, _ . -)" });
                    return;
                }
                if (await prisma.users.findUnique({ where: { username } })) {
                    res.status(409).json({ message: "Ce pseudo est déjà utilisé" });
                    return;
                }
                data.username = username;
            }
            if (password) {
                const passwordError = validatePassword(password);
                if (passwordError) {
                    res.status(400).json({ message: passwordError });
                    return;
                }
                data.password = await bcrypt.hash(password, 10);
            }
            if (req.file) data.avatar_url = '/upload/' + req.file.filename;

            const updated = await prisma.users.update({
                where: { id: user.id },
                data,
            });

            // Changer de mot de passe invalide les anciens jetons : on en renvoie un nouveau
            res.status(200).json({
                ...publicUser(updated),
                ...(data.password ? { token: createToken(updated) } : {}),
            });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
        }
    }
}
