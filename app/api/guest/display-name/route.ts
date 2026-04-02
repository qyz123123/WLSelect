import { NextResponse } from "next/server";
import { z } from "zod";

import { isRegisteredNameTaken } from "@/lib/data";
import { isGuestNameAllowed } from "@/lib/guest-name";

const schema = z.object({
  name: z.string().min(2).max(50)
});

function buildSuggestion() {
  return `游客${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET() {
  let suggestion = buildSuggestion();

  for (let index = 0; index < 5; index += 1) {
    if (!(await isRegisteredNameTaken(suggestion))) {
      break;
    }

    suggestion = buildSuggestion();
  }

  return NextResponse.json({ suggestion });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid display name." }, { status: 400 });
  }

  if (!isGuestNameAllowed(parsed.data.name)) {
    return NextResponse.json({ error: "This guest name is not allowed." }, { status: 400 });
  }

  const taken = await isRegisteredNameTaken(parsed.data.name);

  if (taken) {
    return NextResponse.json(
      {
        error: "This name is already used by a registered account."
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
