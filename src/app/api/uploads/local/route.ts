import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";

// Local-disk fallback for the storage adapter (see src/lib/storage.ts), used
// only when no R2/S3 credentials are configured. Keys are always generated
// server-side (see upload actions), so this only needs to guard against a
// tampered key trying to escape the uploads directory or write into another
// user's folder.
const KEY_PATTERN =
  /^tracks\/([a-zA-Z0-9]+)\/[a-f0-9-]+\.(mp3|wav|m4a|ogg|png|jpg|jpeg|webp)$/;

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = request.nextUrl.searchParams.get("key") ?? "";
  const match = key.match(KEY_PATTERN);
  if (!match || match[1] !== session.user.id) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  const destPath = path.join(UPLOADS_ROOT, key);
  await mkdir(path.dirname(destPath), { recursive: true });
  await writeFile(destPath, Buffer.from(body));

  return NextResponse.json({ ok: true });
}
