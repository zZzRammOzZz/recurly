import { signInHrefWithReturnTo, useAuthRedirectReturnTo } from "@/lib/auth-return-to";
import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function SubscriptionsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const returnTo = useAuthRedirectReturnTo();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={signInHrefWithReturnTo(returnTo)} />;
  }

  return <Slot />;
}
