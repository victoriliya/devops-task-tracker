// These tests run in the CI pipeline. If any fails, the image is NOT built.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('Task Tracker', () => {
  it('shows the starter tasks', () => {
    render(<App />)
    expect(screen.getByText('Write a Dockerfile')).toBeInTheDocument()
    expect(screen.getByTestId('remaining')).toHaveTextContent('2 tasks left')
  })

  it('adds a new task', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText('New task'), 'Run docker compose')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Run docker compose')).toBeInTheDocument()
    expect(screen.getByTestId('remaining')).toHaveTextContent('3 tasks left')
  })

  it('ignores empty tasks', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('marks a task as done', async () => {
    render(<App />)
    await userEvent.click(screen.getByLabelText('Add a GitHub Actions workflow'))
    expect(screen.getByTestId('remaining')).toHaveTextContent('1 task left')
  })

  it('deletes a task', async () => {
    render(<App />)
    await userEvent.click(screen.getByLabelText('Delete Write a Dockerfile'))
    expect(screen.queryByText('Write a Dockerfile')).not.toBeInTheDocument()
  })
})
