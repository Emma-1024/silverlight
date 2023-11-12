import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
  console.log("Test started");
});

afterAll(async () => {
  console.log("Test ended");
});
