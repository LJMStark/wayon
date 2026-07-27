import { expect, test } from "vitest";

import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  WHATSAPP_HREF,
  WHATSAPP_NUMBER,
} from "./contactInfo";
import { getContactPageCopy } from "./siteCopy";
import { SOCIAL_LINKS } from "./socialLinks";

test("contact destinations match the contact details shown across the site", () => {
  expect(CONTACT_EMAIL_HREF).toBe(`mailto:${CONTACT_EMAIL}`);
  expect(WHATSAPP_HREF).toBe("https://wa.me/8613229246894");

  const primaryLocation = getContactPageCopy("en").locations[0];
  expect(primaryLocation.email).toBe(CONTACT_EMAIL);
  expect(primaryLocation.tel).toBe(WHATSAPP_NUMBER);

  const whatsappLink = SOCIAL_LINKS.find(
    (link) => link.platform === "whatsapp"
  );
  expect(whatsappLink?.href).toBe(WHATSAPP_HREF);
});
