import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ClientAuthProvider } from "@/components/providers/ClientAuthProvider";
import "@/lib/suppress-hydration-warnings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoBet - Gestão Inteligente de Apostas",
  description: "Plataforma moderna para gerenciar suas contas de apostas de forma automatizada e inteligente",
  keywords: "apostas, automação, gestão, lotogreen, mcgames, estrelabet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientAuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
