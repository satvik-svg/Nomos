import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/contexts/ToastContext";
import InitEvmAddress from "./init-evm-address";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <WalletProvider>
          <ToastProvider>
            <InitEvmAddress />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
