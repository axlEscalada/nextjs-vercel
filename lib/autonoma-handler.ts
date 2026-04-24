/**
 * Re-export of the Autonoma Environment Factory handler so modules outside
 * `app/api/autonoma/` can import it without depending on Next.js App Router
 * filesystem routing. The handler is defined in `app/api/autonoma/route.ts`;
 * Next.js mounts it at `POST /api/autonoma` via the `POST` export there.
 */
export { autonomaHandler } from "@/app/api/autonoma/route";
