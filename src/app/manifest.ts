import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LOCO ROOSTER | Monchos de Verdad",
    short_name: "Loco Rooster",
    description:
      "Disfruta de las alitas más atrevidas, hamburguesas bestiales, boneless jugosos y combos para compartir de Loco Rooster.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#FF3823",
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
        description: "Accede directo al catálogo de monchos y combos",
      },
      {
        name: "Mi Bolsa",
        url: "/checkout",
        description: "Revisa tu pedido actual",
      },
    ],
  };
}
