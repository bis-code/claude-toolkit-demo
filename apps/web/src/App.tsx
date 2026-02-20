import { useEffect, useState } from "react";
import { StatusBadge } from "./StatusBadge";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
}

const NEXT_STATUS: Record<string, string> = {
  todo: "in_progress",
  in_progress: "done",
};

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

  const advanceStatus = async (id: string, currentStatus: string) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    await fetch(`/api/tasks/${id}/status`, { method: "PATCH" });
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title}{" "}
            <StatusBadge
              status={t.status}
              onClick={
                t.status !== "done"
                  ? () => advanceStatus(t.id, t.status)
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
