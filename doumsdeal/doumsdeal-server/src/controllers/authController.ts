import { Request, Response } from "express";
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

class AuthController {
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

            res.status(201).json({ message: "Utilisateur créé avec succès", userId: newUser.id });

        } catch (error) {
            res.status(500).json({ message: "Erreur du serveur lors de l'inscription" });
        }
    }
}