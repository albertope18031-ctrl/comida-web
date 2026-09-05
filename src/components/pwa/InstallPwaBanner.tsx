"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pwa_prompt_dismissed_until";
const DISMISS_DAYS = 14;

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está en modo standalone (ya instalada)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Verificar si el usuario lo descartó previamente en los últimos 14 días
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 3. Detección de iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream: unknown }).MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
      // Retrasar 2 segundos para no interrumpir el First Contentful Paint
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    // 4. Captura del evento en Android / Chromium / Desktop Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostrar el banner tras breve espera para dar fluidez inicial
      setTimeout(() => setIsVisible(true), 1500);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSModal(false);
    const expireTime = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, expireTime.toString());
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Banner Principal Flotante */}
      <aside
        aria-label="Instalación de Aplicación"
        className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#004227] text-white p-4 shadow-2xl border-2 border-[#FFC72C]/70 backdrop-blur-md">
          {/* Fondo sutil decorativo */}
          <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-[#FFC72C]/10 blur-xl pointer-events-none" />

          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 p-1 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-800/60 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-emerald-500/50 shadow-md bg-emerald-950">
              <Image
                src="/icons/icon-192x192.png"
                alt="Logo Comida App"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#FFC72C] tracking-wide uppercase">
                <Sparkles className="h-3 w-3" />
                <span>Experiencia Móvil VIP</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-snug">
                📲 Instala nuestra App para ordenar en 1 toque y recibir promociones exclusivas.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-emerald-800/80">
            <button
              onClick={handleDismiss}
              className="text-xs text-emerald-200 hover:text-white font-semibold px-2.5 py-1.5 transition-colors"
            >
              Ahora no
            </button>
            <Button
              onClick={handleInstallClick}
              variant="gold"
              size="sm"
              className="font-black text-xs h-8 px-3.5 rounded-lg shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Instalar Ahora</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Modal Instructivo para iOS Safari */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 text-white p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#FFC72C]" />
                <h3 className="font-black text-base uppercase tracking-wide">
                  Instalar en tu iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Sigue estos 2 sencillos pasos en Safari para tener acceso instantáneo a nuestro menú en tu pantalla de inicio:
            </p>

            <div className="space-y-3.5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-black">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-neutral-200">
                    Toca el botón <span className="font-bold text-white">Compartir</span> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
                  <Share className="h-4 w-4" />
                </div>
              </div>

              <div className="h-px bg-neutral-800" />

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-black">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-neutral-200">
                    Desliza hacia abajo y selecciona <span className="font-bold text-white">"Agregar al inicio"</span>.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-neutral-800 text-emerald-400">
                  <PlusSquare className="h-4 w-4" />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full font-black text-xs uppercase tracking-wider py-5"
              onClick={handleDismiss}
            >
              ¡Entendido, gracias!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
