import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { todos } from "@/app/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [row] = await db.select().from(todos).where(eq(todos.id, id));
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const [row] = await db.update(todos).set(body).where(eq(todos.id, id)).returning();
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [row] = await db.delete(todos).where(eq(todos.id, id)).returning();
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
