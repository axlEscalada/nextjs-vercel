import { db } from "@/app/db";
import { todos } from "@/app/db/schema";

export type CreateTodoInput = {
  title: string;
  completed?: boolean;
};

export class InvalidTodoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTodoError";
  }
}

/**
 * Extracted from the inline body of `POST /api/todos` so the Autonoma
 * Environment Factory can reuse the same creation path (title trim +
 * non-empty validation + `db.insert(todos)`) as production. See
 * autonoma/entity-audit.md.
 *
 * Callers should handle `InvalidTodoError` — the HTTP route turns it into
 * a 400 response, the factory never triggers it because recipes provide
 * a non-empty title.
 */
export async function createTodo(input: CreateTodoInput) {
  const title = input.title?.trim();
  if (!title) {
    throw new InvalidTodoError("title is required");
  }
  const values: { title: string; completed?: boolean } = { title };
  if (typeof input.completed === "boolean") {
    values.completed = input.completed;
  }
  const [row] = await db.insert(todos).values(values).returning();
  return row;
}
