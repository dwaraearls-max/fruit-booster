import { z } from "zod";
import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const result = await sendContactEmail(body);
    if (result.skipped) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is not configured yet. Please WhatsApp us instead.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ success: true, data: { sent: true } });
  } catch (e) {
    const message = e instanceof z.ZodError ? "Invalid contact details." : "Could not send message.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
