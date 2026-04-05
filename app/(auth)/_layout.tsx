import { resolvePostAuthHref } from "@/lib/auth-return-to";
import { useAuth } from "@clerk/expo";
import { type Href, Redirect, Stack, useLocalSearchParams } from "expo-router";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { returnTo: returnToParam } = useLocalSearchParams<{
    returnTo?: string | string[];
  }>();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={resolvePostAuthHref(returnToParam, "/(tabs)") as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
