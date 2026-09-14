export const CONTACT_EMAIL = "zyl.stone.slab@gmail.com";
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export const WHATSAPP_NUMBER = "+86 132 0295 7096";

// Derived rather than hand-typed: a wa.me link that disagrees with the number
// printed next to it sends enquiries to a number nobody owns, and the two
// literals gave no hint they had to be edited together.
export const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;

// Arabic runs RTL, where a number written as space-separated groups gets those
// groups reordered on screen — "+86 132 0295 7096" displays back to front. Any
// Arabic copy that spells the number out must wrap it in these two characters,
// which mark it as a left-to-right run. The alternative the footer used to rely
// on — typing the groups backwards so the reordering cancels out — looks right
// but copies, reads aloud and gets crawled wrong.
//
// Written as code points because both characters render as nothing: pasted in
// literally, they would be invisible to anyone reviewing this file. Arabic copy
// lives in messages/ar.json and the legal pages, which cannot import from here,
// so they carry U+2066 / U+2069 escapes; these constants let the tests assert
// that they did.
export const LTR_ISOLATE_START = String.fromCharCode(0x2066); // LEFT-TO-RIGHT ISOLATE
export const LTR_ISOLATE_END = String.fromCharCode(0x2069); // POP DIRECTIONAL ISOLATE
