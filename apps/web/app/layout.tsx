import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprintify - AI Ticket Generation",
  description: "Automatically generate development tickets from requirements documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

