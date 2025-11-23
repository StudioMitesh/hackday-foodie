import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiggieBack - AI Recipe Generator",
  description: "Upload ingredient photos and get AI-generated recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

