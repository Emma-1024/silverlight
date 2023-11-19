import type { Permission, Prisma, Role } from "@prisma/client";

import { prisma } from "~/db.server";
export type { Role } from "@prisma/client";

// Create role just for permission checking
export async function createRole(name: Role["name"]) {
  return prisma.role.create({
    data: {
      name,
    },
  });
}

// Update role just for permission checking
export async function linkRoleAndPermissionById(
  roleId: Role["id"],
  permissionId: Permission["id"],
) {
  return prisma.role.update({
    where: { id: roleId },
    data: { permissions: { connect: { id: permissionId } } },
    include: { permissions: true },
  });
}

export async function getRoleById(
  id: Role["id"],
  include: Prisma.RoleInclude = {},
) {
  return prisma.role.findUnique({
    where: { id },
    include,
  });
}
