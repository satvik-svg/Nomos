import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/contexts/ToastContext";
import InitEvmAddress from "./init-evm-address";
import MobileNav from "@/components/layout/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hedera Content Platform",
  description: "Decentralized content monetization platform built on Hedera Hashgraph",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-black`}
      >
        <WalletProvider>
          <ToastProvider>
            <InitEvmAddress />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <MobileNav />
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
