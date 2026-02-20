import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { StatusBadge } from './StatusBadge'

afterEach(() => {
  cleanup()
})

describe('StatusBadge', () => {
  // --- Rendering tests ---

  it('renders "todo" text with gray background', () => {
    render(<StatusBadge status="todo" />)
    const badge = screen.getByText('todo')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#9ca3af' })
  })

  it('renders "in_progress" as "in progress" with blue background', () => {
    render(<StatusBadge status="in_progress" />)
    const badge = screen.getByText('in progress')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#3b82f6' })
  })

  it('renders "done" text with green background', () => {
    render(<StatusBadge status="done" />)
    const badge = screen.getByText('done')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#22c55e' })
  })

  // --- Clickability tests ---

  it('renders todo as a button', () => {
    render(<StatusBadge status="todo" onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'todo' })).toBeInTheDocument()
  })

  it('renders in_progress as a button', () => {
    render(<StatusBadge status="in_progress" onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'in progress' })).toBeInTheDocument()
  })

  it('renders done as a span, not a button', () => {
    render(<StatusBadge status="done" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('done').tagName).toBe('SPAN')
  })

  // --- onClick behavior ---

  it('calls onClick when clicking a todo badge', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StatusBadge status="todo" onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'todo' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when clicking an in_progress badge', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<StatusBadge status="in_progress" onClick={onClick} />)

    await user.click(screen.getByRole('button', { name: 'in progress' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
