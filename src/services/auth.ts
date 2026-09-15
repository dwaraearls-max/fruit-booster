import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/enums";
import { getSupabaseAdmin } from "@/lib/supabase";

const SESSION_COOKIE = "ff_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

export async function loginAdmin(email: string, password: string) {
  const sb = getSupabaseAdmin();
  const { data: user, error } = await sb
    .from("User")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64url");
  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${token}.${user.id}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  const userId = parts[parts.length - 1];
  if (!userId) return null;

  const sb = getSupabaseAdmin();
  const { data: user, error } = await sb
    .from("User")
    .select("id, email, fullName, role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as UserRole,
  };
}

export function canManageProducts(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageSettings(role: UserRole) {
  return role === "SUPER_ADMIN";
}
