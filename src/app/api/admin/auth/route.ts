import { z } from "zod";
import { NextResponse } from "next/server";
import { loginAdmin } from "@/services/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await loginAdmin(body.email, body.password);
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, message: "Login failed." }, { status: 400 });
  }
}

export async function DELETE() {
  const { logoutAdmin } = await import("@/services/auth");
  await logoutAdmin();
  return NextResponse.json({ success: true });
}
