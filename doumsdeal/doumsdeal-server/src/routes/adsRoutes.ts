import { Router } from 'express';
import { AdsController } from '../controllers/adsController';
import { requireAuth } from '../security/authSecurity';
import { upload } from '../security/uploadSecurity';

const router = Router();

router.get('/', AdsController.getAllAds);
router.get('/favorites/me', requireAuth, AdsController.getMyFavorites);
router.get('/:id', AdsController.getAdById);
router.get('/:id/favorite', requireAuth, AdsController.getAdFavoriteStatus);

router.post('/', requireAuth, upload.single('image'), AdsController.postAd);
router.post('/:id/favorite', requireAuth, AdsController.toggleFavorite);
router.patch('/:id/close', requireAuth, AdsController.closeAd);
router.put('/:id', requireAuth, upload.single('image'), AdsController.putAd);
router.delete('/:id', requireAuth, AdsController.deleteAd);

export default router;