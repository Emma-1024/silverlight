import type { Prisma, Session } from "@prisma/client";

import { prisma } from "~/db.server";
export type { SessionData } from "@prisma/client";

export async function updateSessionDataById(
  sessionId: Session["id"],
  data: Prisma.XOR<
    Prisma.SessionDataUpdateInput,
    Prisma.SessionDataUncheckedUpdateInput
  >,
) {
  return prisma.sessionData.update({
    where: { sessionId },
    data,
  });
}
