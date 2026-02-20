package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStatusIsValid(t *testing.T) {
	tests := []struct {
		name   string
		status Status
		want   bool
	}{
		{"todo is valid", StatusTodo, true},
		{"in_progress is valid", StatusInProgress, true},
		{"done is valid", StatusDone, true},
		{"empty string is invalid", Status(""), false},
		{"arbitrary string is invalid", Status("invalid"), false},
		{"uppercase DONE is invalid", Status("DONE"), false},
		{"banana is invalid", Status("banana"), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.status.IsValid()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestStatusCanTransitionTo(t *testing.T) {
	tests := []struct {
		name string
		from Status
		to   Status
		want bool
	}{
		// Allowed transitions (forward only)
		{"todo to in_progress", StatusTodo, StatusInProgress, true},
		{"todo to done", StatusTodo, StatusDone, true},
		{"in_progress to done", StatusInProgress, StatusDone, true},

		// Rejected transitions (backward or same)
		{"done to todo", StatusDone, StatusTodo, false},
		{"done to in_progress", StatusDone, StatusInProgress, false},
		{"in_progress to todo", StatusInProgress, StatusTodo, false},
		{"todo to todo", StatusTodo, StatusTodo, false},
		{"done to done", StatusDone, StatusDone, false},

		// Invalid source or target
		{"invalid source to in_progress", Status("garbage"), StatusInProgress, false},
		{"todo to invalid target", StatusTodo, Status("nope"), false},
		{"invalid source to invalid target", Status("x"), Status("y"), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.from.CanTransitionTo(tt.to)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestStatusNextStatus(t *testing.T) {
	tests := []struct {
		name     string
		status   Status
		wantNext Status
		wantOk   bool
	}{
		{"todo advances to in_progress", StatusTodo, StatusInProgress, true},
		{"in_progress advances to done", StatusInProgress, StatusDone, true},
		{"done has no next status", StatusDone, "", false},
		{"garbage has no next status", Status("garbage"), "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, ok := tt.status.NextStatus()
			assert.Equal(t, tt.wantOk, ok)
			assert.Equal(t, tt.wantNext, got)
		})
	}
}
