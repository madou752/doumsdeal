import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import adsRoutes from './routes/adsRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/',(req, res) => {
    res.json({ message: 'Le serveur est en ligne' });
});

app.listen(port, () => {
    console.log(`Le serveur est en ligne sur le port ${port}`);
});