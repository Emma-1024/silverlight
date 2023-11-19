import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

import { globalConsts } from "./constants/consts";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getCookieSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getSessionId(request: Request) {
  const cookieSession = await getCookieSession(request);
  const sessionId = cookieSession.get(globalConsts.SESSION_ID);
  return sessionId;
}
