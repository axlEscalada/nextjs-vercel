import { createHandler } from "@autonoma-ai/server-web";
import { drizzleExecutor } from "@autonoma-ai/sdk-drizzle";
import { db } from "@/app/db";

export const POST = createHandler({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  executor: drizzleExecutor(db as any),
  scopeField: "id",
  sharedSecret: process.env.AUTONOMA_SHARED_SECRET ?? "my-shared-secret",
  signingSecret: process.env.AUTONOMA_SIGNING_SECRET ?? "my-signing-secret",
  allowProduction: true,
  auth: async () => {
    // No auth in this demo app - return a dummy header
    return { headers: { Authorization: "Bearer demo-token" } };
  },
});
