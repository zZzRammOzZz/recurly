import images from "@/constants/images";
import { colors, components, TAB_BAR_HEIGHT } from "@/constants/theme";
import { getClerkErrorMessage } from "@/lib/auth-errors";
import { accountDisplayName, primaryEmail } from "@/lib/user-display";
import { useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const insets = useSafeAreaInsets();
  const { tabBar } = components;
  const scrollBottomPadding =
    Math.max(insets.bottom, tabBar.horizontalInset) + TAB_BAR_HEIGHT;

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = useMemo(() => accountDisplayName(user), [user]);
  const email = useMemo(() => primaryEmail(user), [user]);

  const avatarSource = useMemo(() => {
    const url = user?.imageUrl;
    if (url) return { uri: url };
    return images.avatar;
  }, [user?.imageUrl]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "—";
    return dayjs(user.createdAt).format("MMM D, YYYY");
  }, [user?.createdAt]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Couldn't sign out", getClerkErrorMessage(error));
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="list-title">Settings</Text>

        <Text className="mt-8 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
          Profile
        </Text>

        <View className="mt-3 rounded-3xl border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            <Image source={avatarSource} className="size-20 rounded-full" />
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-sans-bold text-primary" numberOfLines={2}>
                {isLoaded ? displayName : "…"}
              </Text>
              {email ? (
                <Text
                  className="mt-1 text-sm font-sans-medium text-muted-foreground"
                  numberOfLines={2}
                >
                  {email}
                </Text>
              ) : isLoaded ? (
                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  No email on file
                </Text>
              ) : null}
            </View>
          </View>

          <View className="mt-5 gap-4 border-t border-border pt-5">
            <View className="sub-row">
              <Text className="sub-label">Email</Text>
              <Text
                className="sub-value shrink text-right"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {isLoaded ? email ?? "—" : "…"}
              </Text>
            </View>
            <View className="sub-row">
              <Text className="sub-label">Member since</Text>
              <Text className="sub-value shrink text-right">{isLoaded ? memberSince : "…"}</Text>
            </View>
          </View>
        </View>

        <Text className="mt-8 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
          Session
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          className="mt-3 items-center rounded-2xl border border-destructive/35 bg-destructive/10 py-4 active:opacity-80"
          disabled={signingOut}
          onPress={() => void handleSignOut()}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.destructive} size="small" />
          ) : (
            <Text className="text-base font-sans-bold text-destructive">Sign out</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
