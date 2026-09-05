import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Comida Wings & Boneless",
    short_name: "Comida App",
    description:
      "Pide tus alitas, boneless y hamburguesas favoritas a domicilio o para llevar en minutos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#005A36",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Ver Menú",
        url: "/menu",
        description: "Accede directo al catálogo de alitas y promociones",
      },
      {
        name: "Mi Bolsa",
        url: "/checkout",
        description: "Revisa tu pedido actual",
      },
    ],
  };
}
