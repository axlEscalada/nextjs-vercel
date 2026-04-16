"use client";

import { useEffect, useState } from "react";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchTodos() {
    const res = await fetch("/api/todos");
    setTodos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    setNewTitle("");
    fetchTodos();
  }

  async function toggleTodo(todo: Todo) {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    fetchTodos();
  }

  async function removeTodo(id: string) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Todo List</h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 rounded-lg border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-foreground/30"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-80 transition-opacity"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="text-foreground/50">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="text-foreground/50">No todos yet. Add one above!</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span
                  className={`flex-1 ${todo.completed ? "line-through text-foreground/40" : ""}`}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="text-foreground/30 hover:text-red-500 transition-colors px-2"
                  aria-label="Delete todo"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
