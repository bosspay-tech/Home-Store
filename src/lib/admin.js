import { ADMIN_EMAILS } from "../config/admin";

export function isAdminUser(user) {
  if (!user) return false;

  if (user.user_metadata?.is_admin === true) return true;

  const email = (user.email || "").trim().toLowerCase();
  if (!email) return false;

  if (ADMIN_EMAILS.length === 0) return false;

  return ADMIN_EMAILS.includes(email);
}
