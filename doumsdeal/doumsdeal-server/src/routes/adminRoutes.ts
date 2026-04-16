import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAuth } from '../security/authSecurity';
import { requireAdmin } from '../security/adminSecurity';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/toggle-active', AdminController.toggleUserActive);
router.delete('/users/:id', AdminController.deleteUser);
router.delete('/ads/:id', AdminController.forceDeleteAd);
router.get('/logs', AdminController.getLogs);

export default router;