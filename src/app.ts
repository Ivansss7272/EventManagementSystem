import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';  // Make sure to install the node-cache package

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const myCache = new NodeCache({ stdTTL: 100 }); // Cache TTL as an example, adjust based on your needs

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Event Management System!');
});

// Implement caching for the events endpoint
app.get('/events', (req: Request, res: Response) => {
    const eventsFromCache = myCache.get('events');
    if (eventsFromCache) {
        return res.json(eventsFromCache);
    } else {
        const events = [  // Assuming this array might come from a database in a real scenario
            { id: 1, name: 'Event 1', date: '2023-01-01' },
            { id: 2, name: 'Event 2', date: '2023-02-01' }
        ];
        myCache.set('events', events);
        res.json(events);
    }
});

// Allow batch creation of events
app.post('/events', (req: Request, res: Response) => {
    // assuming req.body is an array of events. Validate accordingly.
    const events = req.body;
    if (!Array.isArray(events)) {
        return res.status(400).send({ error: "Request body must be an array of events." });
    }
    // Here, you would typically loop through the events and insert them into your database.
    // For simplicity, we'll just echo them back to the client.

    // Optionally, after successfully adding new events, clear the cache to ensure the next GET /events fetches fresh data
    myCache.del('events');

    res.json(events);  // Returning the received events for simplicity
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});