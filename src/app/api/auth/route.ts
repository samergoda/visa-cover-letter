import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };

  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "Server is not configured with a password." },
      { status: 500 }
    );
  }

  if (!password || password !== appPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("app_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // a day session
    maxAge: 60 * 60 * 24,
  });

  return response;
}
