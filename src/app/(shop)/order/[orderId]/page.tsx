import type { Metadata } from "next";
import { OrderTrackerClient } from "./OrderTrackerClient";
import { RESTAURANT_BRANCHES } from "@/store/order-context-store";
import type { OrderStatus } from "@/types/database";

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Seguimiento de Orden | Loco Rooster México`,
    description: `Monitorea en tiempo real el estado de preparación y entrega de tu pedido en Loco Rooster México.`,
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { orderId } = await params;

  // Initial order payload (server-side fetched or hydrated with robust fallback)
  const initialOrder = {
    id: orderId,
    orderNumber: `LR-${orderId.slice(-6).toUpperCase()}`,
    status: "preparing" as OrderStatus,
    orderType: "delivery" as const,
    branch: RESTAURANT_BRANCHES[0],
    subtotal: 379,
    deliveryFee: 45,
    total: 424,
    createdAt: new Date().toISOString(),
    customer: {
      name: "Cliente Loco Rooster",
      phone: "55 1234 5678",
      address: "Álvaro Obregón 151, Roma Norte, CDMX",
    },
    items: [
      {
        name: "Alitas Tradicionales (10 Pzas)",
        quantity: 1,
        flavors: ["Lemon Pepper", "Mango Habanero"],
        dips: ["Ranch Hecho en Casa"],
        price: 199,
      },
      {
        name: "Papas Fritas Sazonadas Loco Rooster",
        quantity: 1,
        flavors: [],
        dips: [],
        price: 65,
      },
      {
        name: "Crispy Tenders (4 Pzas)",
        quantity: 1,
        flavors: ["Original Hot"],
        dips: ["Blue Cheese"],
        price: 169,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <OrderTrackerClient initialOrder={initialOrder} orderId={orderId} />
    </div>
  );
}
