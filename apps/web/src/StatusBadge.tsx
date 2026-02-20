const STATUS_COLORS: Record<string, string> = {
  todo: '#9ca3af',
  in_progress: '#3b82f6',
  done: '#22c55e',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'todo',
  in_progress: 'in progress',
  done: 'done',
}

interface StatusBadgeProps {
  status: string
  onClick?: () => void
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? '#9ca3af'
  const label = STATUS_LABELS[status] ?? status
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
    <button type="button" style={style} onClick={onClick}>
      {label}
    </button>
  )
}
