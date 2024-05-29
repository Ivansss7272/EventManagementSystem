import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Event Management System!');
});

app.get('/events', (req: Request, res: Response) => {
    res.json([
        { id: 1, name: 'Event 1', date: '2023-01-01' },
        { id: 2, name: 'Event 2', date: '2023-02-01' }
    ]);
});

app.post('/events', (req: Request, res: Response) => {
    res.json(req.body);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});