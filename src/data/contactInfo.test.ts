import { expect, test } from "vitest";

import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  LTR_ISOLATE_END,
  LTR_ISOLATE_START,
  WHATSAPP_HREF,
  WHATSAPP_NUMBER,
} from "./contactInfo";
import { organizationJsonLd } from "@/lib/jsonLd";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";
import zhMessages from "@/messages/zh.json";
import { getContactPageCopy } from "./siteCopy";
import { SOCIAL_LINKS } from "./socialLinks";

const digitsOf = (value: string): string => value.replace(/\D/g, "");

test("contact destinations match the contact details shown across the site", () => {
  expect(CONTACT_EMAIL_HREF).toBe(`mailto:${CONTACT_EMAIL}`);
  // Compared against the number itself, not a second copy of the digits — the
  // whole point is that the link cannot disagree with what is printed.
  expect(WHATSAPP_HREF).toBe(`https://wa.me/${digitsOf(WHATSAPP_NUMBER)}`);

  const primaryLocation = getContactPageCopy("en").locations[0];
  expect(primaryLocation.email).toBe(CONTACT_EMAIL);
  expect(primaryLocation.tel).toBe(WHATSAPP_NUMBER);

  const whatsappLink = SOCIAL_LINKS.find(
    (link) => link.platform === "whatsapp"
  );
  expect(whatsappLink?.href).toBe(WHATSAPP_HREF);
});

// The footer copy and the JSON-LD both keep their own copy of the phone number
// because neither can import a constant at the point it is written. Nothing
// used to check them, which is how the site could end up advertising two
// different numbers at once.
test.each([
  ["zh", zhMessages],
  ["en", enMessages],
  ["es", esMessages],
  ["ar", arMessages],
])("%s footer prints the current phone number", (_locale, messages) => {
  const phoneLine = messages.Footer.addressLines[1];
  expect(digitsOf(phoneLine)).toBe(digitsOf(WHATSAPP_NUMBER));
});

test("arabic footer isolates the number so RTL does not reorder its groups", () => {
  const phoneLine = arMessages.Footer.addressLines[1];
  // Stored in reading order and wrapped, rather than written backwards to
  // cancel out the reordering — that trick renders fine but copies wrong.
  expect(phoneLine).toContain(
    `${LTR_ISOLATE_START}${WHATSAPP_NUMBER}${LTR_ISOLATE_END}`
  );
});

test("organization structured data reports the current phone number", () => {
  const jsonLd = organizationJsonLd("en");
  const contactPoint = jsonLd.contactPoint as { telephone: string };

  expect(digitsOf(jsonLd.telephone as string)).toBe(digitsOf(WHATSAPP_NUMBER));
  expect(digitsOf(contactPoint.telephone)).toBe(digitsOf(WHATSAPP_NUMBER));
});
