import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAuth } from '../security/authSecurity';
import { requireAdmin } from '../security/adminSecurity';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', AdminController.getAllUsers);
router.delete('/users/:id', AdminController.deleteUser);
router.delete('/ads/:id', AdminController.forceDeleteAd);

export default router;