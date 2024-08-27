package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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
)

func fetchUpcomingEvents() ([]Event, error) {
	resp, err := http.Get(eventsURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var events []Event
	if err := json.NewDecoder(resp.Body).Decode(&events); err != nil {
		return nil, err
	}

	return events, nil
}

func fetchRegisteredUsers() ([]User, error) {
	resp, err := http.Get(usersURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var users []User
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return nil, err
	}

	return users, nil
}

func sendReminder(user User, event Event) {
	fmt.Printf("Reminder sent to user: %v for event: %v\n", user.Email, event.Title)
}

func checkAndSendReminders() {
	events, err := fetchUpcomingEvents()
	if err != nil {
		fmt.Println("Error fetching events:", err)
		return
	}

	users, err := fetchRegisteredUsers()
	if err != nil {
		fmt.Println("Error fetching users:", err)
		return
	}

	reminderDuration, err := time.ParseDuration(reminderBefore)
	if err != nil {
		fmt.Println("Invalid reminder duration:", err)
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
	http.ListenAndServe(":8080", nil)
}