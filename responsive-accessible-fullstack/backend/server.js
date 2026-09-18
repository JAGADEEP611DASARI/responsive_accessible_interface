const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "tasks.json");

app.use(cors());
app.use(express.json());

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
  }
}

function readTasks() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
}

function validateTask(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();

  if (!title) return { error: "Task title is required." };
  if (title.length > 100) return { error: "Task title must be 100 characters or less." };
  if (description.length > 500) return { error: "Description must be 500 characters or less." };

  return { title, description };
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Accessible Interface API is running." });
});

app.get("/api/tasks", (req, res) => {
  res.json({ success: true, tasks: readTasks() });
});

app.post("/api/tasks", (req, res) => {
  const result = validateTask(req.body);
  if (result.error) return res.status(400).json({ success: false, error: result.error });

  const tasks = readTasks();
  const task = {
    id: Date.now().toString(),
    title: result.title,
    description: result.description,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  writeTasks(tasks);

  res.status(201).json({ success: true, task });
});

app.put("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }

  const current = tasks[index];
  const result = validateTask({
    title: req.body.title ?? current.title,
    description: req.body.description ?? current.description
  });

  if (result.error) return res.status(400).json({ success: false, error: result.error });

  tasks[index] = {
    ...current,
    title: result.title,
    description: result.description,
    completed:
      typeof req.body.completed === "boolean"
        ? req.body.completed
        : current.completed
  };

  writeTasks(tasks);
  res.json({ success: true, task: tasks[index] });
});

app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const filtered = tasks.filter((task) => task.id !== req.params.id);

  if (filtered.length === tasks.length) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }

  writeTasks(filtered);
  res.json({ success: true, message: "Task deleted." });
});

app.delete("/api/tasks", (req, res) => {
  writeTasks([]);
  res.json({ success: true, message: "All tasks deleted." });
});

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`Backend running at http://localhost:${PORT}`);
});