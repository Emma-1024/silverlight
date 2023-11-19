import bcrypt from "bcryptjs";
import { expect, test } from "vitest";

import {
  createUser,
  deleteUserByEmail,
  getUserByEmail,
  getUserById,
  verifyLogin,
} from "./user.server";

const email = "user@prisma.io";
const password = "userPassword";

test("Create user should return the correct email and password", async () => {
  await createUser(email, password);
  const userByEmail = await getUserByEmail(email, {
    password: true,
  });
  expect(userByEmail).toBeDefined();
  if (userByEmail) {
    console.log("The user was successfully created");
    const userById = await getUserById(userByEmail.id, { password: true });
    expect(userById).toBeDefined();
    if (userById?.email) {
      expect(email).toBe(userById.email);
    }
  }
  if (userByEmail?.password) {
    const isValid = await bcrypt.compare(password, userByEmail?.password.hash);
    expect(isValid).toBe(true);
  }
  if (userByEmail?.email) {
    expect(email).toBe(userByEmail.email);
  }

  const verified = await verifyLogin(email, password);
  expect(verified).not.toBe(null);
});

test("delete user by email", async () => {
  const deletedUser = await deleteUserByEmail(email);
  expect(deletedUser).toBeDefined();
  const userByEmail = await getUserByEmail(email);
  if (!userByEmail) {
    console.log("The user was successfully deleted");
  } else {
    console.log("Failed to find the user by email");
  }
});
