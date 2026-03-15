import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import { feedbackRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `feedback:${ip}`,
    windowMs: 60_000,
    maxRequests: 4
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many messages in a short window. Try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const payload = feedbackRequestSchema.parse(await request.json());

    console.info("Feedback submission received.", {
      name: payload.name,
      email: payload.email
    });

    return NextResponse.json({
      message: "Thanks. Your feedback is in the queue."
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Please complete all fields correctly."
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
