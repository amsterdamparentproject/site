import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid)
    return NextResponse.json({ error: "No UID provided" }, { status: 400 });

  const res = await fetch(
    `${process.env.N8N_ACCESS_DIRECTORY_WEBHOOK_URL}?uid=${uid}`,
  );
  const data = await res.json();

  return NextResponse.json(data);
}
