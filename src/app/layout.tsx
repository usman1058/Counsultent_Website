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
  description:
    "Expert visa consulting services for students looking to study abroad. Personalized guidance for admissions, scholarships, and visa applications.",
  keywords: [
    "Study Abroad",
    "Visa Consulting",
    "International Education",
    "Hadi",
    "Student Visa",
    "Scholarships",
    "Overseas Education",
    "Foreign Universities",
    "Admissions Guidance",
  ],
  authors: [{ name: "Study Abroad with Hadi" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Study Abroad with Hadi - Visa Consulting & International Education",
    description:
      "Get expert visa and education consulting to study abroad with Hadi. Personalized support for admissions, scholarships, and visa processing.",
    url: "https://studyabroadwithhadi.info",
    siteName: "Study Abroad with Hadi",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Study Abroad with Hadi - Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Study Abroad with Hadi",
    description:
      "Expert visa consulting services for students looking to study abroad.",
    images: ["/logo.svg"],
    creator: "@StudyAbroadWithHadi",
  },
  alternates: {
    canonical: "https://studyabroadwithhadi.info",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
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
        {/* Google AdSense Verification */}
        <meta
          name="google-adsense-account"
          content="ca-pub-3745674559190273"
        />

        {/* Favicon and Font Awesome */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />

        {/* Additional SEO Enhancements */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="author" content="Study Abroad with Hadi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Structured Data (JSON-LD Schema for SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Study Abroad with Hadi",
              url: "https://studyabroadwithhadi.info",
              logo: "https://studyabroadwithhadi.info/logo.svg",
              sameAs: [
                "https://www.facebook.com/StudyAbroadWithHadi",
                "https://www.instagram.com/StudyAbroadWithHadi",
                "https://www.linkedin.com/company/studyabroadwithhadi",
              ],
              description:
                "Expert visa consulting and study abroad services for students worldwide. We help you with admissions, scholarships, and visa processing.",
            }),
          }}
        />
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
