import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "SabiTrack - AI-Powered Accountability",
  description: "Turn your goals into daily actions with AI-generated roadmaps and WhatsApp accountability.",
  themeColor: "#10B981",
  icons: [
    { rel: "icon", url: "/icon.svg" },
    { rel: "apple-touch-icon", url: "/icon.svg", sizes: "180x180" },
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SabiTrack",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
