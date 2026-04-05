const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter your email address.";
  if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address.";
  return null;
}

export function validatePasswordRequired(value: string): string | null {
  if (!value) return "Enter your password.";
  return null;
}

/** Aligns with common dashboard rules; Clerk may enforce stricter policy server-side. */
export function validatePasswordForSignUp(value: string): string | null {
  if (!value) return "Choose a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[a-zA-Z]/.test(value)) return "Include at least one letter.";
  if (!/[0-9]/.test(value)) return "Include at least one number.";
  return null;
}

export function validateVerificationCode(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 6) return "Enter the 6-digit code from your email.";
  return null;
}
