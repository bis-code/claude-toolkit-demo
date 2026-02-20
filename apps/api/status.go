package main

// Status represents the lifecycle state of a task.
type Status string

const (
	StatusTodo       Status = "todo"
	StatusInProgress Status = "in_progress"
	StatusDone       Status = "done"
)

var statusOrder = map[Status]int{
	StatusTodo:       0,
	StatusInProgress: 1,
	StatusDone:       2,
}

// IsValid returns true if the status is a recognized value.
func (s Status) IsValid() bool {
	switch s {
	case StatusTodo, StatusInProgress, StatusDone:
		return true
	default:
		return false
	}
}

// CanTransitionTo returns true if moving from s to next is allowed.
// Transitions must be forward-only (higher order value).
func (s Status) CanTransitionTo(next Status) bool {
	if !next.IsValid() {
		return false
	}
	return statusOrder[next] > statusOrder[s]
}
