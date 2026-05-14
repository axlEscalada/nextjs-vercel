import { NextResponse } from "next/server";

const LOGGER_URL = process.env.LOGGER_URL ?? "http://localhost:3001";

export async function POST() {
  await fetch(LOGGER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "ping", timestamp: new Date().toISOString() }),
  });

  return NextResponse.json({ ok: true });
}
