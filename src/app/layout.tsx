import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import SmoothScroll from "@/components/ui/smooth-scroll";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { ToastNotifications } from "@/components/ui/toast-notifications";
import RealTimeNotifications from "@/components/real-time-notifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Abroad with Hadi - Visa Consulting & International Education",
  description: "Expert visa consulting services for students looking to study abroad. Personalized guidance for admissions, scholarships, and visa applications.",
  keywords: ["Study Abroad", "Visa Consulting", "International Education", "Hadi", "Student Visa", "Scholarships"],
  authors: [{ name: "Study Abroad with Hadi" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Study Abroad with Hadi",
    description: "Expert visa consulting services for students looking to study abroad",
    url: "https://studyabroadwithhadi.info",
    siteName: "Study Abroad with Hadi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Abroad with Hadi",
    description: "Expert visa consulting services for students looking to study abroad",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <SmoothScroll />
          {children}
          <FloatingActionButton />
          <RealTimeNotifications />
          <Toaster />
          <ToastNotifications />
        </Providers>
      </body>
    </html>
  );
}
