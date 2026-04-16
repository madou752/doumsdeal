import { Router } from 'express';
import { AdsController } from '../controllers/adsController';
import { requireAuth } from '../security/authSecurity';
import { upload } from '../security/uploadSecurity';

const router = Router();

router.get('/', AdsController.getAllAds);
router.get('/:id', AdsController.getAdById);

router.post('/', requireAuth, upload.single('image'), AdsController.postAd);
router.put('/:id', requireAuth, upload.single('image'), AdsController.putAd);
router.delete('/:id', requireAuth, AdsController.deleteAd);

export default router;