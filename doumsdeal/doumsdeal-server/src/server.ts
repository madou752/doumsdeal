import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import adsRoutes from './routes/adsRoutes';
import adminRoutes from './routes/adminRoutes';
import categoriesRoutes from './routes/categoriesRoutes';
import messagesRoutes from './routes/messagesRoutes';
import { prisma } from './prisma';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/upload', express.static(path.join(__dirname, '../upload')));

app.use('/api/auth', authRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/messages', messagesRoutes);

app.get('/',(req, res) => {
    res.json({ message: 'Le serveur est en ligne' });
});

app.listen(port, async () => {
    console.log(`Le serveur est en ligne sur le port ${port}`);
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Connexion à la base de données OK');
    } catch (err: any) {
        console.error(`ERREUR : Impossible de joindre la base de données (${err.message})`);
        console.error('Vérifiez que le tunnel SSH est actif : ssh -L 5433:localhost:5432 user@ton_vps -N');
    }
});