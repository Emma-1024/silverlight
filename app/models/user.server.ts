import type {
  Password,
  Prisma,
  Role,
  User as PrismaUser,
  Permission,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type User = PrismaUser & { permissions: Permission["name"][] };

export async function getUserById(
  id: User["id"],
  include: Prisma.UserInclude = {},
) {
  return prisma.user.findUnique({ where: { id }, include });
}

export async function getUserByEmail(
  email: User["email"],
  include: Prisma.UserInclude = {},
) {
  return prisma.user.findUnique({ where: { email }, include });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

// Update user just for permission checking
export async function linkUserAndRoleById(
  userId: User["id"],
  roleId: Role["id"],
) {
  return prisma.user.update({
    where: { id: userId },
    data: { roles: { connect: { id: roleId } } },
    include: { roles: true },
  });
}

// Get user with permission
export async function getUserWithPermission(id: User["id"]): Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: { roles: { include: { permissions: true } } },
  });
  let permissions = new Set<Permission["name"]>();

  if (user?.roles) {
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }
  }
  return new Promise((resolve) => {
    resolve({
      ...user,
      permissions: Array.from(permissions),
    });
  });
}
