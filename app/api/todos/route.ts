import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { todos } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import { createTodo, InvalidTodoError } from "@/app/db/todos";

export async function GET() {
  const rows = await db.select().from(todos).orderBy(desc(todos.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const row = await createTodo({ title: body.title });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidTodoError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
