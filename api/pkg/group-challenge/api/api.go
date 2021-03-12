package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

var (
	con          *pg.DB
	sessionStore *auth.PGSessionStore
)

// API Handler
////////

func partiesHandler(c *gin.Context) {
	parties := &[]models.Party{}
	err := models.GetAllParties(parties, con)

	if err != nil {
		c.Status(500)
		return
	}

	c.JSON(200, parties)
}

type partyRequestBody struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
}

func addPartyHandler(c *gin.Context) {
	//_session, _ := c.Get("session")
	//session := _session.(*models.Session)

	// TODO validation
	body := partyRequestBody{}
	c.BindJSON(&body)

	party := &models.Party{
		Name: body.Name,
		//URLName:     body.Name, // TODO
		//Admin:       session.User,
		Description: body.Description,
		Category:    body.Category,
		StartDate:   body.StartDate,
		EndDate:     body.EndDate,
		//Submissions: []uuid.UUID{},
	}
	party.Insert(con)
	c.JSON(200, party)
}

type partySubmissionRequestBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
}

func getFileFromRequest(c *gin.Context, key string) string {
	file, header, err := c.Request.FormFile(key)
	filename := header.Filename
	fmt.Println(header.Filename)
	filePath := "./tmp/" + filename + ".png"
	out, err := os.Create(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		log.Fatal(err)
	}

	return filePath
}

func addPartySubmissionHandler(c *gin.Context) {
	// TODO validation
	partyID, ok := c.Params.Get("id")
	if !ok {
		c.Status(http.StatusBadRequest)
		return
	}

	body := partySubmissionRequestBody{}
	c.BindJSON(&body)

	partySubmission := &models.PartySubmission{
		Name:        body.Name,
		Description: body.Description,
		ImageURL:    body.ImageURL,
		ImageData:   nil,
	}
	partySubmission.Insert(con)

	party := &models.Party{
		ID: uuid.FromStringOrNil(partyID),
	}
	party.Select(con)
	party.Update(con)

	c.JSON(200, partySubmission)
}

func partyByIDHandler(c *gin.Context) {
	// TODO validation
	partyID, ok := c.Params.Get("id")
	if !ok {
		c.Status(http.StatusBadRequest)
		return
	}

	party := &models.Party{
		ID: uuid.FromStringOrNil(partyID),
	}

	party.Select(con)
	fmt.Println(uuid.FromStringOrNil(partyID))

	c.JSON(200, party)
}

type userSession struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Token    string `json:"token"`
}

func signinHandler(c *gin.Context) {
	token := c.Request.Header.Get("Authorization")
	user, err := auth.GetUserFromToken(con, token)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	session := sessionStore.CreateSessionForUser(user)

	c.JSON(http.StatusOK, &userSession{
		ID:       user.ID.String(),
		Username: user.Username,
		Token:    session.ID.String(),
	})
}

func signoutHandler(c *gin.Context) {
	sessionStore.DeleteSession(c)
	c.Status(http.StatusOK)
}

type userSignUpRequestBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

func registerHandler(c *gin.Context) {
	body := userSignUpRequestBody{}
	c.BindJSON(&body)

	if body.Username == "" || body.Password == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user data",
		})
		return
	}

	user := auth.CreateUser(body.Username, body.Password, body.Email)
	user.Insert(con)
	c.JSON(200, user)
}

func createWsHandler() gin.HandlerFunc {
	hub := ws.NewHub()
	go hub.Run()
	go hub.LogClients()

	return func(c *gin.Context) {
		ws.ServeWs(hub, c.Writer, c.Request)
	}
}

// API Configuration
////////

func configureAPIRouter(router *gin.Engine, con *pg.DB) {
	v1 := router.Group("/_api/v1")
	{
		party := v1.Group("/parties")
		{
			party.GET("", partiesHandler)
			party.POST("", addPartyHandler)
			party.GET("/:id", partyByIDHandler)
			party.POST("/:id/submission", addPartySubmissionHandler)
		}
		auth := v1.Group("/auth")
		{
			auth.POST("/signin", signinHandler)
			auth.POST("/signout", signoutHandler)
			auth.POST("/register", registerHandler)
		}

		v1.GET("ws", createWsHandler())
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig, _con *pg.DB) {
	con = _con

	// temp tests
	userID, _ := uuid.NewV4()
	party := &models.Party{
		Name:        "test Party",
		Description: "test Description",
		StartDate:   time.Now(),
		Category:    "photo",
		EndDate:     time.Now(),
		UserID:      userID,
		Slug:        "test-slug",
	}
	party.TestWrite(con)
	err := party.Select(con)
	fmt.Println(err)
	fmt.Println(party.Submissions[0].ID)

	// router setup
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Authorization", auth.XAuthTokenHeader}
	router.Use(cors.New(config))

	// sessions
	sessionStore = auth.CreatePGSessionStore(con)
	router.Use(sessionStore.InjectSessionMiddleware())
	router.Use(sessionStore.RequireSessionMiddleware([]string{"/_api/v1/parties"}))

	// static files
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))
	router.NoRoute(func(c *gin.Context) {
		c.File(path.Join(serverConfig.StaticFilesDir, "index.html"))
	})

	// api and ws
	configureAPIRouter(router, con)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
