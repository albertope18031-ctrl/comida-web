import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/shop/CartDrawer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#005A36",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wingstop.com.mx";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wingstop México | Los Expertos en Alitas y Boneless",
    template: "%s | Wingstop México",
  },
  description:
    "Ordena en línea las mejores alitas y boneless de México. 11 sabores icónicos como Lemon Pepper, Mango Habanero, Atomic y Garlic Parmesan. Entrega a domicilio o para llevar.",
  keywords: [
    "Wingstop",
    "Alitas",
    "Boneless",
    "Comida rápida",
    "Delivery alitas México",
    "Lemon Pepper",
    "Mango Habanero",
    "Papas sazonadas",
    "Wings",
  ],
  authors: [{ name: "Wingstop México" }],
  creator: "Wingstop México",
  publisher: "Wingstop México",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    title: "Wingstop México | Los Expertos en Alitas y Boneless",
    description:
      "Sabor insuperable preparado al momento. Elige tus salsas favoritas y recibe en la comodidad de tu casa.",
    siteName: "Wingstop México",
    images: [
      {
        url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Alitas y Boneless Wingstop México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wingstop México | Los Expertos en Alitas",
    description: "Ordena en línea tus alitas y boneless favoritos preparados al momento.",
    creator: "@WingstopMexico",
    images: ["https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1200&auto=format&fit=crop"],
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
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased flex flex-col selection:bg-[#FFC72C] selection:text-neutral-900">
        {children}
        <CartDrawer />
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
