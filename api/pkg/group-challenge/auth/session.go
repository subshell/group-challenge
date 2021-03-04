package auth

import (
	"errors"
	"group-challenge/pkg/group-challenge/models"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

// TODO: handle invalidation based on time

const (
	sessionIDCookie = "gcsession"
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

// CreateSessionForUser creates and persists a session for an existing user and sets the session cookie.
func (store *PGSessionStore) CreateSessionForUser(context *gin.Context, user *models.User) *models.Session {
	userSession := &models.Session{
		User: &user.ID,
	}

	if userSession.Exists(store.Con) {
		userSession.Select(store.Con)
	} else {
		userSession.Insert(store.Con)
	}

	context.SetCookie(sessionIDCookie, userSession.ID.String(), 360*24*60*60, "", "", false, true)

	return userSession
}

// DeleteSession deletes a session and invalidates the cookie
func (store *PGSessionStore) DeleteSession(context *gin.Context) bool {
	session, ok := context.Get("session")

	if !ok {
		return false
	}

	typedSession := session.(*models.Session)

	context.SetCookie(sessionIDCookie, typedSession.ID.String(), -1, "", "", false, true)
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

// InjectSessionMiddleware returns a middleware that will inject the session based on the gin context cookie
func (store *PGSessionStore) InjectSessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie(sessionIDCookie)

		// check if the cookies is present
		if err != nil {
			c.Next()
			return
		}

		session := &models.Session{
			ID: uuid.FromStringOrNil(cookie.Value),
		}

		session.Select(store.Con)

		c.Set("session", session)
		c.Next()
	}
}

// RequireSessionMiddleware returns a middleware that will inject the session based on the gin context cookie
func (store *PGSessionStore) RequireSessionMiddleware(pathPrefixes []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, pathPrefix := range pathPrefixes {
			if !strings.HasPrefix(c.Request.URL.Path, pathPrefix) {
				continue
			}

			if cookie, err := c.Request.Cookie(sessionIDCookie); err != nil {
				c.AbortWithStatus(401)
				return
			} else {
				// TODO validate cookie
				log.Println(cookie)
				c.Next()
			}
		}

		c.Next()
	}
}
