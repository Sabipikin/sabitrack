import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import PlatformSSO from "./components/PlatformSSO";
import { GoogleProvider } from "@/lib/google-oauth";

export const metadata: Metadata = {
  title: "SabiTrack - AI-Powered Accountability",
  description: "Turn your goals into daily actions with AI-generated roadmaps and WhatsApp accountability.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10B981",
};

// Captures the Sabi platform one-login fragment (#sso=platform&token=...)
// before the Next router can replace the URL and drop it; PlatformSSO
// exchanges the stashed token for a Supabase session on mount.
const SSO_CAPTURE = `(function(){try{var h=new URLSearchParams(location.hash.replace(/^#/,''));if(h.get('sso')==='platform'&&h.get('token')){sessionStorage.setItem('platformSSO',h.get('token'));history.replaceState(null,'',location.pathname+location.search);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: SSO_CAPTURE }} />
        <GoogleProvider>
          <PlatformSSO />
          {children}
        </GoogleProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
