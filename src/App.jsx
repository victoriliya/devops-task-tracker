import { useState } from 'react'

// The app version is injected at build time (see Dockerfile / workflow).
// It lets students SEE which build is running after a deploy.
const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'local-dev'

const STARTER_TASKS = [
  { id: 1, title: 'Write a Dockerfile', done: true },
  { id: 2, title: 'Add a GitHub Actions workflow', done: false },
  { id: 3, title: 'Push the image to a registry', done: false },
]

export default function App() {
  const [tasks, setTasks] = useState(STARTER_TASKS)
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')

  function addTask(event) {
    event.preventDefault()
    const clean = title.trim()
    if (!clean) return
    setTasks([...tasks, { id: Date.now(), title: clean, done: false }])
    setTitle('')
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const visible = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
  )
  const remaining = tasks.filter((t) => !t.done).length

  return (
    <main className="container">
      <header>
        <h1>Task Tracker</h1>
        <p className="subtitle">DevOps Lab · build <code>{APP_VERSION}</code></p>
      </header>

      <form onSubmit={addTask} className="add-form">
        <label htmlFor="new-task" className="sr-only">New task</label>
        <input
          id="new-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>

      <div className="filters" role="group" aria-label="Filter tasks">
        {['all', 'open', 'done'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="task-list">
        {visible.map((task) => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              {task.title}
            </label>
            <button
              className="delete"
              aria-label={`Delete ${task.title}`}
              onClick={() => deleteTask(task.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p className="count" data-testid="remaining">
        {remaining} task{remaining === 1 ? '' : 's'} left
      </p>
    </main>
  )
}
