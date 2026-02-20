import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import App from './App'

const MOCK_TASKS = [
  { id: '1', title: 'Write tests', description: '', status: 'todo', assignedTo: '' },
  { id: '2', title: 'Implement feature', description: '', status: 'in_progress', assignedTo: '' },
  { id: '3', title: 'Deploy', description: '', status: 'done', assignedTo: '' },
]

describe('App', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock

    // Default: GET /api/tasks returns MOCK_TASKS
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_TASKS),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders tasks with status badges', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument()
    })

    // Status badges should appear
    expect(screen.getByText('todo')).toBeInTheDocument()
    expect(screen.getByText('in progress')).toBeInTheDocument()
    expect(screen.getByText('done')).toBeInTheDocument()
  })

  it('clicking a todo badge calls PATCH and updates to in_progress', async () => {
    const user = userEvent.setup()

    // First call: GET /api/tasks
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(MOCK_TASKS),
    })

    // Second call: PATCH /api/tasks/1/status
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...MOCK_TASKS[0], status: 'in_progress' }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'todo' }))

    // Verify PATCH was called
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks/1/status',
      expect.objectContaining({ method: 'PATCH' }),
    )

    // UI should optimistically update — "todo" badge should be gone,
    // replaced by another "in progress" badge
    await waitFor(() => {
      expect(screen.queryByText('todo')).not.toBeInTheDocument()
    })
  })

  it('clicking an in_progress badge calls PATCH and updates to done', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(MOCK_TASKS),
    })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...MOCK_TASKS[1], status: 'done' }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Implement feature')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'in progress' }))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks/2/status',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('done badges are rendered as spans, not buttons', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Deploy')).toBeInTheDocument()
    })

    const doneBadge = screen.getByText('done')
    expect(doneBadge.tagName).toBe('SPAN')
  })
})
