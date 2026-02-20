import { useEffect, useState } from "react";
import { StatusBadge, type TaskStatus } from "./StatusBadge";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
}

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  todo: "in_progress",
  in_progress: "done",
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch tasks: ${r.status}`);
        return r.json();
      })
      .then(setTasks)
      .catch((err) => console.error(err));
  }, []);

  const addTask = async () => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      console.error("Failed to create task:", res.status);
      return;
    }
    const task = await res.json();
    setTasks([...tasks, task]);
    setTitle("");
  };

  const advanceStatus = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${id}/status`, { method: "PATCH" });
      if (!res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: currentStatus } : t))
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: currentStatus } : t))
      );
    }
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
