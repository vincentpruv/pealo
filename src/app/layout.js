import { DM_Sans } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Pealo — Collect User Feedback Effortlessly",
  description:
    "The simplest way to collect user feedback, bug reports, and suggestions. Install in one line of code. Get screenshots, metadata, and organized insights.",
  metadataBase: new URL("https://usepealo.com"),
  openGraph: {
    title: "Pealo — Collect User Feedback Effortlessly",
    description:
      "The simplest way to collect user feedback, bug reports, and suggestions. Install in one line of code.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pealo — Collect User Feedback Effortlessly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pealo — Collect User Feedback Effortlessly",
    description:
      "The simplest way to collect user feedback, bug reports, and suggestions.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        {children}
        <Script src="/widget/feedback-widget.js" data-api-key="fl_8dc5496857d1ba0c11967e5968ae1ee97fdce1ccadee9c5a" strategy="lazyOnload" />
      </body>
    </html>
  );
}
