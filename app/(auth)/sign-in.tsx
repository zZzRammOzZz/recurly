import { AuthShell } from "@/components/AuthShell";
import { brand } from "@/constants/branding";
import { colors } from "@/constants/theme";
import { getClerkErrorMessage } from "@/lib/auth-errors";
import { navigateAfterAuth } from "@/lib/auth-navigation";
import { resolvePostAuthHref, returnToQuerySuffix } from "@/lib/auth-return-to";
import { validateEmail, validatePasswordRequired, validateVerificationCode } from "@/lib/auth-validation";
import { useSignIn } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const { returnTo: returnToParam } = useLocalSearchParams<{
    returnTo?: string | string[];
  }>();
  const postAuthPath = useMemo(
    () => resolvePostAuthHref(returnToParam, "/(tabs)"),
    [returnToParam],
  );

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [totpCode, setTotpCode] = React.useState("");
  const [totpCodeError, setTotpCodeError] = React.useState<string | null>(null);
  const [totpBusy, setTotpBusy] = React.useState(false);
  const [formMessage, setFormMessage] = React.useState<string | null>(null);

  const busy = fetchStatus === "fetching";

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

  const onChangeTotpCode = (v: string) => {
    setTotpCode(v.replace(/\D/g, "").slice(0, 8));
    setTotpCodeError(null);
    setFormMessage(null);
  };

  const handleTotpVerify = async () => {
    const cErr = validateVerificationCode(totpCode);
    setTotpCodeError(cErr);
    if (cErr) return;

    setTotpBusy(true);
    setFormMessage(null);

    try {
      const { error } = await signIn.mfa.verifyTOTP({
        code: totpCode.replace(/\D/g, ""),
      });

      if (error) {
        setTotpCodeError(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              setFormMessage("Complete the remaining step in your account to continue.");
              return;
            }
            navigateAfterAuth(decorateUrl, router, postAuthPath);
          },
        });
        if (finalizeError) {
          setFormMessage(getClerkErrorMessage(finalizeError));
        }
      } else {
        setTotpCodeError("That code did not work. Check your authenticator and try again.");
      }
    } finally {
      setTotpBusy(false);
    }
  };

  const handleSubmit = async () => {
    const eErr = validateEmail(emailAddress);
    const pErr = validatePasswordRequired(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setFormMessage(null);

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setFormMessage(getClerkErrorMessage(error));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setFormMessage("Complete the remaining step in your account to continue.");
            return;
          }
          navigateAfterAuth(decorateUrl, router, postAuthPath);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      setFormMessage(null);
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        const send = await signIn.mfa.sendEmailCode();
        if (send && "error" in send && send.error) {
          setFormMessage(getClerkErrorMessage(send.error));
        }
      }
    } else {
      setFormMessage("We could not finish signing you in. Please try again.");
    }
  };

  const handleVerify = async () => {
    const cErr = validateVerificationCode(code);
    setCodeError(cErr);
    if (cErr) return;

    setFormMessage(null);

    const { error } = await signIn.mfa.verifyEmailCode({
      code: code.replace(/\D/g, ""),
    });

    if (error) {
      setFormMessage(getClerkErrorMessage(error));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            setFormMessage("Complete the remaining step in your account to continue.");
            return;
          }
          navigateAfterAuth(decorateUrl, router, postAuthPath);
        },
      });
    } else {
      setFormMessage("That code did not work. Check the number and try again.");
    }
  };

  if (signIn.status === "needs_second_factor") {
    const totpFactor = signIn.supportedSecondFactors?.find((f) => f.strategy === "totp");
    const secondFactorBusy = totpBusy || busy;

    return (
      <AuthShell
        title="Extra verification"
        subtitle="Enter the 6-digit code from your authenticator app to finish signing in."
        showBrand
      >
        <View className="auth-card">
          <View className="auth-form">
            {formMessage ? (
              <View className="auth-form-message">
                <Text className="auth-form-message-text">{formMessage}</Text>
              </View>
            ) : null}

            {totpFactor ? (
              <>
                <View className="auth-field">
                  <Text className="auth-label">Authenticator code</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      (totpCodeError || errors.fields?.code) && "auth-input-error",
                    )}
                    value={totpCode}
                    placeholder="6-digit code"
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={onChangeTotpCode}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    maxLength={8}
                  />
                  {(totpCodeError || errors.fields?.code) && (
                    <Text className="auth-error">
                      {totpCodeError ?? errors.fields?.code?.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  className={clsx(
                    "auth-button w-full",
                    secondFactorBusy && "auth-button-disabled",
                  )}
                  disabled={secondFactorBusy}
                  onPress={() => void handleTotpVerify()}
                >
                  {secondFactorBusy ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="auth-button-text">Verify and continue</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <Text className="auth-helper text-center">
                This sign-in needs a second factor your app does not support yet. Use a different
                account or contact support.
              </Text>
            )}

            <Text className="auth-helper text-center">
              If you lost access to your second factor, recover your account from the email you used
              to sign up, or contact support for your organization.
            </Text>
            <Pressable
              className="auth-secondary-button w-full"
              disabled={secondFactorBusy}
              onPress={() => {
                void signIn.reset();
                setTotpCode("");
                setTotpCodeError(null);
                setFormMessage(null);
              }}
            >
              <Text className="auth-secondary-button-text">Use a different account</Text>
            </Pressable>
          </View>
        </View>
      </AuthShell>
    );
  }

  if (signIn.status === "needs_client_trust") {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent a one-time code to verify it is you. Enter it below to continue."
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
                <Text className="auth-button-text">Verify and continue</Text>
              )}
            </Pressable>

            <Pressable
              className={clsx(
                "auth-secondary-button w-full",
                busy && "opacity-50",
              )}
              disabled={busy}
              onPress={() => void signIn.mfa.sendEmailCode()}
            >
              <Text className="auth-secondary-button-text">Send a new code</Text>
            </Pressable>

            <Pressable
              className="auth-secondary-button w-full"
              disabled={busy}
              onPress={() => {
                void signIn.reset();
                setCode("");
                setFormMessage(null);
              }}
            >
              <Text className="auth-secondary-button-text">Start over</Text>
            </Pressable>
          </View>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={`Sign in to continue managing your subscriptions on ${brand.name}.`}
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
                (emailError || errors.fields?.identifier) && "auth-input-error",
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
            {(emailError || errors.fields?.identifier) && (
              <Text className="auth-error">
                {emailError ?? errors.fields?.identifier?.message}
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
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                onChangeText={onChangePassword}
                autoComplete="password"
                textContentType="password"
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
          </View>

          <Pressable
            className={clsx(
              "auth-button w-full",
              busy && "auth-button-disabled",
            )}
            disabled={busy}
            onPress={() => void handleSubmit()}
          >
            {busy ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="auth-button-text">Sign in</Text>
            )}
          </Pressable>

          <View className="auth-link-row-wrap">
            <Text className="auth-link-copy">New to {brand.name}? </Text>
            <Link href={`/sign-up${returnToQuerySuffix(returnToParam)}`} asChild>
              <Pressable hitSlop={8}>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </AuthShell>
  );
}
