import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SabiTrack - AI-Powered Accountability",
  description: "Turn your goals into daily actions with AI-generated roadmaps and WhatsApp accountability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark text-light">
        {children}
      </body>
    </html>
  );
}
