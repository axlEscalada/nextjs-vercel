import { createHandler } from "@autonoma-ai/server-web";
import { defineFactory, type SQLExecutor } from "@autonoma-ai/sdk";
import { pool } from "@/app/db";
import { createTodo } from "@/app/db/todos";

// The Autonoma SDK's Drizzle adapter expects a Drizzle client whose `execute`
// takes `{ sql, params }` — that shape is emitted by drizzle-orm's proxy
// dialects but not by `drizzle-orm/node-postgres`, which binds to the raw pg
// Pool and expects a string/SQLWrapper. Wrap the existing pg Pool instead;
// this is the same singleton Drizzle itself is using under the hood.
function pgExecutor(p: typeof pool): SQLExecutor {
  return {
    async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
      const { rows } = await p.query(sql, params);
      return rows as T[];
    },
    async transaction<T>(fn: (tx: SQLExecutor) => Promise<T>): Promise<T> {
      const client = await p.connect();
      await client.query("BEGIN");
      try {
        const tx: SQLExecutor = {
          async query<U = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<U[]> {
            const { rows } = await client.query(sql, params);
            return rows as U[];
          },
          transaction: (innerFn) => innerFn(tx),
        };
        const result = await fn(tx);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
  };
}

/**
 * The Autonoma Environment Factory handler. Next.js App Router mounts it at
 * `POST /api/autonoma` via filesystem routing (the `POST` export below). The
 * handler is also re-exported as `autonomaHandler` so other modules in the
 * app can import it directly for test-tooling or introspection.
 */
export const autonomaHandler = createHandler({
  executor: pgExecutor(pool),
  scopeField: "id",
  // The SDK auto-derives model names by PascalCasing the DB table name WITHOUT
  // pluralization, so the `todos` table would map to a `Todos` model. The
  // entity audit + scenarios speak in lowercase `todos` (matching the raw
  // table name), so map explicitly to that instead.
  tableNameMap: {
    todos: "todos",
  },
  sharedSecret: process.env.AUTONOMA_SHARED_SECRET ?? "my-shared-secret",
  signingSecret: process.env.AUTONOMA_SIGNING_SECRET ?? "my-signing-secret",
  allowProduction: true,
  factories: {
    todos: defineFactory({
      create: async (data) => {
        // Call the extracted production creation helper so any future business
        // logic added there (validation, audit logs, etc.) flows through the
        // factory automatically. NEVER inline `db.insert(todos)` here — that
        // would bypass the real code path the app uses.
        const row = await createTodo({
          title: data.title as string,
          completed: typeof data.completed === "boolean" ? data.completed : undefined,
        });
        return row as Record<string, unknown>;
      },
    }),
  },
  auth: async () => {
    // The Todo App has no auth — no sign-in, no sessions, no tokens. Return a
    // placeholder header so the SDK has a non-empty AuthResult; tests never
    // use it because the app's API endpoints are unauthenticated.
    return { headers: { Authorization: "Bearer no-auth" } };
  },
});

export const POST = autonomaHandler;
