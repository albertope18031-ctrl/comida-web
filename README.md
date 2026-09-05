# Wingstop México - Web Platform & Architecture

Plataforma de comercio electrónico y monitor de cocina (KDS) para restaurante de alitas y comida rápida, inspirada en la experiencia de usuario de **Wingstop México**.

Construida con los más altos estándares de ingeniería para producción con **Next.js 15+ (App Router, React 19, TypeScript estricto)**, **Tailwind CSS v4**, **Supabase SSR**, **Zustand** y **Shadcn UI**.

---

## 🚀 Stack Tecnológico

- **Framework**: Next.js 15.5+ (App Router, React Server Components, Server Actions).
- **Librería de UI**: React 19, Lucide React (iconos), Radix UI.
- **Estilos**: Tailwind CSS v4 con `@theme` tokens de marca (`#005A36`, `#FFC72C`, carbón, escala de picante).
- **Gestión de Estado**: Zustand con persistencia en `localStorage`.
- **Notificaciones**: Sonner (`Toaster`).
- **Backend & Auth**: Supabase con `@supabase/ssr` (lectura segura de cookies en Next.js 15).
- **Despliegue**: Optimizado para **Vercel** y CI/CD en **GitHub**.

---

## 📁 Estructura del Proyecto

```
├── supabase/
│   └── migrations/
│       └── 20260101000000_initial_schema.sql  # Esquema PostgreSQL completo con RLS y triggers
├── src/
│   ├── app/
│   │   ├── (auth)/                            # Rutas de autenticación
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (shop)/                            # Experiencia de compra pública
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                       # Landing / Hero / 11 Sabores / Destacados
│   │   │   ├── menu/page.tsx                  # Catálogo de alitas, boneless y combos
│   │   │   ├── cart/page.tsx                  # Vista detallada de carrito
│   │   │   └── checkout/page.tsx              # Checkout (domicilio / sucursal)
│   │   ├── admin/                             # Panel de administración
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                       # Dashboard con métricas y ventas
│   │   │   ├── orders/page.tsx                # Kitchen Display System (KDS) en vivo
│   │   │   └── branches/page.tsx              # Gestión de sucursales y tiempos
│   │   ├── globals.css                        # Tailwind CSS v4 y temas
│   │   └── layout.tsx                         # Root layout con Geist fonts y Sonner
│   ├── components/
│   │   ├── shop/                              # Componentes de negocio
│   │   │   ├── Navbar.tsx                     # Barra de navegación con selector de sucursal
│   │   │   ├── ProductCard.tsx                # Tarjeta de producto con preview
│   │   │   ├── CustomizerModal.tsx            # Modal selector de salsas (0-5), dips y extras
│   │   │   ├── CartDrawer.tsx                 # Carrito deslizable lateral
│   │   │   └── Footer.tsx                     # Pie de página con sucursales e índice de picante
│   │   └── ui/                                # Componentes base Shadcn / Radix
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── input.tsx
│   ├── lib/
│   │   ├── mock-data.ts                       # Catálogo con los 11 sabores oficiales y combos
│   │   ├── utils.ts                           # Utilidades cn, formatCurrency (MXN)
│   │   └── supabase/                          # Clientes Supabase SSR
│   │       ├── client.ts                      # createBrowserClient para Client Components
│   │       ├── server.ts                      # createServerClient para Server Components & Actions
│   │       └── middleware.ts                  # Refresco de sesión y protección de /admin
│   ├── middleware.ts                          # Edge Middleware de Next.js
│   ├── store/                                 # Stores reactivos de Zustand
│   │   ├── branch-store.ts                    # Sucursal activa y tipo de pedido (delivery/pickup)
│   │   └── cart-store.ts                      # Estado del carrito con persistencia local
│   └── types/
│       ├── database.ts                        # Tipos TypeScript generados para Supabase
│       └── shop.ts                            # Interfaces de negocio (sabores, combos, pedidos)
├── .env.example                               # Variables requeridas
└── package.json
```

---

## 🛠️ Puesta en Marcha

### 1. Variables de Entorno
Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```
Completa las credenciales de tu proyecto de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Base de Datos en Supabase
Ejecuta el archivo SQL en el **SQL Editor** del dashboard de Supabase:
`supabase/migrations/20260101000000_initial_schema.sql`

Este script creará:
- Tablas (`branches`, `categories`, `flavors`, `products`, `orders`, `order_items`, `profiles`).
- Tipos ENUM (`order_status`, `fulfillment_type`, `payment_method`, `user_role`).
- Políticas de Row Level Security (RLS).
- Trigger automático para la sincronización de perfiles en `auth.users`.

### 3. Desarrollo Local
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Compilación de Producción
```bash
npm run build
npm start
```
---

## 🍗 Características Principales

1. **Selector de Modalidad y Sucursal**:
   - Conmutador entre "Entrega a domicilio" y "Para llevar".
   - Selector en tiempo real de sucursales (Roma Norte, Polanco, Insurgentes Sur, Satélite) con tiempo estimado de entrega.
2. **Escala de Picante Oficial (Heat Index 0 a 5)**:
   - Lemon Pepper, Garlic Parmesan, Hawaiian, Hickory BBQ, Spicy Korean Q, Louisiana Rub, Original Hot, Mango Habanero, Atomic.
   - Distinción entre salsas líquidas y sazonadores secos (*dry rubs*).
3. **Modal de Personalización de Alitas**:
   - Selección dinámica de hasta `maxFlavorsAllowed` sabores según el tamaño del paquete.
   - Adición de aderezos artesanales (Ranch hecho en casa, Blue Cheese).
   - Complementos y bebidas en tiempo real con recálculo de precio.
4. **Bolsa de Compras Deslizable (Cart Drawer)**:
   - Desglose con tags de sabor seleccionados, cantidades y subtotales en Pesos Mexicanos (MXN).
5. **Monitor de Cocina (KDS) en Panel Administrativo**:
   - Vista de comanda tipo Kanban para cocina y freidoras (`/admin/orders`).
   - Flujo de estados: *Nuevas* → *En Cocina* → *Listo / Empaque* → *En Reparto / Entregado*.
