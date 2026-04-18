import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockSend: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  sanityApiToken: "test-sanity-token",
  resendApiKey: "test-resend-key",
  resendFromEmail: "noreply@test.com",
  inquiryNotifyTo: "sales@test.com",
}));

vi.mock("@/sanity/lib/client", () => ({
  client: {
    withConfig: () => ({
      create: mocks.mockCreate,
      fetch: mocks.mockFetch,
    }),
  },
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.mockSend };
  },
}));

import { submitInquiry } from "./inquiry";

function validFormData(
  overrides: Record<string, string> = {},
  renderedAt?: number,
): FormData {
  const fd = new FormData();
  fd.set("name", "Alice");
  fd.set("role", "Buyer");
  fd.set("email", "alice@example.com");
  fd.set("company", "Acme");
  fd.set("contact", "WhatsApp +1");
  fd.set("country", "US");
  fd.set("message", "Hello, we'd like a quote.");
  if (renderedAt !== undefined) fd.set("renderedAt", String(renderedAt));
  for (const [key, value] of Object.entries(overrides)) fd.set(key, value);
  return fd;
}

describe("submitInquiry", () => {
  beforeEach(() => {
    mocks.mockCreate.mockReset();
    mocks.mockSend.mockReset();
    mocks.mockFetch.mockReset();
    mocks.mockCreate.mockResolvedValue({ _id: "new-doc" });
    mocks.mockSend.mockResolvedValue({ data: { id: "msg-1" }, error: null });
    mocks.mockFetch.mockResolvedValue(0);
  });

  it("persists to Sanity and sends email on happy path", async () => {
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
    expect(mocks.mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: "inquiry",
        name: "Alice",
        email: "alice@example.com",
        status: "pending",
      }),
    );
    expect(mocks.mockSend).toHaveBeenCalledTimes(1);
    expect(mocks.mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["sales@test.com"],
        replyTo: "alice@example.com",
      }),
    );
  });

  it("persists inquiry with status 'pending' (schema initialValue applies in Studio only)", async () => {
    const fd = validFormData({}, Date.now() - 5000);
    await submitInquiry(fd);

    const [createdDoc] = mocks.mockCreate.mock.calls[0];
    expect(createdDoc.status).toBe("pending");
  });

  it("silently drops submissions with honeypot filled", async () => {
    const fd = validFormData({ website: "spam-bot-value" });
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockSend).not.toHaveBeenCalled();
  });

  it("silently drops submissions faster than MIN_FORM_DURATION_MS", async () => {
    const fd = validFormData({}, Date.now() - 500);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockSend).not.toHaveBeenCalled();
  });

  it("allows submissions when client clock is skewed into the future (elapsed < 0)", async () => {
    const fd = validFormData({}, Date.now() + 10_000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns validation_failed on invalid email format", async () => {
    const fd = validFormData({ email: "not-an-email" }, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: false, error: "validation_failed" });
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockSend).not.toHaveBeenCalled();
  });

  it("returns submission_failed when Sanity write throws", async () => {
    mocks.mockCreate.mockRejectedValueOnce(new Error("sanity unavailable"));
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: false, error: "submission_failed" });
    expect(mocks.mockSend).not.toHaveBeenCalled();
  });

  it("still returns success when Resend throws (inquiry already persisted)", async () => {
    mocks.mockSend.mockRejectedValueOnce(new Error("resend down"));
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
  });

  it("returns rate_limited when the same email already has 5+ inquiries in the window", async () => {
    mocks.mockFetch.mockResolvedValueOnce(5);
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: false, error: "rate_limited" });
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockSend).not.toHaveBeenCalled();
    // The query keys must be normalized so "Foo@x.com" buckets with "foo@x.com".
    expect(mocks.mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("count(*[_type =="),
      expect.objectContaining({ email: "alice@example.com" })
    );
    const [, params] = mocks.mockFetch.mock.calls[0];
    expect(typeof params.since).toBe("string");
  });

  it("allows the submission when rate-limit query throws (fail-open, no false negatives)", async () => {
    mocks.mockFetch.mockRejectedValueOnce(new Error("sanity rate-check down"));
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
  });

  it("still returns success when Resend resolves with an error field (API-level failure)", async () => {
    // Resend surfaces unverified-domain / bad-recipient / rate-limit errors
    // on the response body instead of throwing. The action must treat these
    // as handled-and-logged, not crash, and must not re-persist the inquiry.
    mocks.mockSend.mockResolvedValueOnce({
      data: null,
      error: {
        name: "validation_error",
        message: "Domain is not verified",
      },
    });
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
    expect(mocks.mockSend).toHaveBeenCalledTimes(1);
  });
});
