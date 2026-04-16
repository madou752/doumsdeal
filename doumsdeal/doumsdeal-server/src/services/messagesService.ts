import { MessagesManager } from '../managers/messagesManager';
import { AdsManager } from '../managers/adsManager';

export class MessagesService {
    static async getOrCreateConversation(buyerId: number, adId: number) {
        const ad = await AdsManager.findById(adId);
        if (!ad) throw new Error('Annonce introuvable');
        if (ad.user_id === buyerId) throw new Error('Vous ne pouvez pas vous contacter vous-même');
        return await MessagesManager.findOrCreateConversation(buyerId, ad.user_id, adId);
    }

    static async getUserConversations(userId: number) {
        return await MessagesManager.getUserConversations(userId);
    }

    static async getConversationMessages(convId: number, userId: number) {
        return await MessagesManager.getConversationMessages(convId, userId);
    }

    static async sendMessage(convId: number, senderId: number, content: string) {
        const trimmed = content.trim();
        if (!trimmed) throw new Error('Message vide');
        if (trimmed.length > 2000) throw new Error('Message trop long');
        return await MessagesManager.sendMessage(convId, senderId, trimmed);
    }

    static async getUnreadCount(userId: number) {
        return await MessagesManager.getUnreadCount(userId);
    }
}
