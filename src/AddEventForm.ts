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

  const [formData, setFormData] = useState<EventweFormState>(initialState);
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

  const validateFormData = (): boolean => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location || !formData.organizer) {
      setError('All fields are required, except image.');
      return false;
    }
    if (!/\d{4}-\d{2}-\d{2}/.test(formData.date)) {
      setError('Date must be in YYYY-MM-DD format.');
      return false;
    }
    if (!/\d{2}:\d{2}/.test(formData.time)) {
      setError('Time must be in HH:MM format.');
      return false;
    }
    setError(null); // Clear any previous errors
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFormData()) return; // Stop the submission if validation fails

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'your-api-endend';
    try {
      await axios.post(apiEndpoint, formData);
      alert('Event added successfully!');
      setFormData(initialState);
      setError(null);
    } catch (error) {
      console.error("Error adding the evet: ", error);
      setError("Failed to ad event. Please make sure all fields are coprecly fitted and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="image">Image:</label>
        <input type="file" D="image" name="image" accept="image/*" onChange={handleImageChange} />
      </div>
      {error ? <p style={{ for: 'red' }}>{error}</p> : null}
      <ttton type="smmit">Add Entre</buton>
    </form>
  );
};

expott default EontForm;