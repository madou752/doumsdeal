import { Router } from 'express';
import { MessagesController } from '../controllers/messagesController';
import { requireAuth } from '../security/authSecurity';

const router = Router();

router.use(requireAuth);

router.get('/unread-count', MessagesController.getUnreadCount);
router.post('/conversations', MessagesController.getOrCreate);
router.get('/conversations', MessagesController.getMyConversations);
router.get('/conversations/:id', MessagesController.getMessages);
router.post('/conversations/:id', MessagesController.sendMessage);

export default router;
