import { randomBytes } from "crypto";

/** App-side id (tables have no DB default for id). */
export function createId() {
  return `c${randomBytes(12).toString("hex")}`;
}

export function nowIso() {
  return new Date().toISOString();
}
