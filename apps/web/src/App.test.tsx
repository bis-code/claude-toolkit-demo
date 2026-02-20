import { render, screen, waitFor, cleanup } from '@testing-library/react'
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
    fetchMock = vi.fn().mockRejectedValue(new Error('Unexpected fetch call'))
    global.fetch = fetchMock

    // Default first call: GET /api/tasks
    fetchMock.mockResolvedValueOnce({
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

    expect(screen.getByText('todo')).toBeInTheDocument()
    expect(screen.getByText('in progress')).toBeInTheDocument()
    expect(screen.getByText('done')).toBeInTheDocument()
  })

  it('clicking a todo badge calls PATCH and updates to in_progress', async () => {
    const user = userEvent.setup()

    // PATCH response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...MOCK_TASKS[0], status: 'in_progress' }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Advance status from todo' }))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks/1/status',
      expect.objectContaining({ method: 'PATCH' }),
    )

    await waitFor(() => {
      expect(screen.queryByText('todo')).not.toBeInTheDocument()
    })
  })

  it('clicking an in_progress badge calls PATCH and updates to done', async () => {
    const user = userEvent.setup()

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...MOCK_TASKS[1], status: 'done' }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Implement feature')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Advance status from in progress' }))

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

  it('rolls back status when PATCH fails', async () => {
    const user = userEvent.setup()

    // PATCH fails with 422
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ error: 'task is already done' }),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Advance status from todo' }))

    // Should rollback to original status
    await waitFor(() => {
      expect(screen.getByText('todo')).toBeInTheDocument()
    })
  })

  it('rolls back status on network error', async () => {
    const user = userEvent.setup()

    // PATCH throws network error
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Advance status from todo' }))

    // Should rollback to original status
    await waitFor(() => {
      expect(screen.getByText('todo')).toBeInTheDocument()
    })
  })
})
