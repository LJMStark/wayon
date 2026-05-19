"use client";

import Link from "next/link";

type CellProps = {
  rowData?: { id?: string | number; slug?: string | null };
};

export function ProductCodeCell({ rowData }: CellProps) {
  const id = rowData?.id;
  const slug = (rowData?.slug ?? "").toUpperCase();

  if (id === undefined || id === null || slug === "") {
    return <span>{slug}</span>;
  }

  return (
    <Link
      href={`/admin/collections/products/${id}`}
      style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
    >
      {slug}
    </Link>
  );
}
