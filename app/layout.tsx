import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "./admin.css";
import { PwaRegister } from "@/components/pwa-register";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "Ariem Cinco | Resource Speaker & Communication Strategist",
  description: "Ariem Cinco helps leaders, educators, and organizations communicate with clarity, confidence, and purpose.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand/ariem-mark.png",
    shortcut: "/brand/ariem-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}><PwaRegister/>{children}</body>
    </html>
  );
}
