import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "./session";

export function ok(data: unknown, message?: string) {
  return NextResponse.json({ data, message });
}
export function created(data: unknown, message = "Data berhasil ditambahkan") {
  return NextResponse.json({ data, message }, { status: 201 });
}
export function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}
export function unauthorized(message = "Tidak terautentikasi") {
  return NextResponse.json({ message }, { status: 401 });
}
export function forbidden(message = "Tidak diizinkan") {
  return NextResponse.json({ message }, { status: 403 });
}
export function notFound(message = "Data tidak ditemukan") {
  return NextResponse.json({ message }, { status: 404 });
}

/** Ambil session di API route, throw jika tidak login / role tidak sesuai */
export async function requireAuth(
  roles?: Array<SessionUser["role"]>
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Tidak terautentikasi");
  if (roles && !roles.includes(session.role))
    throw new ApiError(403, "Tidak diizinkan");
  return session;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Bungkus handler agar ApiError otomatis jadi response */
export function handle(
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  return fn().catch((e) => {
    if (e instanceof ApiError)
      return NextResponse.json({ message: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  });
}
