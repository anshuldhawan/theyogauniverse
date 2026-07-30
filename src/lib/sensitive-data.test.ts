import { describe, expect, it } from "vitest";
import { decryptSpecialCategoryData, encryptSpecialCategoryData } from "./sensitive-data";

const key = Buffer.alloc(32, 7).toString("base64");

describe("special-category encryption (NFR-8)", () => {
  it("round trips with authenticated context and rejects cross-record decryption", () => {
    const encrypted = encryptSpecialCategoryData("injury note", { key, context: "waiver-1" });
    expect(encrypted).not.toContain("injury note");
    expect(decryptSpecialCategoryData(encrypted, { key, context: "waiver-1" })).toBe("injury note");
    expect(() => decryptSpecialCategoryData(encrypted, { key, context: "waiver-2" })).toThrow();
  });
});
