import { z } from "zod";
import { NextResponse } from "next/server";
import { createId, nowIso } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAdminSession, canManageSettings } from "@/services/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  const { data: zones, error } = await sb
    .from("DeliveryZone")
    .select("*")
    .order("sortOrder", { ascending: true });
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: zones });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        name: z.string(),
        deliveryFeeGhs: z.number(),
        estimatedMins: z.number().default(45),
      })
      .parse(await req.json());
    const sb = getSupabaseAdmin();
    const { data: zone, error } = await sb
      .from("DeliveryZone")
      .insert({
        id: createId(),
        name: body.name,
        deliveryFeeGhs: body.deliveryFeeGhs,
        estimatedMins: body.estimatedMins,
        updatedAt: nowIso(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data: zone });
  } catch {
    return NextResponse.json({ success: false, message: "Could not create zone." }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session || !canManageSettings(session.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = z
      .object({
        id: z.string(),
        name: z.string().optional(),
        deliveryFeeGhs: z.number().optional(),
        active: z.boolean().optional(),
      })
      .parse(await req.json());
    const { id, ...data } = body;
    const sb = getSupabaseAdmin();
    const { data: zone, error } = await sb
      .from("DeliveryZone")
      .update({ ...data, updatedAt: nowIso() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data: zone });
  } catch {
    return NextResponse.json({ success: false, message: "Could not update zone." }, { status: 400 });
  }
}
