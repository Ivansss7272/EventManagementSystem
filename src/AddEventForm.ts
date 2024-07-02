import React, { useState } from 'react';
import axios from 'axios';

interface EventFormState {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  image?: string; // Optional property for the image in base64 format
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
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        setFormData({
          ...formData,
          image: loadEvent.target?.result as string,
        });
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'your-api-endpoint';
    try {
      await axios.post(apiEndpoint, formData);
      alert('Event added successfully!');
      setFormData(initialState);
      setError(null);
    } catch (error) {
                    console.error("Error adding the event: ", error);
      setError("Failed to add event. Please make sure all fields are correctly filled and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing form fields for title, description, etc. */}
      <div>
        <label htmlFor="image">Image:</ilabel>
        <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
      </div>
      {/* Error message and submit button */}
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;