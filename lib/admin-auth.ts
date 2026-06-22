import { createHash } from "crypto";

const COOKIE_NAME = "esg_admin_session";

function expectedToken(): string {
  return createHash("sha256")
    .update(`${process.env.ADMIN_PASSWORD}:esg-admin`)
    .digest("hex");
}

export function isValidAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export function adminSessionToken(): string {
  return expectedToken();
}

export function isValidAdminSessionToken(token: string | undefined): boolean {
  return !!token && token === expectedToken();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
