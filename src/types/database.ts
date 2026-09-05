export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderType = "pickup" | "delivery";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type InvoiceStatus = "pending" | "completed" | "failed";

export type FulfillmentType = OrderType;
export type PaymentMethod = "card" | "cash" | "online";

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string;
          phone: string;
          latitude: number;
          longitude: number;
          delivery_radius_km: number;
          is_active: boolean;
          opening_time: string;
          closing_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          address: string;
          phone: string;
          latitude: number;
          longitude: number;
          delivery_radius_km?: number;
          is_active?: boolean;
          opening_time?: string;
          closing_time?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          address?: string;
          phone?: string;
          latitude?: number;
          longitude?: number;
          delivery_radius_km?: number;
          is_active?: boolean;
          opening_time?: string;
          closing_time?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          base_price: number;
          image_url: string | null;
          pieces_count: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          base_price: number;
          image_url?: string | null;
          pieces_count?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          base_price?: number;
          image_url?: string | null;
          pieces_count?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      modifier_groups: {
        Row: {
          id: string;
          product_id: string | null;
          name: string;
          min_selection: number;
          max_selection: number;
          is_required: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          name: string;
          min_selection?: number;
          max_selection?: number;
          is_required?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          name?: string;
          min_selection?: number;
          max_selection?: number;
          is_required?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modifier_groups_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      modifier_options: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          extra_price: number;
          heat_level: number;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          extra_price?: number;
          heat_level?: number;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          extra_price?: number;
          heat_level?: number;
          is_available?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "modifier_options_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "modifier_groups";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          branch_id: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          order_type: OrderType;
          delivery_address: Json | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          status: OrderStatus;
          payment_status: PaymentStatus;
          payment_method: string;
          invoice_status: InvoiceStatus;
          invoice_uuid: string | null;
          invoice_rfc: string | null;
          invoice_xml_url: string | null;
          invoice_pdf_url: string | null;
          invoiced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          order_number?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          order_type?: OrderType;
          delivery_address?: Json | null;
          subtotal: number;
          delivery_fee?: number;
          total: number;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: string;
          invoice_status?: InvoiceStatus;
          invoice_uuid?: string | null;
          invoice_rfc?: string | null;
          invoice_xml_url?: string | null;
          invoice_pdf_url?: string | null;
          invoiced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_id?: string;
          order_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          order_type?: OrderType;
          delivery_address?: Json | null;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: string;
          invoice_status?: InvoiceStatus;
          invoice_uuid?: string | null;
          invoice_rfc?: string | null;
          invoice_xml_url?: string | null;
          invoice_pdf_url?: string | null;
          invoiced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey";
            columns: ["branch_id"];
            referencedRelation: "branches";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_item_modifiers: {
        Row: {
          id: string;
          order_item_id: string;
          modifier_option_id: string;
          modifier_name: string;
          extra_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          modifier_option_id: string;
          modifier_name: string;
          extra_price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          modifier_option_id?: string;
          modifier_name?: string;
          extra_price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_item_modifiers_modifier_option_id_fkey";
            columns: ["modifier_option_id"];
            referencedRelation: "modifier_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_item_modifiers_order_item_id_fkey";
            columns: ["order_item_id"];
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      order_type: OrderType;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
    };
  };
}

// Convenience alias types for application queries
export type BranchRow = Database["public"]["Tables"]["branches"]["Row"];
export type BranchInsert = Database["public"]["Tables"]["branches"]["Insert"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ModifierGroupRow = Database["public"]["Tables"]["modifier_groups"]["Row"];
export type ModifierOptionRow = Database["public"]["Tables"]["modifier_options"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
export type OrderItemModifierRow = Database["public"]["Tables"]["order_item_modifiers"]["Row"];
export type OrderItemModifierInsert = Database["public"]["Tables"]["order_item_modifiers"]["Insert"];
