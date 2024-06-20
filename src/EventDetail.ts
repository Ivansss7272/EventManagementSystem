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

type State = {
  eventDetails: Event | null;
  isLoading: boolean;
  error: string | null;
}

const EventDetails: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [state, setState] = useState<State>({ eventDetails: null, isLoading: true, error: null });

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axios.get(`${APIUrl}/events/${eventId}`);
        setState({ eventDetails: data, isLoading: false, error: null });
      } catch (error: any) {
        console.error("Failed to fetch event details", error);
        let errorMessage = "Failed to fetch event details";
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        setState({ eventDetails: null, isLoading: false, error: errorMessage });
      }
    };

    fetchEventDetails();
  }, [eventId, API_URL]);

  const { eventDetails, isLoading, error } = state;

  return (
    <div>
      {isLoading ? (
        <p>Loading event details...</p>
      ) : error ? (
        <p>Error loading event details: {error}</p>
      ) : eventDetails ? (
        <div>
          <h2>{eventDetails.title}</h2>
          <p><strong>Description:</strong> {eventDetails.description}</p>
          <p><strong>Date:</strong> {eventDetails.date}</p>
          <p><strong.Time:</strong> {eventDetails.time}</p>
          <p><strong.Location:</strong> {eventDetails.location}</p>
          <p><strong.Organizer:</strong> {eventDetails.organize}</p>
        </div>
      ) : (
        <p>Event details are not available.</p>
      )}
    </div>
  );
};

export default EventDetails;