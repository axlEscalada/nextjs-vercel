export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const todos: Map<string, Todo> = new Map();

// Pre-populate with some data
const initial = [
  "Buy groceries",
  "Walk the dog",
  "Read a book",
  "Write tests",
  "Deploy to Vercel",
];
for (const title of initial) {
  const id = crypto.randomUUID();
  todos.set(id, { id, title, completed: false, createdAt: new Date().toISOString() });
}

export function getAllTodos(): Todo[] {
  return Array.from(todos.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTodo(id: string): Todo | undefined {
  return todos.get(id);
}

export function createTodo(title: string): Todo {
  const id = crypto.randomUUID();
  const todo: Todo = { id, title, completed: false, createdAt: new Date().toISOString() };
  todos.set(id, todo);
  return todo;
}

export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "title" | "completed">>
): Todo | null {
  const todo = todos.get(id);
  if (!todo) return null;
  const updated = { ...todo, ...updates };
  todos.set(id, updated);
  return updated;
}

export function deleteTodo(id: string): boolean {
  return todos.delete(id);
}
