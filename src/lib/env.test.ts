import { describe, expect, it } from "vitest";
import { envSchema } from "./env";

describe("envSchema", () => {
  it("accepts a valid config", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      AUTH_SECRET: "some-secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing AUTH_SECRET", () => {
    const result = envSchema.safeParse({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    });
    expect(result.success).toBe(false);
  });
});
