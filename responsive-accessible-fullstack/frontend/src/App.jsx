import { useEffect, useMemo, useRef, useState } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      const response = await fetch(`${API}/tasks`);
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch {
      setMessage("Could not connect to the backend. Start the server on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      titleRef.current?.focus();
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to create task.");
        return;
      }

      setTasks((current) => [data.task, ...current]);
      setTitle("");
      setDescription("");
      setMessage("Task added successfully.");
      titleRef.current?.focus();
    } catch {
      setMessage("Server connection failed.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`${API}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to update task.");
        return;
      }

      setTasks((current) =>
        current.map((item) => item.id === task.id ? data.task : item)
      );
      setMessage(data.task.completed ? "Task marked complete." : "Task marked active.");
    } catch {
      setMessage("Server connection failed.");
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to delete task.");
        return;
      }

      setTasks((current) => current.filter((task) => task.id !== id));
      setMessage("Task deleted.");
    } catch {
      setMessage("Server connection failed.");
    }
  }

  async function clearCompleted() {
    const completed = tasks.filter((task) => task.completed);

    for (const task of completed) {
      await fetch(`${API}/tasks/${task.id}`, { method: "DELETE" });
    }

    setTasks((current) => current.filter((task) => !task.completed));
    setMessage(`${completed.length} completed task(s) cleared.`);
  }

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "completed" && task.completed);

      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="site-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">A</div>
          <div>
            <strong>AccessBoard</strong>
            <span>Responsive Task Manager</span>
          </div>
        </div>

        <nav aria-label="Primary navigation">
          <a href="#tasks">Tasks</a>
          <a href="#accessibility">Accessibility</a>
        </nav>
      </header>

      <main id="main-content" className="container">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">RESPONSIVE, ACCESSIBLE INTERFACE</p>
            <h1 id="page-title">Plan your work. <span>Access it anywhere.</span></h1>
            <p className="hero-copy">
              A full-stack task manager designed to work on phones, desktops,
              and completely with a keyboard.
            </p>
          </div>

          <div className="stats" aria-label="Task statistics">
            <div className="stat">
              <strong>{activeCount}</strong>
              <span>Active</span>
            </div>
            <div className="stat">
              <strong>{completedCount}</strong>
              <span>Completed</span>
            </div>
          </div>
        </section>

        {message && (
          <div className="status" role="status" aria-live="polite">
            <span>{message}</span>
            <button
              className="icon-button"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        <div className="workspace">
          <section className="panel add-panel" aria-labelledby="add-heading">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">CREATE</p>
                <h2 id="add-heading">Add a task</h2>
              </div>
              <span className="keyboard-hint">Tab to navigate</span>
            </div>

            <form onSubmit={addTask}>
              <label htmlFor="task-title">Task title <span aria-hidden="true">*</span></label>
              <input
                ref={titleRef}
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength="100"
                placeholder="e.g. Finish project documentation"
                autoComplete="off"
              />

              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength="500"
                rows="5"
                placeholder="Add a few useful details..."
              />

              <button className="primary-button" disabled={saving} type="submit">
                {saving ? "Adding..." : "Add task"}
              </button>
            </form>

            <div id="accessibility" className="accessibility-note">
              <strong>Keyboard friendly</strong>
              <p>Use Tab and Shift + Tab to move between controls. Press Enter or Space to activate buttons.</p>
            </div>
          </section>

          <section id="tasks" className="panel tasks-panel" aria-labelledby="tasks-heading">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">YOUR WORK</p>
                <h2 id="tasks-heading">Tasks</h2>
              </div>
              <span>{tasks.length} total</span>
            </div>

            <div className="toolbar">
              <label className="search-box" htmlFor="search">
                <span className="sr-only">Search tasks</span>
                <input
                  id="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks..."
                />
              </label>

              <div className="filters" role="group" aria-label="Filter tasks">
                {[
                  ["all", "All"],
                  ["active", "Active"],
                  ["completed", "Completed"]
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={filter === value ? "filter active" : "filter"}
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {completedCount > 0 && (
              <div className="task-actions">
                <button className="text-button" type="button" onClick={clearCompleted}>
                  Clear completed
                </button>
              </div>
            )}

            <div className="task-list" aria-live="polite">
              {loading ? (
                <div className="empty-state">Loading tasks...</div>
              ) : visibleTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon" aria-hidden="true">✓</div>
                  <h3>No tasks here</h3>
                  <p>Add a task or change your filter.</p>
                </div>
              ) : (
                visibleTasks.map((task) => (
                  <article className={task.completed ? "task completed" : "task"} key={task.id}>
                    <label className="check-wrap">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
                      />
                      <span className="custom-check" aria-hidden="true">✓</span>
                    </label>

                    <div className="task-content">
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <time dateTime={task.createdAt}>
                        {new Date(task.createdAt).toLocaleString()}
                      </time>
                    </div>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete "${task.title}"`}
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>AccessBoard • Built with React + Express</p>
        <p>Designed for responsive and keyboard-accessible use.</p>
      </footer>
    </div>
  );
}