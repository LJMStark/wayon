/**
 * One-shot script: strip leading ASCII code prefixes (e.g. FK1632B1212) from product titles.
 * Affects all locales. Dry-run by default; pass --apply to write.
 *
 * Pattern: one or more ASCII alphanumeric chars immediately followed by a non-ASCII char (Chinese).
 */

import { getPayload } from 'payload';
import config from '../src/payload.config.ts';

const APPLY = process.argv.includes('--apply');
const LOCALES = ['zh', 'en', 'es', 'ar'];
// Matches a leading ASCII alphanumeric prefix only when directly followed by a non-ASCII character
const PREFIX_RE = /^[A-Za-z0-9]+(?=[^\x00-\x7F])/;

const payload = await getPayload({ config });

const { docs, totalDocs } = await payload.find({
  collection: 'products',
  limit: 1000,
  locale: 'zh',
  depth: 0,
});

console.log(`Scanned ${totalDocs} products.`);

const affected = docs.filter((p) => PREFIX_RE.test(p.title || ''));
console.log(`Found ${affected.length} products with prefix.\n`);

for (const product of affected) {
  console.log(`Product: ${product.id}`);
  const localeUpdates = {};

  for (const locale of LOCALES) {
    const doc = await payload.findByID({
      collection: 'products',
      id: product.id,
      locale,
      depth: 0,
    });
    const oldTitle = doc.title || '';
    const newTitle = oldTitle.replace(PREFIX_RE, '');
    console.log(`  [${locale}] "${oldTitle}" → "${newTitle}"`);
    localeUpdates[locale] = newTitle;
  }

  if (APPLY) {
    for (const locale of LOCALES) {
      await payload.update({
        collection: 'products',
        id: product.id,
        locale,
        data: { title: localeUpdates[locale] },
      });
    }
    console.log(`  ✓ Updated\n`);
  } else {
    console.log(`  (dry-run)\n`);
  }
}

console.log(APPLY ? 'Done.' : 'Dry-run complete. Pass --apply to write.');
process.exit(0);
