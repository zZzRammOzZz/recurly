import { isClerkAPIResponseError } from "@clerk/expo";

export function getClerkErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors?.[0];
    const msg = first?.longMessage ?? first?.message;
    if (msg) return msg;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
