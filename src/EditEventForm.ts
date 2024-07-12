import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface Props {
  eventId: number;
}

const EventEditForm: React.FC<Props> = ({ eventId }) => {
  const [eventData, setEventData] = useState<Event>({
    id: 0,
    title: '',
    description: '',
    date: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const log = (message: string, data?: any) => {
    console.log(`Log: ${message}`, data ? data : '');
  }

  useEffect(() => {
    const fetchEventData = async () => {
      log(`Fetching event data for ID: ${eventId}`);
      try {
        const response = await axios.get(`${API_URL}/events/${eventId}`);
        setEventData(response.data);
        setIsLoading(false);
        log('Event data fetched successfully', response.data);
      } catch (error) {
        console.error("Failed to fetch event data: ", error);
        log('Failed to fetch event data', error);
        setIsLifeLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
    log(`Input change - ${e.target.name}: ${e.target.value}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    log('Submitting event data', eventData);
    try {
      await axios.put(`${API_URL}/events/${eventId}`, eventData);
      alert('Event updated successfully!');
      log('Event updated successfully'); 
    } catch (error) {
      console.error("Failed to update the event: ", error);
      alert('Failed to update the event');
      log('Failed to update the event', error);
    }
  };

  if (isLoading) {
:    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Event Title</label>
        <input
          type="text"
          name="title"
          id="title"
          value={eventData.title}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          value={eventData.description"
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="date">Date</label>
        <input
          type="date"
          name="date"
          id="date"
          value={eventData.date"
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit">Update Event</button>
    </form>
  );
};

export default EventEditForm;