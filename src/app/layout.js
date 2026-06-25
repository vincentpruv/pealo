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
  openGraph: {
    title: "Pealo — Collect User Feedback Effortlessly",
    description:
      "The simplest way to collect user feedback, bug reports, and suggestions. Install in one line of code.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pealo — Collect User Feedback Effortlessly",
    description:
      "The simplest way to collect user feedback, bug reports, and suggestions.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        {children}
        <Script src="/widget/feedback-widget.js" data-api-key="demo_key" strategy="lazyOnload" />
      </body>
    </html>
  );
}
