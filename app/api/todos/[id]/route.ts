import { NextRequest, NextResponse } from "next/server";
import { getTodo, updateTodo, deleteTodo } from "@/app/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const todo = getTodo(id);
  if (!todo) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(todo);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateTodo(id, body);
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const deleted = deleteTodo(id);
  if (!deleted) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
