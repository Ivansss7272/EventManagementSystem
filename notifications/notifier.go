package main

import (
    "encoding/json"
    "fmt"
    "log"
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

    return events, nil
}

func fetchRegisteredUsers() ([]User, error) {
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