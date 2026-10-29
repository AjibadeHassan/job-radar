import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GigForMe — Find gigs that match you, not the other way around",
  description: "Upload your resume, pick your expertise, and let GigForMe scan the market for roles that actually fit. Telegram alerts when the right opportunity surfaces. For every profession.",
  keywords: ["job alerts", "telegram bot", "resume matching", "career", "gigs", "Africa jobs", "remote jobs", "professional"],
  authors: [{ name: "GigForMe" }],
  openGraph: {
    title: "GigForMe",
    description: "Find gigs that match you, not the other way around",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
