import { Request, Response } from 'express';
import { AdsService } from '../services/adsService';

export class AdsController {
    static async getAllAds(req: Request, res: Response){
        const ads = await AdsService.getAllAds();
        res.json(ads);
    }

    static async postAd(req: Request, res: Response){
        try{
            const userId = (req as any).user.id;
            const newAd = await AdsService.postAd(req.body, userId);
            res.status(201).json(newAd);
        }catch (error) {
            res.status(400).json({ message: "Erreur Création annonce" });
        }
    }

    static async putAd(req: Request, res: Response){
        try{
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const userId = (req as any).user.id;
            const updatedAd = await AdsService.updateAd(id, {...req.body, user_id: userId});
            res.status(200).json(updatedAd);
        }catch (error) {
            res.status(400).json({ message: "Erreur Mise à jour annonce" });
        }
    
    }
}