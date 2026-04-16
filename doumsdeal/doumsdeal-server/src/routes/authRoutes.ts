import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../security/authSecurity';
import { upload } from '../security/uploadSecurity';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);
router.put('/me', requireAuth, upload.single('avatar'), AuthController.updateMe);

export default router;