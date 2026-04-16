import { AdsManager} from '../managers/adsManager';

export class AdsService {
    static async getAllAds(filters: any = {}) {
        return await AdsManager.findAllAds(filters);
    }

    static async postAd(data: any, userId: number) {
        return await AdsManager.create({...data, user_id: userId});
    }

    static async updateAd(id: number, data: any) {
        const ad = await AdsManager.findById(id);
        if (!ad || ad.user_id !== data.user_id) {
            throw new Error('Ad not found');
        }
        return await AdsManager.update(id, data);
    }

    static async getAdById(id: number) {
        const ad = await AdsManager.findById(id);
        if (!ad) throw new Error('Annonce introuvable');
        // Incrémenter les vues en tâche de fond (sans bloquer la réponse)
        AdsManager.incrementViews(id).catch(() => {});
        return ad;
    }

    static async deleteAd(id: number, userId: number) {
        const ad = await AdsManager.findById(id);
        if (!ad) throw new Error('Annonce introuvable');
        if (ad.user_id !== userId) throw new Error('Vous n\'êtes pas autorisé à supprimer cette annonce');
        return await AdsManager.delete(id);
    }

    // ===== FAVORIS =====
    static async toggleFavorite(userId: number, adId: number) {
        const already = await AdsManager.isFavorite(userId, adId);
        if (already) {
            await AdsManager.removeFavorite(userId, adId);
            return { favorited: false };
        } else {
            await AdsManager.addFavorite(userId, adId);
            return { favorited: true };
        }
    }

    static async getUserFavorites(userId: number) {
        return await AdsManager.getUserFavorites(userId);
    }

    static async getAdFavoriteStatus(userId: number, adId: number) {
        return { favorited: await AdsManager.isFavorite(userId, adId) };
    }

    static async closeAd(adId: number, userId: number) {
        const ad = await AdsManager.findById(adId);
        if (!ad) throw new Error('Annonce introuvable');
        if (ad.user_id !== userId) throw new Error('Non autorisé');
        return await AdsManager.markAsSold(adId);
    }
}
