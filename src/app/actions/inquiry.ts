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

export type SubmitInquiryResult =
  | { success: true }
  | { success: false; error: "validation_failed" | "submission_failed" };

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

  try {
    const writeClient = client.withConfig({ token: sanityApiToken });
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
