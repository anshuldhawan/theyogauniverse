/** NFR-8 — envelope boundary for special-category health/waiver data. */

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const SPECIAL_CATEGORY_KEY_SCOPE = "special-category-data";

function keyBytes(encoded = process.env.SPECIAL_CATEGORY_DATA_KEY): Buffer {
  if (!encoded) throw new Error("SPECIAL_CATEGORY_DATA_KEY is not configured");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("SPECIAL_CATEGORY_DATA_KEY must be 32 bytes (base64)");
  return key;
}

export function encryptSpecialCategoryData(
  plaintext: string,
  options: { key?: string; context: string },
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(options.key), iv);
  cipher.setAAD(Buffer.from(`${SPECIAL_CATEGORY_KEY_SCOPE}:${options.context}`));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptSpecialCategoryData(
  envelope: string,
  options: { key?: string; context: string },
): string {
  const [version, iv, tag, ciphertext] = envelope.split(".");
  if (version !== "v1" || !iv || !tag || ciphertext === undefined) throw new Error("Invalid encrypted envelope");
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(options.key), Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(`${SPECIAL_CATEGORY_KEY_SCOPE}:${options.context}`));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
