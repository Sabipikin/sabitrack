"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service worker registered:", registration.scope);
        })
        .catch((error) => {
          console.warn("Service worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
