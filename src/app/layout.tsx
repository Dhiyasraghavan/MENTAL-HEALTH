import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./performance.css";
import Navbar from "./components/Navbar";
import BackgroundWrapper from "./components/BackgroundWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mental Health Hub | SDG 3.4 Aligned",
  description:
    "AI-driven emotional support for students, IT professionals, and senior citizens. Anonymous, secure, and available 24/7.",
  keywords:
    "mental health, SDG 3.4, AI therapy, student wellness, emotional support, mental wellness",
  authors: [{ name: "Mental Health Hub Team" }],
  openGraph: {
    title: "Mental Health Hub - SDG 3.4 Aligned",
    description: "AI-driven emotional support platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
          async
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundWrapper>
          <Navbar />
          {children}
        </BackgroundWrapper>
      </body>
    </html>
  );
}
