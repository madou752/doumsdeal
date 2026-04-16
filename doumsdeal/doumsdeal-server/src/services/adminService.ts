import { AdminManager } from '../managers/adminManager';
import { AdsManager } from '../managers/adsManager';

export class AdminService {
    static async getAllUsers() {
        return await AdminManager.findAllUsers();
    }

    static async deleteUser(id: number) {
        return await AdminManager.deleteUser(id);
    }

    static async forceDeleteAd(id: number) {
        const ad = await AdsManager.findById(id);
        if (!ad) {
            throw new Error('Annonce introuvable');
        }
        return await AdsManager.delete(id);
    }
}