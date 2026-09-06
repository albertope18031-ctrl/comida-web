import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Titan_One, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

// Dynamic imports para optimizar First Load JS y LCP
const CartDrawer = dynamic(
  () => import("@/components/shop/CartDrawer").then((mod) => mod.CartDrawer)
);

const InstallPwaBanner = dynamic(
  () => import("@/components/pwa/InstallPwaBanner").then((mod) => mod.InstallPwaBanner)
);

// Fuentes oficiales de Google Fonts para LOCO ROOSTER
const titanOne = Titan_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FF3823",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://locorooster.com.mx";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LOCO ROOSTER | Monchos de Verdad para Gente Loca",
    template: "%s | LOCO ROOSTER",
  },
  description:
    "Disfruta de las alitas más atrevidas, hamburguesas bestiales, boneless jugosos, crispy tenders y combos legendarios en Loco Rooster. ¡Sin excusas!",
  keywords: [
    "Loco Rooster",
    "Alitas",
    "Hamburguesas",
    "Boneless",
    "Crispy Tenders",
    "Comida rápida México",
    "Monchos",
    "Delivery",
    "Papas con queso",
    "Mega Combo Rooster",
  ],
  authors: [{ name: "Loco Rooster" }],
  creator: "Loco Rooster",
  publisher: "Loco Rooster",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loco Rooster",
  },
  formatDetection: {
    telephone: false,
    address: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    title: "LOCO ROOSTER | Monchos de Verdad para Gente Loca",
    description:
      "Alitas con salsas bravas, hamburguesas dobles de res de 300g, boneless crujientes y los tenders más bestiales.",
    siteName: "Loco Rooster",
    images: [
      {
        url: "/images/loco-rooster.png",
        width: 1200,
        height: 630,
        alt: "Loco Rooster - Monchos de Verdad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LOCO ROOSTER | Monchos de Verdad",
    description: "Alitas, hamburguesas bestiales y boneless jugosos preparados al momento.",
    creator: "@LocoRooster",
    images: ["/images/loco-rooster.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${titanOne.variable} ${fredoka.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-screen bg-[#FAF7F2] text-[#1C1917] font-sans antialiased flex flex-col selection:bg-[#FFB703] selection:text-[#1C1917]">
        {children}
        <CartDrawer />
        <InstallPwaBanner />
        <ServiceWorkerRegister />
        <Toaster
          richColors
          position="top-right"
          theme="light"
          closeButton
        />
      </body>
    </html>
  );
}
