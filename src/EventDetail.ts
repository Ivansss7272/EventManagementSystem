import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Event = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
};

const EventDetails: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [eventDetails, setEventDetails] = useState<Event | null>(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/events/${eventId}`);
        setEventDetails(data);
      } catch (error) {
        console.error("Failed to fetch event details", error);
      }
    };

    fetchEventDetails();
  }, [eventId, API_URL]);

  return (
    <div>
      {eventDetails ? (
        <div>
          <h2>{eventDetails.title}</h2>
          <p><strong>Description:</strong> {eventDetails.description}</p>
          <p><strong>Date:</strong> {eventDetails.date}</p>
          <p><strong>Time:</strong> {eventDetails.time}</p>
          <p><strong>Location:</strong> {eventDetails.location}</p>
          <p><strong>Organizer:</strong> {eventDetails.organizer}</p>
        </div>
      ) : (
        <p>Loading event details...</p>
      )}
    </div>
  );
};

export default EventDetails;