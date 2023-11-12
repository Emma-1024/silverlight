import { type ActionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import {
  getCookieSession,
  getSessionId,
  sessionStorage,
} from "~/cookieSession.server";
import { updateSessionDataById } from "~/models/sessionData.server";

export const action = async ({ request }: ActionArgs) => {
  const sessionData = await request.formData();
  const locale = sessionData.get("locale");
  const theme = sessionData.get("theme");
  invariant(typeof locale === "string", "locale must be a string");
  invariant(typeof theme === "string", "theme must be a string");

  const sessionId = await getSessionId(request);
  // Cover sessionId doesn't exist in client
  if (sessionId) {
    try {
      await updateSessionDataById(sessionId, { theme, locale });
    } catch (error) {
      // Cover sessionId doesn't exist in DB
      console.error("SessionId doesn't exist in DB:", sessionId);
    }
  }

  const cookieSession = await getCookieSession(request);
  cookieSession.set("lng", locale);
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(cookieSession),
  });
  return json(null, { headers });
};
