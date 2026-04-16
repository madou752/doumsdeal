import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const categories = await prisma.categories.findMany({ orderBy: { name: 'asc' } });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération catégories" });
    }
});

export default router;
