function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === "") {
    throw new Error(errorMessage);
  }
  return v;
}

export const payloadSecret = assertValue(
  process.env.PAYLOAD_SECRET,
  "Missing environment variable: PAYLOAD_SECRET"
);

export const databaseUrl = assertValue(
  process.env.DATABASE_URL,
  "Missing environment variable: DATABASE_URL"
);

export const r2AccessKeyId = assertValue(
  process.env.R2_ACCESS_KEY_ID,
  "Missing environment variable: R2_ACCESS_KEY_ID"
);

export const r2SecretAccessKey = assertValue(
  process.env.R2_SECRET_ACCESS_KEY,
  "Missing environment variable: R2_SECRET_ACCESS_KEY"
);

export const r2Bucket = assertValue(
  process.env.R2_BUCKET,
  "Missing environment variable: R2_BUCKET"
);

export const r2Endpoint = assertValue(
  process.env.R2_ENDPOINT,
  "Missing environment variable: R2_ENDPOINT"
);

export const r2PublicUrl = assertValue(
  process.env.R2_PUBLIC_URL,
  "Missing environment variable: R2_PUBLIC_URL"
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
