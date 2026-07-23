import type { Metadata } from "next";

import LocaleNotFound from "../not-found";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CatalogNotFoundPage(): React.JSX.Element {
  return <LocaleNotFound />;
}
