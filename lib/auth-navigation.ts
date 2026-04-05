import type { Href } from "expo-router";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

/**
 * Handles post-auth navigation from Clerk `finalize({ navigate })`.
 * Relative app routes use Expo Router; absolute URLs use `window.location` on web or `Linking.openURL` on native.
 */
export function navigateAfterAuth(
  decorateUrl: (url: string) => string,
  router: { replace: (href: Href) => void },
  path: string = "/(tabs)",
): void {
  const url = decorateUrl(path);
  if (url.startsWith("http")) {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = url;
    } else {
      void Linking.openURL(url);
    }
    return;
  }
  router.replace(url as Href);
}
