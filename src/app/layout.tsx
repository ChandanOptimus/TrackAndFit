import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Track And Fit", template: "%s · Track And Fit" },
  description: "Log your daily body weight, see weekly averages, grades and nutrition targets.",
  // Lets "Add to Home Screen" on iPhone open it like an app, without browser bars.
  appleWebApp: { capable: true, title: "Track And Fit", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets us respect the iPhone notch and home-bar safe areas
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#18132a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
