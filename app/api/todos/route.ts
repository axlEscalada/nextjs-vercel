import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { todos } from "@/app/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(todos).orderBy(desc(todos.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const [row] = await db.insert(todos).values({ title }).returning();
  return NextResponse.json(row, { status: 201 });
}
