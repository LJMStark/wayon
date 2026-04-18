"use server";

import { Resend } from "resend";
import { z } from "zod";

import { client } from "@/sanity/lib/client";
import {
  inquiryNotifyTo,
  resendApiKey,
  resendFromEmail,
  sanityApiToken,
} from "@/lib/env";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(1).max(200),
  contact: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
});

type InquiryPayload = z.infer<typeof inquirySchema>;

const MIN_FORM_DURATION_MS = 2000;

// Hard rate limit on inquiry submissions per email. The honeypot and
// timestamp checks catch the dumb bots; this catches the slightly less
// dumb ones that fill the form properly with a fixed email. Rotating
// emails per request is a deeper problem better solved by Turnstile,
// which we deferred — this is the no-extra-dependency tier.
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_PER_EMAIL = 5;

export type SubmitInquiryResult =
  | { success: true }
  | {
      success: false;
      error: "validation_failed" | "rate_limited" | "submission_failed";
    };

export async function submitInquiry(
  formData: FormData
): Promise<SubmitInquiryResult> {
  if (isLikelyBot(formData)) {
    return { success: true };
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    email: formData.get("email"),
    company: formData.get("company"),
    contact: formData.get("contact"),
    country: formData.get("country"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: "validation_failed" };
  }

  const data = parsed.data;
  const writeClient = client.withConfig({ token: sanityApiToken });

  if (await isRateLimited(writeClient, data.email)) {
    return { success: false, error: "rate_limited" };
  }

  try {
    await writeClient.create({
      _type: "inquiry",
      ...data,
      status: "pending",
    });
  } catch (error) {
    console.error("Failed to persist inquiry:", error);
    return { success: false, error: "submission_failed" };
  }

  await sendInquiryNotification(data);

  return { success: true };
}

async function isRateLimited(
  sanityClient: ReturnType<typeof client.withConfig>,
  email: string
): Promise<boolean> {
  const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  try {
    // Sanity GROQ does case-sensitive string compare. Lowercase both sides
    // to keep "Foo@x.com" and "foo@x.com" in the same bucket.
    const count = await sanityClient.fetch<number>(
      'count(*[_type == "inquiry" && lower(email) == $email && _createdAt >= $since])',
      { email: email.toLowerCase(), since: sinceIso }
    );
    return typeof count === "number" && count >= RATE_LIMIT_MAX_PER_EMAIL;
  } catch (error) {
    // Don't let a transient query failure deny legitimate inquiries —
    // log and fall through. The honeypot/timestamp gates still apply.
    console.error("Failed to check inquiry rate limit:", error);
    return false;
  }
}

function isLikelyBot(formData: FormData): boolean {
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return true;
  }

  const renderedAtRaw = formData.get("renderedAt");
  if (typeof renderedAtRaw === "string" && renderedAtRaw !== "") {
    const renderedAt = Number(renderedAtRaw);
    if (Number.isFinite(renderedAt)) {
      const elapsed = Date.now() - renderedAt;
      if (elapsed >= 0 && elapsed < MIN_FORM_DURATION_MS) {
        return true;
      }
    }
  }

  return false;
}

async function sendInquiryNotification(data: InquiryPayload): Promise<void> {
  try {
    const resend = new Resend(resendApiKey);
    const recipients = inquiryNotifyTo
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (recipients.length === 0) return;

    // Resend surfaces most API-level failures (unverified sender domain,
    // invalid recipients, rate limits, etc.) on the `error` field rather than
    // throwing, so awaiting alone is not enough to tell success from failure.
    const { data: sendData, error } = await resend.emails.send({
      from: resendFromEmail,
      to: recipients,
      replyTo: data.email,
      subject: `[Inquiry] ${data.name} — ${data.company}`,
      text: buildInquiryEmailText(data),
    });

    if (error) {
      console.error("Resend rejected inquiry notification:", {
        name: error.name,
        message: error.message,
      });
      return;
    }

    if (!sendData) {
      console.error("Resend returned neither data nor error for inquiry notification");
    }
  } catch (error) {
    console.error("Failed to send inquiry notification email:", error);
  }
}

function buildInquiryEmailText(data: InquiryPayload): string {
  return [
    `Name: ${data.name}`,
    `Role: ${data.role}`,
    `Email: ${data.email}`,
    `Company: ${data.company}`,
    `Contact: ${data.contact}`,
    `Country: ${data.country}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
}
