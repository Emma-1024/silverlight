import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { type User, verifyLogin } from "~/models/user.server";

import { globalConsts } from "./constants/consts";
import {
  getCookieSession,
  getSessionId,
  sessionStorage,
} from "./cookieSession.server";
import {
  getSessionById,
  getSessionByIdOrThrow,
  updateSessionExpirationById,
} from "./models/session.server";

export const SESSION_MAXAGE = 3600 * 24 * 20; // 20 days
export const SESSION_MAXAGE_1D = 3600 * 24; // 1 day

export const authenticator = new Authenticator<User["id"]>(sessionStorage, {
  sessionKey: "userId",
});

authenticator.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  new FormStrategy(async ({ form, context }) => {
    // You can use `context` to access more things from the server
    const email = form.get("email");
    const password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");

    const user = await verifyLogin(email, password);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return user.id;
  }),
  "form-auth",
);

// Used by all places where we need to know if user is authenticated, if not it will logout and redirect
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  // `isAuthenticated` returns true if sessionKey exists
  await authenticator.isAuthenticated(request, {
    failureRedirect: `/login?${searchParams}`,
  });

  const sessionId = await getSessionId(request);
  const session = await getSessionById(sessionId);
  if (
    session &&
    session.expirationDate !== null &&
    session.expirationDate > new Date()
  )
    return session.userId;

  throw await logout(request);
}

export async function extendExpiration(request: Request): Promise<Headers> {
  const cookieSession = await getCookieSession(request);
  const sessionId = cookieSession.get(globalConsts.SESSION_ID);
  const session = await getSessionByIdOrThrow(sessionId);

  // If user doesn't check rememberMe, we don't extend session expiration
  if (!session.rememberMe) {
    return new Headers();
  }

  // If expiration is more than half of the max age, we don't extend expiration
  if (
    session.expirationDate !== null &&
    session.expirationDate.getTime() - Date.now() > (SESSION_MAXAGE * 1000) / 2
  ) {
    return new Headers();
  }

  // Extend DB SessionID expiration
  await updateSessionExpirationById(
    sessionId,
    new Date(Date.now() + SESSION_MAXAGE * 1000),
  );

  // Extend cookie expiration
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(cookieSession, {
      maxAge: SESSION_MAXAGE,
    }),
  });

  return headers;
}

export async function logout(request: Request) {
  const sessionId = await getSessionId(request);

  // Expire session in DB
  try {
    await updateSessionExpirationById(sessionId, new Date());
  } catch (error) {
    console.error("SessionId doesn't exist in DB:", sessionId);
  }

  // Destroy session in cookie
  await authenticator.logout(request, { redirectTo: "/login" });
}
