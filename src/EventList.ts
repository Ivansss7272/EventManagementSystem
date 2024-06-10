import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error("There was an error fetching the events: ", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Events List</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.name}</strong> - {event.date}, {event.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventsList;