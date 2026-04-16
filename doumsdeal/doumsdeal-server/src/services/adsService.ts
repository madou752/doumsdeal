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
        if (!ad) {
            throw new Error('Annonce introuvable');
        }
        return ad;
    }

    static async deleteAd(id: number, userId: number) {
        // 1. On cherche l'annonce
        const ad = await AdsManager.findById(id);
        
        if (!ad) {
            throw new Error('Annonce introuvable');
        }
        
        // 2. SÉCURITÉ : On vérifie que l'étudiant connecté est bien le propriétaire
        if (ad.user_id !== userId) {
            throw new Error('Vous n\'êtes pas autorisé à supprimer cette annonce');
        }

        // 3. Si c'est bon, on supprime
        return await AdsManager.delete(id);
    }
} 
