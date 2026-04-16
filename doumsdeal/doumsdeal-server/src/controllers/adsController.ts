import { Request, Response } from 'express';
import { AdsService } from '../services/adsService';

export class AdsController {
    static async getAllAds(req: Request, res: Response) {
        try {
            const filters = {
                search: req.query.search as string,
                category: req.query.category ? parseInt(req.query.category as string) : undefined,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
                sort: req.query.sort as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
            };

            const ads = await AdsService.getAllAds(filters);
            res.status(200).json(ads);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération des annonces" });
        }
    }

    static async postAd(req: Request, res: Response){
        try{
            const userId = (req as any).user.id;
            const adData = req.body; 

            if (req.file) {
                adData.image_url = '/uploads/' + req.file.filename;
            }

            const newAd = await AdsService.postAd(adData, userId);
            
            res.status(201).json(newAd);
        }catch (error) {
            res.status(400).json({ message: "Erreur Création annonce" });
        }
    }

    static async putAd(req: Request, res: Response){
        try{
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const userId = (req as any).user.id;
            
            const adData = { ...req.body };
            
            if (req.file) {
                adData.image_url = '/uploads/' + req.file.filename;
            }

            const updatedAd = await AdsService.updateAd(id, {...adData, user_id: userId});
            res.status(200).json(updatedAd);
        } catch (error) {
            res.status(400).json({ message: "Erreur Mise à jour annonce" });
        }
    }

    static async getAdById(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const ad = await AdsService.getAdById(id);
            res.status(200).json(ad);
        } catch (error) {
            res.status(404).json({ message: "Annonce introuvable" });
        }
    }

    static async deleteAd(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const userId = (req as any).user.id; // L'ID vient du garde du corps (Basic Auth)
            
            await AdsService.deleteAd(id, userId);
            res.status(200).json({ message: "Annonce supprimée avec succès" });
        } catch (error) {
            res.status(403).json({ message: "Action interdite ou annonce introuvable" });
        }
    }
}