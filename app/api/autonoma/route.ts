import { createHandler } from "@autonoma-ai/server-web";
import type { SQLExecutor } from "@autonoma-ai/sdk";
import { pool } from "@/app/db";

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

export const POST = createHandler({
  executor: pgExecutor(pool),
  scopeField: "id",
  sharedSecret: process.env.AUTONOMA_SHARED_SECRET ?? "my-shared-secret",
  signingSecret: process.env.AUTONOMA_SIGNING_SECRET ?? "my-signing-secret",
  allowProduction: true,
  auth: async () => {
    return { headers: { Authorization: "Bearer demo-token" } };
  },
});
