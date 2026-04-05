import { type Href, useGlobalSearchParams, usePathname } from "expo-router";
import { useMemo } from "react";
import { Platform } from "react-native";

const SIGN_IN_PREFIX = "/sign-in";
const SIGN_UP_PREFIX = "/sign-up";

/**
 * Current route (path + query) to send as `returnTo` when forcing sign-in.
 * On web uses `window.location`; on native uses pathname + serialized global search params (excluding nested `returnTo`).
 */
export function useAuthRedirectReturnTo(): string {
  const pathname = usePathname();
  const globalParams = useGlobalSearchParams();

  return useMemo(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const { pathname: p, search } = window.location;
      return `${p}${search}` || "/";
    }
    const path = pathname || "/";
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(globalParams)) {
      if (key === "returnTo") continue;
      if (value === undefined || value === null) continue;
      const parts = Array.isArray(value) ? value : [value];
      for (const part of parts) {
        if (part === "") continue;
        q.append(key, String(part));
      }
    }
    const s = q.toString();
    return s ? `${path}?${s}` : path;
  }, [pathname, globalParams]);
}

/** Build sign-in URL with optional `returnTo` (already a path+search fragment). */
export function signInHrefWithReturnTo(currentLocation: string): Href {
  const loc = (currentLocation || "/").trim() || "/";
  if (loc === SIGN_IN_PREFIX || loc.startsWith(`${SIGN_IN_PREFIX}?`)) {
    return SIGN_IN_PREFIX;
  }
  if (loc === SIGN_UP_PREFIX || loc.startsWith(`${SIGN_UP_PREFIX}?`)) {
    return SIGN_IN_PREFIX;
  }
  return `${SIGN_IN_PREFIX}?returnTo=${encodeURIComponent(loc)}` as Href;
}

/**
 * Reject open redirects: only same-origin-style app paths, no protocols or path traversal.
 */
export function parseSafeReturnTo(raw: string | undefined | null): string | null {
  if (raw == null || raw === "") return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  if (decoded.length > 2048) return null;
  if (!decoded.startsWith("/")) return null;
  if (decoded.startsWith("//")) return null;
  if (decoded.includes("://")) return null;
  if (decoded.includes("\\")) return null;
  if (
    decoded === SIGN_IN_PREFIX ||
    decoded.startsWith(`${SIGN_IN_PREFIX}?`) ||
    decoded === SIGN_UP_PREFIX ||
    decoded.startsWith(`${SIGN_UP_PREFIX}?`)
  ) {
    return null;
  }
  const lower = decoded.toLowerCase();
  if (lower.includes("/..") || lower.includes("%2e%2e") || lower.includes("..%2f")) {
    return null;
  }
  return decoded;
}

export function resolvePostAuthHref(
  raw: string | string[] | undefined | null,
  fallback: string = "/(tabs)",
): string {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseSafeReturnTo(s ?? null) ?? fallback;
}

/** Append `?returnTo=…` for cross-links between sign-in and sign-up when the target is safe. */
export function returnToQuerySuffix(
  raw: string | string[] | undefined | null,
): "" | `?returnTo=${string}` {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const safe = parseSafeReturnTo(s ?? null);
  if (!safe) return "";
  return `?returnTo=${encodeURIComponent(safe)}`;
}
