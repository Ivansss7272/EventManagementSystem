import React, { useState } from 'react';
import axios from 'axios';

interface EventFormState {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

const EventForm: React.FC = () => {
  const initialState: EventFormState = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
  };

  const [formData, setFormData] = useState<EventFormState>(initialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'your-api-endpoint'; 
    try {
      await axios.post(apiEndpoint, formData);
      alert('Event added successfully!');
      setFormData(initialState); 
    } catch (error: any) {
      console.error("Error adding the event: ", error.response?.data || error.message);
      alert('Failed to add event.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required></textarea>
      </div>
      <div>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="time">Time:</label>
        <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="location">Location:</label>
        <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} required />
      </div>
      <div>
        <label htmlFor="organizer">Organizer:</label>
        <input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleInputChange} required />
      </div>
      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;