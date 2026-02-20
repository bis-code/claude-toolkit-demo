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

// statusSequence defines the ordered lifecycle of a task status.
var statusSequence = []Status{StatusTodo, StatusInProgress, StatusDone}

// NextStatus returns the next status in the lifecycle sequence.
// Returns ("", false) if the status is the final state or unrecognized.
func (s Status) NextStatus() (Status, bool) {
	for i, st := range statusSequence {
		if st == s && i+1 < len(statusSequence) {
			return statusSequence[i+1], true
		}
	}
	return "", false
}

// IsValid returns true if the status is a recognized value.
func (s Status) IsValid() bool {
	_, ok := statusOrder[s]
	return ok
}

// CanTransitionTo returns true if moving from s to next is allowed.
// Transitions must be forward-only (higher order value).
func (s Status) CanTransitionTo(next Status) bool {
	fromOrd, fromOk := statusOrder[s]
	toOrd, toOk := statusOrder[next]
	if !fromOk || !toOk {
		return false
	}
	return toOrd > fromOrd
}
