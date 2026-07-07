import { NextResponse } from "next/server";

import {
  checkInGuest,
  LumaCheckInUnavailableError,
} from "@/lib/luma/client";
import { isLumaAuthError, resolveLumaApiKey } from "@/lib/luma/server-auth";

export const runtime = "nodejs";

interface CheckinRequestBody {
  eventId?: string;
  guestId?: string;
  scanKey?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckinRequestBody;
    const eventId = body.eventId?.trim();
    const guestId = body.guestId?.trim();
    const scanKey = body.scanKey?.trim() ?? guestId;

    if (!eventId || !scanKey) {
      return NextResponse.json(
        { error: "Missing eventId or scanKey." },
        { status: 400 },
      );
    }

    const apiKey = resolveLumaApiKey(request);
    await checkInGuest(apiKey, eventId, scanKey, guestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not check in guest.";

    const status = isLumaAuthError(error)
      ? 503
      : error instanceof LumaCheckInUnavailableError
        ? 501
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
