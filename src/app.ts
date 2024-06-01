import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import NodeCache from 'node-cache'; // Ensure the node-cache package is installed

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Standard TTL set for cached data. Adjust TTL based on specific requirements.
const eventsCache = new NodeCache({ stdTTL: 100 });

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Event Management System!');
});

// Cache implementation for retrieving events
app.get('/events', (req: Request, res: Response) => {
    const cachedEvents = eventsCache.get('events');
    if (cachedEvents) {
        return res.json(cachedEvents);
    } else {
        const upcomingEvents = [ // This array simulates fetching from a database
            { id: 1, name: 'Event 1', date: '2023-01-01' },
            { id: 2, name: 'Event 2', date: '2023-02-01' }
        ];
        eventsCache.set('events', upcomingEvents);
        res.json(upcomingEvents);
    }
});

// Endpoint for bulk-adding new events
app.post('/events/batch', (req: Request, res: Response) => {
    const newEvents = req.body; // Expected to be an array of events
    if (!Array.isArray(newEvents)) {
        return res.status(400).send({ error: "Request body must be an array of events." });
    }

    // In a real setting, insert the new events into the database here.
    // For demonstration, we'll return the submitted data.

    // Clear the cached events to ensure new requests receive updated data
    eventsCache.del('events');

    res.json(newEvents); // Echoing back the newly added events
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});