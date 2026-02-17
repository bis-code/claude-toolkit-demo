import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then(setTasks);
  }, []);

  const addTask = async () => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    setTitle("");
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task..." />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} — {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
