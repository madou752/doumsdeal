import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { logAction } from '../services/logService';

export class AdminController {
    static async getAllUsers(req: Request, res: Response) {
        const users = await AdminService.getAllUsers();
        res.json(users);
    }

    static async toggleUserActive(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const result = await AdminService.toggleUserActive(id);
            logAction({ user_id: (req as any).user.id, action: result.is_active ? 'REACTIVATE_USER' : 'BAN_USER', target_type: 'user', target_id: id, details: `Utilisateur #${id} ${result.is_active ? 'réactivé' : 'suspendu'}` });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: "Erreur lors du changement de statut" });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await AdminService.deleteUser(id);
            logAction({ user_id: (req as any).user.id, action: 'DELETE_USER', target_type: 'user', target_id: id, details: `Utilisateur #${id} supprimé` });
            res.status(200).json({ message: "Utilisateur banni avec succès" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la suppression de l'utilisateur" });
        }
    }

    static async forceDeleteAd(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await AdminService.forceDeleteAd(id);
            logAction({ user_id: (req as any).user.id, action: 'ADMIN_DELETE_AD', target_type: 'ad', target_id: id, details: `Annonce #${id} supprimée par l'admin` });
            res.status(200).json({ message: "Annonce supprimée par la modération" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la suppression de l'annonce" });
        }
    }

    static async getLogs(req: Request, res: Response) {
        try {
            const logs = await AdminService.getLogs();
            res.status(200).json(logs);
        } catch {
            res.status(500).json({ message: 'Erreur récupération logs' });
        }
    }
}