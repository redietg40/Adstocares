import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ad2Care",
  description: "Promote Products. Empower Women.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
