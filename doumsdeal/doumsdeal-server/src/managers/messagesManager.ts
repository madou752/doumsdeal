import { prisma } from '../prisma';
import { sendNewMessageEmail } from '../services/emailService';

const CONV_INCLUDE = {
    buyer: { select: { id: true, username: true, avatar_url: true } },
    seller: { select: { id: true, username: true, avatar_url: true } },
    ads: { select: { id: true, title: true, image_url: true, price: true, status: true, user_id: true } },
    messages: {
        orderBy: { created_at: 'desc' as const },
        take: 1,
        select: { content: true, created_at: true, sender_id: true, is_read: true },
    },
};

export class MessagesManager {
    // Récupère ou crée une conversation entre un acheteur et un vendeur pour une annonce
    static async findOrCreateConversation(buyerId: number, sellerId: number, adId: number) {
        const existing = await prisma.conversations.findFirst({
            where: { buyer_id: buyerId, seller_id: sellerId, ad_id: adId },
        });
        if (existing) return existing;
        return await prisma.conversations.create({
            data: { buyer_id: buyerId, seller_id: sellerId, ad_id: adId },
        });
    }

    // Toutes les conversations d'un utilisateur (acheteur ou vendeur)
    static async getUserConversations(userId: number) {
        return await prisma.conversations.findMany({
            where: {
                OR: [{ buyer_id: userId }, { seller_id: userId }],
            },
            include: CONV_INCLUDE,
            orderBy: { created_at: 'desc' },
        });
    }

    // Messages d'une conversation (vérifie que l'user en fait partie)
    static async getConversationMessages(convId: number, userId: number) {
        const conv = await prisma.conversations.findFirst({
            where: {
                id: convId,
                OR: [{ buyer_id: userId }, { seller_id: userId }],
            },
            include: { ads: { select: { id: true, title: true, image_url: true, price: true, status: true, user_id: true } } },
        });
        if (!conv) throw new Error('Conversation introuvable');

        const messages = await prisma.messages.findMany({
            where: { conversation_id: convId },
            include: { sender: { select: { id: true, username: true, avatar_url: true } } },
            orderBy: { created_at: 'asc' },
        });

        // Marquer comme lus les messages reçus
        await prisma.messages.updateMany({
            where: { conversation_id: convId, sender_id: { not: userId }, is_read: false },
            data: { is_read: true },
        });

        return { conv, messages };
    }

    // Envoyer un message
    static async sendMessage(convId: number, senderId: number, content: string) {
        const conv = await prisma.conversations.findFirst({
            where: {
                id: convId,
                OR: [{ buyer_id: senderId }, { seller_id: senderId }],
            },
            include: {
                buyer: { select: { id: true, username: true, email: true } },
                seller: { select: { id: true, username: true, email: true } },
                ads: { select: { title: true } },
            },
        });
        if (!conv) throw new Error('Conversation introuvable');

        const msg = await prisma.messages.create({
            data: { conversation_id: convId, sender_id: senderId, content },
            include: { sender: { select: { id: true, username: true, avatar_url: true } } },
        });

        // Notifier le destinataire par email (en tâche de fond)
        const recipient = conv.buyer_id === senderId ? conv.seller : conv.buyer;
        const sender = conv.buyer_id === senderId ? conv.buyer : conv.seller;
        sendNewMessageEmail({
            toEmail: recipient.email,
            toUsername: recipient.username,
            fromUsername: sender.username,
            adTitle: conv.ads.title,
            preview: content,
            conversationId: convId,
        }).catch(() => {});

        return msg;
    }

    // Nombre de messages non lus
    static async getUnreadCount(userId: number) {
        return await prisma.messages.count({
            where: {
                is_read: false,
                sender_id: { not: userId },
                conversations: {
                    OR: [{ buyer_id: userId }, { seller_id: userId }],
                },
            },
        });
    }
}
