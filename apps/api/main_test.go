package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestRouter(t *testing.T) *gin.Engine {
	t.Helper()

	gin.SetMode(gin.TestMode)

	testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err, "failed to open in-memory database")

	err = testDB.AutoMigrate(&Task{})
	require.NoError(t, err, "failed to auto-migrate Task")

	db = testDB

	r := gin.New()

	r.POST("/api/tasks", createTask)
	r.GET("/api/tasks", listTasks)
	r.GET("/api/tasks/:id", getTask)
	r.PUT("/api/tasks/:id", updateTask)
	r.DELETE("/api/tasks/:id", deleteTask)
	r.PATCH("/api/tasks/:id/status", advanceTaskStatus)

	return r
}

func seedTask(t *testing.T, id string, status Status) {
	t.Helper()
	task := Task{
		ID:     id,
		Title:  "Test Task",
		Status: status,
	}
	result := db.Create(&task)
	require.NoError(t, result.Error, "failed to seed task")
}

func TestAdvanceTaskStatus(t *testing.T) {
	tests := []struct {
		name       string
		seedID     string
		seedStatus Status
		seed       bool
		requestID  string
		wantCode   int
		wantStatus Status
	}{
		{
			name:       "advance todo to in_progress",
			seedID:     "task-1",
			seedStatus: StatusTodo,
			seed:       true,
			requestID:  "task-1",
			wantCode:   http.StatusOK,
			wantStatus: StatusInProgress,
		},
		{
			name:       "advance in_progress to done",
			seedID:     "task-2",
			seedStatus: StatusInProgress,
			seed:       true,
			requestID:  "task-2",
			wantCode:   http.StatusOK,
			wantStatus: StatusDone,
		},
		{
			name:      "404 for nonexistent task",
			seed:      false,
			requestID: "nonexistent",
			wantCode:  http.StatusNotFound,
		},
		{
			name:       "422 when task already done",
			seedID:     "task-3",
			seedStatus: StatusDone,
			seed:       true,
			requestID:  "task-3",
			wantCode:   http.StatusUnprocessableEntity,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := setupTestRouter(t)

			if tt.seed {
				seedTask(t, tt.seedID, tt.seedStatus)
			}

			req := httptest.NewRequest(http.MethodPatch, "/api/tasks/"+tt.requestID+"/status", strings.NewReader(""))
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantCode, w.Code)

			if tt.wantCode == http.StatusOK {
				var body map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &body)
				require.NoError(t, err, "failed to parse response body")
				assert.Equal(t, string(tt.wantStatus), body["status"])
			}
		})
	}
}
