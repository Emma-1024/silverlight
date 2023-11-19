import { expect, test } from "vitest";

import { globalDb } from "~/constants/db";

import { createPermission, updatePermission } from "./permission.server";
import {
  createRole,
  getRoleById,
  linkRoleAndPermissionById,
} from "./role.server";
import {
  getUserByEmail,
  getUserWithPermission,
  linkUserAndRoleById,
} from "./user.server";


test("Create role and permission, then make a link between role and permission, meanwhile, connect the user and role.", async () => {
  const roleName = "roleTest";
  const permissionName = "permissionTest";
  const newPermissionName = "newPermissionTest";
  const createdRole = await createRole(roleName);
  expect(createdRole).toBeDefined();
  const role = await getRoleById(createdRole.id);
  expect(role?.name).toBe(roleName);
  const createdPermission = await createPermission(permissionName);
  expect(createdPermission).toBeDefined();
  const updatedPermission = await updatePermission(
    createdPermission.id,
    newPermissionName,
  );
  expect(updatedPermission.name).toBe(newPermissionName);
  await linkRoleAndPermissionById(createdRole.id, updatedPermission.id);
  const user = await getUserByEmail(globalDb.EMAIL);
  expect(user).toBeDefined();
  if (user) {
    await linkUserAndRoleById(user?.id, createdRole.id);
    const userWithPermission = await getUserWithPermission(user?.id);
    expect(userWithPermission).toBeDefined();
    const index = userWithPermission.permissions.indexOf(newPermissionName);
    expect(index).not.toBe(-1);
  }
});
