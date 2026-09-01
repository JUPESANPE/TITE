import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { toApiErrorResponse } from "@/lib/api-error";
import { getBalance, getStreak } from "@/data/repositories/points.repository";

export async function GET() {
  try {
    const user = await requireUser();
    const [balance, streak] = await Promise.all([getBalance(user.id), getStreak(user.id)]);
    return NextResponse.json({ balance, streak });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
