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

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`${API_URL}/events/${eventId}`);
        setEventData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch event data: ", error);
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/events/${eventId}`, eventData);
      alert('Event updated successfully!');
    } catch (error) {
      console.error("Failed to update the event: ", error);
      alert('Failed to update the event');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
          value={eventData.description}
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
          value={eventdata.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit">Update Event</button>
    </form>
  );
};

export default EventEditForm;