import { SESSION_MAXAGE, SESSION_MAXAGE_1D } from "~/auth.server";
import { prisma } from "~/db.server";
import type { Prisma, Session, SessionData } from "@prisma/client";
export type { Session } from "@prisma/client";

export async function createSession({
  rememberMe,
  userId,
  locale,
  theme,
}: {
  rememberMe: Session["rememberMe"];
  userId: Session["userId"];
  locale: SessionData["locale"];
  theme: SessionData["locale"];
}) {
  return prisma.session.create({
    data: {
      expirationDate:
        rememberMe === null
          ? null
          : rememberMe
          ? new Date(Date.now() + SESSION_MAXAGE * 1000)
          : new Date(Date.now() + SESSION_MAXAGE_1D * 1000),
      rememberMe: !!rememberMe,
      userId,
      sessionData: {
        create: {
          locale,
          theme,
        },
      },
    },
    include: { user: true, sessionData: true },
  });
}

export async function getSessionById(
  sessionId: Session["id"],
  include: Prisma.SessionInclude = {},
) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    include,
  });
}

export async function getSessionByIdOrThrow(
  sessionId: Session["id"],
  include: Prisma.SessionInclude = {},
) {
  return prisma.session.findUniqueOrThrow({
    where: { id: sessionId },
    include,
  });
}

export async function updateSessionExpirationById(
  sessionId: Session["id"],
  expirationDate: Session["expirationDate"],
) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { expirationDate },
  });
}
