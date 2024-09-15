package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

type Event struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
}

type User struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
}

var (
	eventsURL      = os.Getenv("EVENTS_URL")
	usersURL       = os.Getenv("USERS_URL")
	reminderBefore = os.Getenv("REMINDER_BEFORE")
	cacheDuration  = 10 * time.Minute // Caching duration for events and users
)

// Define cache structure for events and users
type cache[T any] struct {
	data          []T
	lastUpdated   time.Time
	cacheDuration time.Duration
	mutex         sync.RWMutex
}

func (c *cache[T]) getCache() ([]T, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if time.Since(c.lastUpdated) < c.cacheDuration {
		return c.data, true
	}
	return nil, false
}

func (c *cache[T]) updateCache(data []T) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.data = data
	c.lastUpdated = time.Now()
}

var (
	eventsCache = cache[Event]{cacheDuration: cacheDuration}
	usersCache  = cache[User]{cacheDuration: cacheDuration}
)

func fetchUpcomingEvents() ([]Event, error) {
	if cachedEvents, found := eventsCache.getCache(); found {
		return cachedEvents, nil
	}

	resp, err := http.Get(eventsURL)
	if err != nil {
		return nil, fmt.Errorf("error fetching events: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("received non-OK HTTP status from events service: %s", resp.Status)
	}

	var events []Event
	if err := json.NewDecoder(resp.Body).Decode(&events); err != nil {
		return nil, fmt.Errorf("error decoding events data: %w", err)
	}

	eventsCache.updateCache(events)
	return events, nil
}

func fetchRegisteredUsers() ([]User, error) {
	if cachedUsers, found := usersCache.getCache(); found {
		return cachedUsers, nil
	}

	resp, err := http.Get(usersURL)
	if err != nil {
		return nil, fmt.Errorf("error fetching users: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("received non-OK HTTP status from users service: %s", resp.Status)
	}

	var users []User
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, fmt.Errorf("error decoding users data: %w", err)
	}

	usersCache.updateCache(users)
	return users, nil
}

func sendReminder(user User, event Event) {
	fmt.Printf("Reminder sent to user: %v for event: %v\n", user.Email, event.Title)
}

func checkAndSendReminders() {
	events, err := fetchUpcomingEvents()
	if err != nil {
		log.Println("Error fetching events:", err)
		return
	}

	users, err := fetchRegisteredUsers()
	if err != nil {
		log.Println("Error fetching users:", err)
		return
	}

	reminderDuration, err := time.ParseDuration(reminderBefore)
	if err != nil {
		log.Println("Invalid reminder duration:", err)
		return
	}

	for _, event := range events {
		if time.Until(event.Date) <= reminderDuration {
			for _, user := range users {
				sendReminder(user, event)
			}
		}
	}
}

func main() {
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()

	go func() {
		for {
			<-ticker.C
			checkAndSendReminders()
		}
	}()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Event Reminder Service is running!")
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start HTTP server: %v", err)
	}
}