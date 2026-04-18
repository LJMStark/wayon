function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === "") {
    throw new Error(errorMessage);
  }
  return v;
}

export const sanityApiToken = assertValue(
  process.env.SANITY_API_TOKEN,
  "Missing environment variable: SANITY_API_TOKEN"
);

export const resendApiKey = assertValue(
  process.env.RESEND_API_KEY,
  "Missing environment variable: RESEND_API_KEY"
);

export const resendFromEmail = assertValue(
  process.env.RESEND_FROM_EMAIL,
  "Missing environment variable: RESEND_FROM_EMAIL"
);

export const inquiryNotifyTo = assertValue(
  process.env.INQUIRY_NOTIFY_TO,
  "Missing environment variable: INQUIRY_NOTIFY_TO"
);
