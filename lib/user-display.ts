/** Minimal user shape for home/settings display (matches `useUser().user`). */
export type UserForDisplay = {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  imageUrl?: string | null;
  createdAt?: Date | null;
} | null | undefined;

export function accountDisplayName(user: UserForDisplay): string {
  if (!user) return "Account";
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return (
    user.fullName ||
    fromParts ||
    user.username ||
    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Account"
  );
}

export function primaryEmail(user: UserForDisplay): string | null {
  const e = user?.primaryEmailAddress?.emailAddress?.trim();
  return e || null;
}
