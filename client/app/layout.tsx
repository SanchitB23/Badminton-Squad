import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Badminton Squad",
  description: "Coordinate badminton sessions with your squad",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
