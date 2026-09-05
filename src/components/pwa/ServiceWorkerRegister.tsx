"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registrado con éxito:", registration.scope);
            
            // Comprobar actualizaciones periódicamente
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      console.log("[PWA] Nueva versión disponible en segundo plano.");
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("[PWA] Error al registrar Service Worker:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    } else if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "development"
    ) {
      // En desarrollo también registramos para pruebas locales si se desea, o informamos
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA Dev] Service Worker activo en:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA Dev] SW registration notice:", err);
        });
    }
  }, []);

  return null;
}
