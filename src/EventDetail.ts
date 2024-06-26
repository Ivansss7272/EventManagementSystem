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

type EventDetailsState = {
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

const EventDetailComponent: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [eventDetailsState, setEventDetailsState] = useState<EventDetailsState>({ currentEvent: null, isLoading: true, error: null });

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadEventDetails();
  }, [eventId, API_URL]);

  const loadEventDetails = async () => {
    try {
      const response = await fetchEventDetails();
      setEventDetailsState({ currentEvent: response.data, isLoading: false, error: null });
    } catch (error) {
      handleLoadingError(error);
    }
  };

  const fetchEventDetails = async () => {
    return axios.get(`${API_URL}/events/${eventId}`);
  };

  const handleLoadingError = (error: any) => {
    console.error("Failed to load event details", error);
    let errorMessage = "Failed to load event details";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    setEventDetailsState({ currentEvent: null, isLoading: false, error: errorMessage });
  };

  const { currentEvent, isLoading, error } = eventDetailsState;

  return (
    <div>
      {isLoading ? (
        <p>Loading event details...</p>
      ) : error ? (
        <p>Error loading event details: {error}</p>
      ) : currentRequest ? (
        renderEventDetails(currentEvent)
      ) : (
        <p>Event details are not available.</p>
      )}
    </div>
  );
};

const renderEventDetails = (event: Event) => (
  <div>
    <h2>{event.title}</h2>
    <p><strong>Description:</strong> {event.description}</p>
    <p><strong>Date:</strong> {event.date}</p>
    <p><strong>Time:</strong> {event.time}</p>
    <p><strong>Location:</strong> {event.location}</p>
    <p><strong>Organizer:</strong> {event.organizer}</p>
  </div>
);

export default EventDetailComponent;