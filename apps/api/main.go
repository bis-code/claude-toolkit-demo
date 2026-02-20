package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Task struct {
	ID          string `json:"id" gorm:"primaryKey"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Status      Status `json:"status" gorm:"default:todo"`
	AssignedTo  string `json:"assignedTo"`
}

var db *gorm.DB

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("tasks.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}
	db.AutoMigrate(&Task{})

	r := gin.Default()
	r.Use(cors.Default()) // TODO: restrict CORS origins for production

	r.POST("/api/tasks", createTask)
	r.GET("/api/tasks", listTasks)
	r.GET("/api/tasks/:id", getTask)
	r.PUT("/api/tasks/:id", updateTask)
	r.DELETE("/api/tasks/:id", deleteTask)
	r.PATCH("/api/tasks/:id/status", advanceTaskStatus)

	r.Run(":8080")
}

func createTask(c *gin.Context) {
	var task Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	task.ID = uuid.New().String()
	task.Status = StatusTodo
	db.Create(&task)
	c.JSON(http.StatusCreated, task)
}

func listTasks(c *gin.Context) {
	var tasks []Task
	db.Find(&tasks)
	c.JSON(http.StatusOK, tasks)
}

func getTask(c *gin.Context) {
	var task Task
	if err := db.First(&task, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}
	c.JSON(http.StatusOK, task)
}

func updateTask(c *gin.Context) {
	var task Task
	if err := db.First(&task, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	currentStatus := task.Status

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !task.Status.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}

	if task.Status != currentStatus && !currentStatus.CanTransitionTo(task.Status) {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "invalid status transition"})
		return
	}

	if err := db.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save task"})
		return
	}
	c.JSON(http.StatusOK, task)
}

func advanceTaskStatus(c *gin.Context) {
	var task Task
	if err := db.First(&task, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	next, ok := task.Status.NextStatus()
	if !ok {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "task is already done"})
		return
	}

	task.Status = next
	if err := db.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save task"})
		return
	}
	c.JSON(http.StatusOK, task)
}

func deleteTask(c *gin.Context) {
	if err := db.Delete(&Task{}, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}
	c.Status(http.StatusNoContent)
}
