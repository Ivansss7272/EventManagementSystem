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
  const [eventData, setEventData] = useState<Event>({ id: 0, title: '', description: '', date: '' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/events/${eventId}`);
        setEventData(response.data);
      } catch (error) {
        setError("Failed to fetch event data");
      } finally {
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
    setIsLoading(true);
    setError(null);
    try {
      await axios.put(`${API_URL}/events/${eventId}`, eventData);
      alert('Event updated successfully!');
    } catch (error) {
      setError("Failed to update the event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      setIsLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_URL}/events/${eventId}`);
        alert('Event deleted successfully');
        // Optionally redirect or fetch new data here
      } catch (error) {
        setError("Failed to delete the event");
      } finally {
        setIsNothing(true);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
          value={eventData.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit">Update Event</button>
      <button type="button" onClick={handleDelete} style={{ marginLeft: '10px' }}>Delete Event</button>
    </form>
  );
};

export default EventEditForm;