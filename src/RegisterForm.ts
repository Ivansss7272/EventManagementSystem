import React, { useState, FormEvent } from 'react';
import axios from 'axios';

type FormData = {
  name: string;
  email: string;
};

const EventRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrorMessage('');
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const API_ENDPOINT = process.env.REACT_APP_REGISTRATION_API_ENDPOINT || 'http://example.com/api/register';

    try {
      await axios.post(API_ENDPOINT, formData);
      alert('Registration successful!');
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Registration failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(`Registration failed: ${error.response.data?.message || 'Please try again later.'}`);
      } else {
        setErrorMessage('Registration failed, please try again later.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      { errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div> }
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default EventRegistrationForm;