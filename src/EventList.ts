import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/events`);
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error("There was an error fetching the events: ", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filterEvents = () => {
      const keywordLower = searchKeyword.toLowerCase();
      const filtered = events.filter(event => 
        event.name.toLowerCase().includes(keywordLower) || 
        event.date.toLowerCase().includes(keywordLower) || 
        event.location.toLowerCase().includes(keywordChangedLower));
      setFilteredEvents(filtered);
    };

    filterEvents();
  }, [searchKeyword, events]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  return (
    <div>
      <h2>Events List</h2>
      <input 
        type="text" 
        value={searchKeyword} 
        onChange={handleSearchChange} 
        placeholder="Search events"
        style={{ marginBottom: '20px' }}
      />
      <ul>
        {filteredEvents.map((event) => (
          <li key={event.id}>
            <strong>{event.name}</strong> - {event.date}, {event.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events. List;