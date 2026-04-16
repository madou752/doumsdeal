import { Request, Response } from 'express';
import { MessagesService } from '../services/messagesService';

export class MessagesController {
    // POST /conversations { ad_id } → crée ou récupère la conversation
    static async getOrCreate(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const adId = parseInt(req.body.ad_id);
            if (!adId) { res.status(400).json({ message: 'ad_id manquant' }); return; }
            const conv = await MessagesService.getOrCreateConversation(userId, adId);
            res.status(200).json(conv);
        } catch (error: any) {
            res.status(400).json({ message: error?.message ?? 'Erreur' });
        }
    }

    // GET /conversations → mes conversations
    static async getMyConversations(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const convs = await MessagesService.getUserConversations(userId);
            res.status(200).json(convs);
        } catch {
            res.status(500).json({ message: 'Erreur récupération conversations' });
        }
    }

    // GET /conversations/:id → messages d'une conversation
    static async getMessages(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const convId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const data = await MessagesService.getConversationMessages(convId, userId);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(404).json({ message: error?.message ?? 'Introuvable' });
        }
    }

    // POST /conversations/:id → envoyer un message
    static async sendMessage(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const convId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const { content } = req.body;
            const msg = await MessagesService.sendMessage(convId, userId, content);
            res.status(201).json(msg);
        } catch (error: any) {
            res.status(400).json({ message: error?.message ?? 'Erreur envoi message' });
        }
    }

    // GET /unread-count → badge non lus
    static async getUnreadCount(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const count = await MessagesService.getUnreadCount(userId);
            res.status(200).json({ count });
        } catch {
            res.status(500).json({ message: 'Erreur' });
        }
    }
}
