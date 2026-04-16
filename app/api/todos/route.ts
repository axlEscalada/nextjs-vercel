import { NextRequest, NextResponse } from "next/server";
import { getAllTodos, createTodo } from "@/app/lib/store";

export function GET() {
  return NextResponse.json(getAllTodos());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  return NextResponse.json(createTodo(title), { status: 201 });
}
