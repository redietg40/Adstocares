"use client";

import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";
import "./globals.css";
import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Providers>
          <SessionProvider>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
