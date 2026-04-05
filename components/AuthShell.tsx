import { brand } from "@/constants/branding";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** When false, hides logo row (e.g. dense secondary step). */
  showBrand?: boolean;
  contentClassName?: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  showBrand = true,
  contentClassName,
}: AuthShellProps) {
  return (
    <SafeAreaView className="auth-screen" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName={clsx("auth-content", contentClassName)}
        >
          {showBrand ? (
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">{brand.markLetter}</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">{brand.name}</Text>
                  <Text className="auth-wordmark-sub">{brand.tagline}</Text>
                </View>
              </View>
            </View>
          ) : null}

          <Text className="auth-title w-full text-center">{title}</Text>
          <Text className="auth-subtitle self-center">{subtitle}</Text>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
