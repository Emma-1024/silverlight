import type { Permission } from "@prisma/client";
import { prisma } from "~/db.server";
export type { Permission } from "@prisma/client";

// Create permission for permission ckecking
export async function createPermission(name: Permission["name"]) {
  return prisma.permission.create({
    data: {
      name,
    },
  });
}

// Update permission for permission ckecking
export async function updatePermission(
  id: Permission["id"],
  name: Permission["name"],
) {
  return prisma.permission.update({
    where: { id },
    data: { name },
  });
}
