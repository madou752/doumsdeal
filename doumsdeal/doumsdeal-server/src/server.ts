import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/',(req, res) => {
    res.json({ message: 'Le serveur est en ligne' });
});

app.listen(port, () => {
    console.log(`Le serveur est en ligne sur le port ${port}`);
});
