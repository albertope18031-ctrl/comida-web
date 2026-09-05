"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useOrderContextStore } from "@/store/order-context-store";
import { generateWhatsAppOrderUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

interface WhatsAppOrderButtonProps {
  className?: string;
  label?: string;
  customerDetails?: {
    name?: string;
    phone?: string;
    deliveryAddress?: string;
    notes?: string;
  };
  variant?: "full" | "compact" | "subtle";
  onClick?: () => void;
}

export function WhatsAppOrderButton({
  className = "",
  label = "Completar orden vía WhatsApp",
  customerDetails,
  variant = "full",
  onClick,
}: WhatsAppOrderButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { items, getSubtotal } = useCartStore();
  const { orderType, selectedBranch, deliveryAddress } = useOrderContextStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`h-11 w-full rounded-xl bg-neutral-200/50 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const subtotal = getSubtotal();
  const deliveryFee = orderType === "delivery" && subtotal > 0 ? 45 : 0;
  const grandTotal = subtotal + deliveryFee;
  const isDisabled = items.length === 0;

  // Derive delivery address text from order context if not passed explicitly
  const resolvedAddress =
    customerDetails?.deliveryAddress ||
    (orderType === "delivery" && deliveryAddress
      ? `${deliveryAddress.street} ${deliveryAddress.number}, ${deliveryAddress.colonia}, CP ${deliveryAddress.zipCode}`
      : undefined);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    const url = generateWhatsAppOrderUrl({
      items,
      subtotal,
      deliveryFee,
      grandTotal,
      orderType,
      branchName: selectedBranch.name,
      customerDetails: {
        name: customerDetails?.name,
        phone: customerDetails?.phone,
        deliveryAddress: resolvedAddress,
        notes: customerDetails?.notes,
      },
    });

    onClick?.();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const whatsappIcon = (
    <svg
      className="h-5 w-5 fill-current shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.001.572 1.772.84 2.806.84 3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.823-5.769-5.823zm3.425 8.243c-.145.407-.728.775-1.02.823-.284.047-.648.077-1.042-.047-.249-.079-.575-.197-.999-.382-1.792-.782-2.955-2.614-3.044-2.734-.089-.12-1.282-1.706-1.282-3.255 0-1.549.809-2.311 1.096-2.628.287-.317.627-.396.837-.396.209 0 .419.002.6.011.192.01.449-.074.703.535.263.63 1.002 2.449 1.089 2.627.087.178.146.386.03.616-.117.23-.176.373-.35.578-.175.205-.37.458-.528.616-.176.175-.36.365-.155.717.205.352.912 1.503 1.956 2.433 1.344 1.197 2.477 1.568 2.829 1.744.352.175.557.147.763-.089.206-.236.88-1.026 1.115-1.378.235-.352.47-.294.79-.176.321.118 2.034.959 2.385 1.135.351.176.586.264.673.411.087.147.087.85-.058 1.257zM12.012 2C6.48 2 2 6.48 2 12.012c0 1.98.577 3.829 1.574 5.39L2 22l4.757-1.536A9.957 9.957 0 0012.012 22c5.533 0 10.012-4.48 10.012-10.012 0-5.533-4.48-10.012-10.012-10.012zm0 18.232c-1.637 0-3.174-.486-4.468-1.325l-.321-.208-2.823.912.927-2.753-.227-.336A8.204 8.204 0 013.78 12.012c0-4.539 3.693-8.232 8.232-8.232 4.54 0 8.232 3.693 8.232 8.232 0 4.54-3.692 8.232-8.232 8.232z" />
    </svg>
  );

  if (variant === "subtle") {
    return (
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleWhatsAppClick}
        className={`inline-flex items-center gap-2 text-xs font-bold text-[#128C7E] hover:text-[#075E54] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className="p-1 rounded-full bg-[#25D366]/15 text-[#128C7E]">
          {whatsappIcon}
        </span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      disabled={isDisabled}
      onClick={handleWhatsAppClick}
      className={`w-full h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
    >
      {whatsappIcon}
      <span className="truncate">{label}</span>
    </Button>
  );
}
