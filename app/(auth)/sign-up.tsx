import { AuthShell } from "@/components/AuthShell";
import { brand } from "@/constants/branding";
import { colors } from "@/constants/theme";
import { getClerkErrorMessage } from "@/lib/auth-errors";
import {
  validateEmail,
  validatePasswordForSignUp,
  validateVerificationCode,
} from "@/lib/auth-validation";
import { useAuth, useSignUp } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

function navigateAfterAuth(
  decorateUrl: (url: string) => string,
  router: { replace: (href: Href) => void },
) {
  const url = decorateUrl("/(tabs)");
  if (url.startsWith("http")) {
    window.location.href = url;
  } else {
    router.replace(url as Href);
  }
}

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [formMessage, setFormMessage] = React.useState<string | null>(null);
  const [resendSec, setResendSec] = React.useState(0);

  const busy = fetchStatus === "fetching";

  const verifyPhase =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  React.useEffect(() => {
    if (verifyPhase) {
      setResendSec(45);
    }
  }, [verifyPhase]);

  React.useEffect(() => {
    if (resendSec <= 0) return;
    const t = setInterval(() => setResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendSec]);

  const onChangeEmail = (v: string) => {
    setEmailAddress(v);
    setEmailError(null);
    setFormMessage(null);
  };

  const onChangePassword = (v: string) => {
    setPassword(v);
    setPasswordError(null);
    setFormMessage(null);
  };

  const onChangeCode = (v: string) => {
    setCode(v.replace(/\D/g, "").slice(0, 8));
    setCodeError(null);
    setFormMessage(null);
  };

  const handleSubmit = async () => {
    const eErr = validateEmail(emailAddress);
    const pErr = validatePasswordForSignUp(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setFormMessage(null);

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setFormMessage(getClerkErrorMessage(error));
      return;
    }

    const sendResult = await signUp.verifications.sendEmailCode();
    if (
      sendResult &&
      typeof sendResult === "object" &&
      "error" in sendResult &&
      sendResult.error
    ) {
      setFormMessage(getClerkErrorMessage(sendResult.error));
      return;
    }

    setResendSec(45);
  };

  const handleResendCode = async () => {
    if (resendSec > 0 || busy) return;
    setFormMessage(null);
    const sendResult = await signUp.verifications.sendEmailCode();
    if (
      sendResult &&
      typeof sendResult === "object" &&
      "error" in sendResult &&
      sendResult.error
    ) {
      setFormMessage(getClerkErrorMessage(sendResult.error));
      return;
    }
    setResendSec(45);
  };

  const handleVerify = async () => {
    const cErr = validateVerificationCode(code);
    setCodeError(cErr);
    if (cErr) return;

    setFormMessage(null);

    const normalized = code.replace(/\D/g, "");
    const { error } = await signUp.verifications.verifyEmailCode({
      code: normalized,
    });

    if (error) {
      setFormMessage(getClerkErrorMessage(error));
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setFormMessage("Complete the remaining step in your account to continue.");
            return;
          }
          navigateAfterAuth(decorateUrl, router);
        },
      });
    } else {
      setFormMessage("That code did not work. Check the number and try again.");
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (verifyPhase) {
    return (
      <AuthShell
        title="Confirm your email"
        subtitle={`We sent a 6-digit code to ${emailAddress.trim() || "your inbox"}. It expires soon for your security.`}
        showBrand
      >
        <View className="auth-card">
          <View className="auth-form">
            {formMessage ? (
              <View className="auth-form-message">
                <Text className="auth-form-message-text">{formMessage}</Text>
              </View>
            ) : null}

            <View className="auth-field">
              <Text className="auth-label">Code</Text>
              <TextInput
                className={clsx(
                  "auth-input",
                  (codeError || errors.fields?.code) && "auth-input-error",
                )}
                value={code}
                placeholder="6-digit code"
                placeholderTextColor={colors.mutedForeground}
                onChangeText={onChangeCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={8}
              />
              {(codeError || errors.fields?.code) && (
                <Text className="auth-error">
                  {codeError ?? errors.fields?.code?.message}
                </Text>
              )}
            </View>

            <Pressable
              className={clsx("auth-button w-full", busy && "auth-button-disabled")}
              disabled={busy}
              onPress={() => void handleVerify()}
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="auth-button-text">Create account</Text>
              )}
            </Pressable>

            <Pressable
              className={clsx(
                "auth-secondary-button w-full",
                (resendSec > 0 || busy) && "opacity-50",
              )}
              disabled={resendSec > 0 || busy}
              onPress={() => void handleResendCode()}
            >
              <Text className="auth-secondary-button-text">
                {resendSec > 0 ? `Resend code in ${resendSec}s` : "Resend code"}
              </Text>
            </Pressable>
          </View>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={`Join ${brand.name} to track renewals, spending, and what matters.`}
      showBrand
    >
      <View className="auth-card">
        <View className="auth-form">
          {formMessage ? (
            <View className="auth-form-message">
              <Text className="auth-form-message-text">{formMessage}</Text>
            </View>
          ) : null}

          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={clsx(
                "auth-input",
                (emailError || errors.fields?.emailAddress) && "auth-input-error",
              )}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor={colors.mutedForeground}
              onChangeText={onChangeEmail}
            />
            {(emailError || errors.fields?.emailAddress) && (
              <Text className="auth-error">
                {emailError ?? errors.fields?.emailAddress?.message}
              </Text>
            )}
          </View>

          <View className="auth-field">
            <Text className="auth-label">Password</Text>
            <View
              className={clsx(
                "auth-password-row",
                (passwordError || errors.fields?.password) && "auth-password-row-error",
              )}
            >
              <TextInput
                className="auth-password-input"
                value={password}
                placeholder="Create a password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                onChangeText={onChangePassword}
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Pressable
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                className="auth-password-toggle"
                onPress={() => setShowPassword((v) => !v)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
            </View>
            {(passwordError || errors.fields?.password) && (
              <Text className="auth-error">
                {passwordError ?? errors.fields?.password?.message}
              </Text>
            )}
            <Text className="auth-helper">
              At least 8 characters, with one letter and one number.
            </Text>
          </View>

          <Pressable
            className={clsx("auth-button w-full", busy && "auth-button-disabled")}
            disabled={busy}
            onPress={() => void handleSubmit()}
          >
            {busy ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="auth-button-text">Continue</Text>
            )}
          </Pressable>

          <View nativeID="clerk-captcha" className="min-h-12 w-full" />

          <View className="auth-link-row-wrap">
            <Text className="auth-link-copy">Already on {brand.name}? </Text>
            <Link href="/sign-in" asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </AuthShell>
  );
}
