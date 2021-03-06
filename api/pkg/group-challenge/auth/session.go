package auth

import (
	"errors"
	"group-challenge/pkg/group-challenge/models"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

const (
	// XAuthTokenHeader is a http header key pointing to the session token
	XAuthTokenHeader = "X-AuthToken"
)

// GenericSessionStore handles session
type GenericSessionStore interface {
	CreateSessionForUser(context *gin.Context, user models.User) *models.Session
	DeleteSession(context *gin.Context) bool
	HasSession(sessionID uuid.UUID) bool
	GetSession(sessionID uuid.UUID) (*models.Session, error)
	InjectSessionMiddleware() gin.HandlerFunc
	RequireSessionMiddleware(pathPrefixes []string) gin.HandlerFunc
}

// PGSessionStore postgres Session store
type PGSessionStore struct {
	Con *pg.DB
}

// CreatePGSessionStore creates a postgres based session store
func CreatePGSessionStore(con *pg.DB) *PGSessionStore {
	return &PGSessionStore{
		Con: con,
	}
}

// CreateSessionForUser creates and persists a session for an existing user
func (store *PGSessionStore) CreateSessionForUser(user *models.User) *models.Session {
	userSession := &models.Session{
		User: user.ID,
	}

	if userSession.Exists(store.Con) {
		userSession.Select(store.Con)
	} else {
		userSession.Insert(store.Con)
	}

	return userSession
}

// DeleteSession deletes a session
func (store *PGSessionStore) DeleteSession(context *gin.Context) bool {
	session, ok := context.Get("session")

	if !ok {
		return false
	}

	typedSession := session.(*models.Session)

	return typedSession.Delete(store.Con) == nil
}

// HasSession checks if the session exists
func (store *PGSessionStore) HasSession(sessionID uuid.UUID) bool {
	userSession := &models.Session{
		ID: sessionID,
	}
	return userSession.Exists(store.Con)
}

// GetSession gets the session based on the session Id
func (store *PGSessionStore) GetSession(sessionID uuid.UUID) (*models.Session, error) {
	if !store.HasSession(sessionID) {
		return nil, errors.New("session does not exist")
	}

	userSession := &models.Session{
		ID: sessionID,
	}

	userSession.Select(store.Con)
	return userSession, nil
}

// InjectSessionMiddleware returns a middleware that will inject the session based on the token header
func (store *PGSessionStore) InjectSessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Request.Header.Get(XAuthTokenHeader)

		if token == "" {
			c.Next()
			return
		}

		session := &models.Session{
			ID: uuid.FromStringOrNil(token),
		}

		session.Select(store.Con)

		if session.User != uuid.Nil {
			c.Set("session", session)
		}

		c.Next()
	}
}

// RequireSessionMiddleware returns a middleware that will inject the session based on the gin context header
func (store *PGSessionStore) RequireSessionMiddleware(pathPrefixes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, pathPrefix := range pathPrefixes {
			if !strings.HasPrefix(c.Request.URL.Path, pathPrefix) {
				continue
			}

			session, ok := c.Get("session")

			if !ok {
				c.AbortWithStatus(401)
				return
			}

			session = session.(*models.Session)

			c.Next()
			return
		}

		c.Next()
	}
}
