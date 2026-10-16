import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../security/authSecurity';
import { upload } from '../security/uploadSecurity';
import { rateLimit } from '../security/rateLimit';

const router = Router();

// 10 tentatives par IP toutes les 15 minutes : bloque le brute-force des mots de passe
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);
router.put('/me', requireAuth, upload.single('avatar'), AuthController.updateMe);

export default router;