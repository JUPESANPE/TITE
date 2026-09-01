import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/data/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { toApiErrorResponse } from "@/lib/api-error";
import { buildLedgerEntry } from "@/domain/points/points-engine";
import { awardPoints } from "@/data/repositories/points.repository";
import { track } from "@/analytics/analytics.service";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash },
    });

    await awardPoints(
      user.id,
      buildLedgerEntry("ACCOUNT_CREATED", { referenceId: "signup", source: "auth" }),
    );
    await track("signup_completed", user.id, { method: "credentials" });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
