package ws

import (
	"log"
	"time"
)

type GCWebSocketEvent struct {
	Key       []string    `json:"key"`
	Operation string      `json:"operation"`
	Data      interface{} `json:"data"`
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	Broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

// NewHub create a new ws hub
func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

// LogClients logs all clients pericdically
func (hub *Hub) LogClients(tick time.Duration) {
	func() {
		for range time.Tick(tick) {
			log.Printf("[INFO] connected ws clients: %d", len(hub.clients))
		}
	}()
}

// Run run hub
func (hub *Hub) Run() {
	for {
		select {
		case client := <-hub.register:
			hub.clients[client] = true
		case client := <-hub.unregister:
			if _, ok := hub.clients[client]; ok {
				delete(hub.clients, client)
				close(client.send)
			}
		case message := <-hub.Broadcast:
			for client := range hub.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(hub.clients, client)
				}
			}
		}
	}
}
