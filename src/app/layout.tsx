import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Track And Fit", template: "%s · Track And Fit" },
  description: "Log your daily body weight, see weekly averages, grades and nutrition targets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
