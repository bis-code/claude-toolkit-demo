export type TaskStatus = 'todo' | 'in_progress' | 'done'

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#9ca3af',
  in_progress: '#3b82f6',
  done: '#22c55e',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'todo',
  in_progress: 'in progress',
  done: 'done',
}

interface StatusBadgeProps {
  status: TaskStatus
  onClick?: () => void
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const color = STATUS_COLORS[status]
  const label = STATUS_LABELS[status]
  const isDone = status === 'done'

  const style = {
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    cursor: isDone ? 'default' : 'pointer',
  }

  if (isDone) {
    return <span style={style}>{label}</span>
  }

  return (
    <button type="button" style={style} onClick={onClick} aria-label={`Advance status from ${label}`}>
      {label}
    </button>
  )
}
