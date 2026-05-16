import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "data", "progress.json");

export async function GET() {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
