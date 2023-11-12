import { expect, test } from "vitest";
import { globalDefaults } from "~/constants/defaults";
import {
  createSession,
  getSessionById,
  getSessionByIdOrThrow,
  updateSessionExpirationById,
} from "./session.server";
import { getUserByEmail } from "./user.server";
import { globalDb } from "~/constants/db";
import { updateSessionDataById } from "./sessionData.server";
import { SESSION_MAXAGE, SESSION_MAXAGE_1D } from "~/auth.server";

const isSessionExpirationDateCorrect = (
  sessionMaxage: number,
  sessionExpirationDate: Date,
): boolean => {
  const diffInMilliseconds =
    new Date(Date.now() + sessionMaxage * 1000).getTime() -
    sessionExpirationDate.getTime();
  const diffInSeconds = diffInMilliseconds / 1000;
  const isWithin1Second: boolean = diffInSeconds < 1;
  return isWithin1Second;
};

test("Create session with user should return the correct email and sessionData", async () => {
  const userByEmail = await getUserByEmail(globalDb.EMAIL);
  expect(userByEmail).toBeDefined();
  if (userByEmail) {
    const createdSession = await createSession({
      rememberMe: true,
      userId: userByEmail?.id,
      locale: globalDefaults.DEFAULT_LANG,
      theme: globalDefaults.DEFAULT_THEME,
    });
    expect(createdSession).toBeDefined();
    expect(createdSession.expirationDate).toBeInstanceOf(Date);
    if (createdSession && createdSession.expirationDate) {
      const moreThan20Days = isSessionExpirationDateCorrect(
        SESSION_MAXAGE,
        createdSession.expirationDate,
      );
      expect(moreThan20Days).toBe(true);
    }
    const sessionNotNull = await getSessionByIdOrThrow(createdSession.id);
    expect(sessionNotNull).not.toBe(null);
    const session = await getSessionById(createdSession.id, {
      user: true,
      sessionData: true,
    });
    if (session) {
      expect(session?.user?.email).toBe(globalDb.EMAIL);
      const date = new Date();
      const updatedSession = await updateSessionExpirationById(
        session?.id,
        date,
      );
      expect(updatedSession.expirationDate).toStrictEqual(date);
      const sessionData = { theme: "forest", locale: globalDefaults.LANG_ZH };
      const updatedSessionData = await updateSessionDataById(
        session.id,
        sessionData,
      );
      expect(updatedSessionData.theme).toBe(sessionData.theme);
      expect(updatedSessionData.locale).toBe(sessionData.locale);
    }

    const createdSessionRememberMeFalse = await createSession({
      rememberMe: false,
      userId: userByEmail?.id,
      locale: globalDefaults.DEFAULT_LANG,
      theme: globalDefaults.DEFAULT_THEME,
    });
    expect(createdSessionRememberMeFalse).toBeDefined();
    expect(createdSessionRememberMeFalse.expirationDate).toBeInstanceOf(Date);
    if (
      createdSessionRememberMeFalse &&
      createdSessionRememberMeFalse.expirationDate
    ) {
      const moreThan1Days: boolean = isSessionExpirationDateCorrect(
        SESSION_MAXAGE_1D,
        createdSessionRememberMeFalse.expirationDate,
      );
      expect(moreThan1Days).toBe(true);
    }
  }
});

test("Create session with userless", async () => {
  const createdSessionWithUserless = await createSession({
    rememberMe: null,
    userId: null,
    theme: globalDefaults.DEFAULT_THEME,
    locale: globalDefaults.DEFAULT_LANG,
  });
  expect(createdSessionWithUserless).toBeDefined();
  expect(createdSessionWithUserless.expirationDate).toBe(null);
  const session = await getSessionById(createdSessionWithUserless.id, {
    user: true,
    sessionData: true,
  });
  expect(session).toBeDefined();
  if (session) {
    expect(session.userId).toBe(null);
    expect(session.sessionData?.theme).toBe(globalDefaults.DEFAULT_THEME);
    expect(session.sessionData?.locale).toBe(globalDefaults.DEFAULT_LANG);
  }
});
