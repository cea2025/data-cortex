import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "Data Cortex - Core Banking Knowledge Graph",
  description:
    "מנוע ממשל נתונים ואמון - מקור האמת היחיד לגישור בין מבני מסדי נתונים של בנקאות ליבה",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060e20" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
