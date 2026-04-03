import { AdsManager} from '../managers/adsManager';

export class AdsService {
    static async getAllAds() {
        return await AdsManager.findAllAds();
    }

    static async postAd(data: any, userId: number) {
        return await AdsManager.create({data, user_id: userId});
    }

    static async updateAd(id: number, data: any) {
        const ad = await AdsManager.findById(id);
        if (!ad || ad.user_id !== data.user_id) {
            throw new Error('Ad not found');
        }
        return await AdsManager.update(id, data);
    }
} 
