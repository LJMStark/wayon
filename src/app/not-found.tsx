import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1.5rem",
            padding: "6rem 1.5rem",
            textAlign: "center",
            fontFamily: "sans-serif",
            color: "#1a1a1a",
            backgroundColor: "#fff",
          }}
        >
          <p style={{ fontSize: "3.75rem", fontWeight: 200, letterSpacing: "0.2em", color: "#0a1e3f" }}>
            404
          </p>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 400, letterSpacing: "0.05em" }}>
            Page Not Found
          </h1>
          <p style={{ maxWidth: "36rem", fontSize: "0.875rem", lineHeight: "1.75", color: "#4b5563" }}>
            The page you are looking for does not exist.
          </p>
          <Link
            href="/"
            style={{
              backgroundColor: "#0a1e3f",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            Back to Home
          </Link>
        </main>
      </body>
    </html>
  );
}
