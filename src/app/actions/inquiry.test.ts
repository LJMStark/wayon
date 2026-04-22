import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockCount: vi.fn(),
  mockSend: vi.fn(),
}));

vi.mock("@/lib/server-env", () => ({
  resendApiKey: "test-resend-key",
  resendFromEmail: "noreply@test.com",
  inquiryNotifyTo: "sales@test.com",
}));

vi.mock("@/data/_payload", () => ({
  getPayloadClient: async () => ({
    create: mocks.mockCreate,
    count: mocks.mockCount,
  }),
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
    mocks.mockCount.mockReset();
    mocks.mockSend.mockReset();
    mocks.mockCreate.mockResolvedValue({ id: "new-doc" });
    mocks.mockSend.mockResolvedValue({ data: { id: "msg-1" }, error: null });
    mocks.mockCount.mockResolvedValue({ totalDocs: 0 });
  });

  it("persists to Payload and sends email on happy path", async () => {
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: true });
    expect(mocks.mockCreate).toHaveBeenCalledTimes(1);
    expect(mocks.mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "inquiries",
        data: expect.objectContaining({
          name: "Alice",
          email: "alice@example.com",
          status: "pending",
        }),
        overrideAccess: true,
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

  it("persists inquiry with status 'pending'", async () => {
    const fd = validFormData({}, Date.now() - 5000);
    await submitInquiry(fd);

    const [createArgs] = mocks.mockCreate.mock.calls[0];
    expect(createArgs.data.status).toBe("pending");
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

  it("returns submission_failed when Payload write throws", async () => {
    mocks.mockCreate.mockRejectedValueOnce(new Error("payload unavailable"));
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
    mocks.mockCount.mockResolvedValueOnce({ totalDocs: 5 });
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: false, error: "rate_limited" });
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockSend).not.toHaveBeenCalled();
    // The query keys must be normalized so "Foo@x.com" buckets with "foo@x.com".
    expect(mocks.mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "inquiries",
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { email: { equals: "alice@example.com" } },
          ]),
        }),
        overrideAccess: true,
      }),
    );
  });

  it("rejects the submission when the rate-limit query throws (fail-closed, no abuse window)", async () => {
    mocks.mockCount.mockRejectedValueOnce(new Error("payload rate-check down"));
    const fd = validFormData({}, Date.now() - 5000);
    const result = await submitInquiry(fd);

    expect(result).toEqual({ success: false, error: "rate_limited" });
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockSend).not.toHaveBeenCalled();
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
