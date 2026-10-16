import { Request, Response } from 'express';
import { AdsService } from '../services/adsService';
import { logAction } from '../services/logService';

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
const STATUSES = ['AVAILABLE', 'SOLD'];

// Liste blanche des champs modifiables : le client ne peut pas toucher à user_id, views_count, id, dates…
function pickAdData(body: any, { allowStatus }: { allowStatus: boolean }) {
    const data: any = {};
    if (typeof body.title === 'string') data.title = body.title.trim().slice(0, 100);
    if (typeof body.description === 'string') data.description = body.description.trim().slice(0, 5000);
    if (body.price !== undefined) {
        const price = parseFloat(body.price);
        if (!Number.isFinite(price) || price < 0 || price > 99999999) throw new Error('Prix invalide');
        data.price = price;
    }
    if (body.category_id !== undefined) {
        const categoryId = parseInt(body.category_id);
        if (!Number.isInteger(categoryId)) throw new Error('Catégorie invalide');
        data.category_id = categoryId;
    }
    if (typeof body.location === 'string') data.location = body.location.trim().slice(0, 100) || null;
    if (CONDITIONS.includes(body.condition)) data.condition = body.condition;
    if (allowStatus && STATUSES.includes(body.status)) data.status = body.status;
    data.is_negotiable = body.is_negotiable === 'true' || body.is_negotiable === true;
    return data;
}

export class AdsController {
    static async getAllAds(req: Request, res: Response) {
        try {
            const filters = {
                search: typeof req.query.search === 'string' ? req.query.search.slice(0, 100) : undefined,
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
            const adData = pickAdData(req.body, { allowStatus: false });

            if (req.file) {
                adData.image_url = '/upload/' + req.file.filename;
            }

            const newAd = await AdsService.postAd(adData, userId);
            logAction({ user_id: userId, action: 'CREATE_AD', target_type: 'ad', target_id: newAd.id, details: `Annonce créée : ${newAd.title}` });
            res.status(201).json(newAd);
        }catch (error) {
            res.status(400).json({ message: "Erreur Création annonce" });
        }
    }

    static async putAd(req: Request, res: Response){
        try{
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const userId = (req as any).user.id;
            const adData = pickAdData(req.body, { allowStatus: true });

            if (req.file) {
                adData.image_url = '/upload/' + req.file.filename;
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
            const userId = (req as any).user.id;
            await AdsService.deleteAd(id, userId);
            logAction({ user_id: userId, action: 'DELETE_AD', target_type: 'ad', target_id: id, details: `Annonce #${id} supprimée` });
            res.status(200).json({ message: "Annonce supprimée avec succès" });
        } catch (error) {
            res.status(403).json({ message: "Action interdite ou annonce introuvable" });
        }
    }

    // ===== FAVORIS =====
    static async toggleFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const adId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const result = await AdsService.toggleFavorite(userId, adId);
            res.status(200).json(result);
        } catch (error: any) {
            console.error('ERREUR FAVORIS:', error?.message, error?.stack);
            res.status(500).json({ message: "Erreur favoris" });
        }
    }

    static async getMyFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const favs = await AdsService.getUserFavorites(userId);
            res.status(200).json(favs);
        } catch (error) {
            res.status(500).json({ message: "Erreur récupération favoris" });
        }
    }

    static async getAdFavoriteStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const adId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const result = await AdsService.getAdFavoriteStatus(userId, adId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Erreur statut favori" });
        }
    }

    static async closeAd(req: Request, res: Response) {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const userId = (req as any).user.id;
            await AdsService.closeAd(id, userId);
            logAction({ user_id: userId, action: 'CLOSE_AD', target_type: 'ad', target_id: id, details: `Annonce #${id} marquée comme vendue` });
            res.status(200).json({ message: "Annonce marquée comme vendue" });
        } catch (error: any) {
            res.status(403).json({ message: error?.message ?? "Erreur" });
        }
    }
}