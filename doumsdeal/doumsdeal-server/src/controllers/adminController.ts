import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export class AdminController {
    static async getAllUsers(req: Request, res: Response) {
        const users = await AdminService.getAllUsers();
        res.json(users);
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await AdminService.deleteUser(id);
            res.status(200).json({ message: "Utilisateur banni avec succès" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la suppression de l'utilisateur" });
        }
    }

    static async forceDeleteAd(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await AdminService.forceDeleteAd(id);
            res.status(200).json({ message: "Annonce supprimée par la modération" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la suppression de l'annonce" });
        }
    }
}