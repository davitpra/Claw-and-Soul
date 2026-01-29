# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Building & Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Overview

This is a Next.js 16.1.1 e-commerce frontend for "Claw & Soul", a pet art personalization platform integrated with Shopify. The codebase follows Feature-Sliced Design (FSD) architectural principles.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Icons**: Lucide React, Material Symbols
- **Fonts**: Epilogue (headings), Lato (body)
- **Backend Integration**: Shopify Storefront API via GraphQL

### Folder Structure (FSD Pattern)

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/shopify/proxy/  # Proxy endpoint for client-side Shopify requests
│   ├── cart/               # Shopping cart page
│   ├── contact/            # Contact page
│   ├── gallery/            # Customer gallery
│   ├── ia-generator/       # AI art generation workflow
│   ├── product/[handle]/   # Dynamic product detail pages
│   ├── shop/               # Shop page
│   └── user/               # User dashboard (orders, generations, profile)
├── components/             # Shared components (Navbar, Footer, home sections)
├── context/                # React Context providers
│   └── CartContext.tsx     # Global cart state (localStorage-persisted)
├── entities/               # Business entities (FSD layer)
│   ├── art-style/          # Art style data models
│   ├── pet-product/        # Product data models
│   └── product/            # Product UI components (Gallery, Info, Selector)
├── features/               # Feature-specific components (FSD layer)
│   └── add-to-cart/        # Add to cart functionality
├── hooks/                  # Custom React hooks
│   └── useCart.ts          # Hook for accessing CartContext
├── lib/                    # External library integrations
│   └── shopify/            # Shopify Storefront API integration
│       ├── client.ts       # GraphQL fetch wrapper with proxy support
│       ├── types.ts        # TypeScript types for Shopify entities
│       ├── actions/        # Server actions (products, collections, cart, metaobjects)
│       └── queries/        # GraphQL query definitions
├── shared/                 # Shared UI components (FSD layer)
│   └── ui/                 # Reusable UI elements (Breadcrumbs)
└── widgets/                # Composite UI blocks (FSD layer)
    ├── ia-generator/       # Multi-step AI generation wizard (IAStep1-3, IAHeader)
    ├── product-details/    # Product details section
    ├── product-essence/    # Product essence/description
    └── product-faq/        # Product FAQ section
```

## Shopify Integration

The app integrates with Shopify through a dual-mode GraphQL client:

### Client-Side Requests
- All client-side requests route through `/api/shopify/proxy` (src/app/api/shopify/proxy/route.ts)
- This prevents exposing Shopify credentials in the browser

### Server-Side Requests
- Direct GraphQL calls to Shopify Storefront API
- Requires environment variables:
  - `SHOPIFY_STORE_DOMAIN` - Your Shopify store domain
  - `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Storefront API access token

### Shopify Module Structure
- **actions/**: Server-side data fetching functions (products, collections, cart, metaobjects)
- **queries/**: GraphQL query strings
- **client.ts**: Unified fetch function that handles both client/server contexts
- **types.ts**: TypeScript interfaces for Shopify entities

## State Management

### Authentication System
- **Security**: httpOnly cookies for JWT tokens (protected against XSS)
- **Token Lifetimes**:
  - Access Token: 15 minutes (stored in httpOnly cookie)
  - Refresh Token: 7 days (stored in httpOnly cookie)
- **Auto-Refresh**: Tokens automatically refresh at 13 minutes (2 min before expiry)
- **Context**: `AuthContext` manages auth state and user info
- **Protected Routes**: Use `useAuth()` hook to check authentication

#### Making Authenticated API Calls
```typescript
// Recommended: Use useAuthFetch hook (handles auto-refresh)
import { useAuthFetch } from '@/hooks/useAuthFetch';

const { get, post, put, delete } = useAuthFetch();
const data = await get('/users/profile');

// Alternative: Use fetchWithRefresh directly
import { fetchJSON } from '@/lib/auth/fetch-with-refresh';
const data = await fetchJSON('/api/endpoint');
```

### Cart System
- Global cart state managed via `CartContext` (src/context/CartContext.tsx)
- Persisted to `localStorage` with key `claw_soul_cart`
- Cart items include: variantId, name, size, style, color, price, quantity, img
- Access cart via `useCart()` hook from `src/hooks/useCart.ts`

### Cart Operations
```typescript
const { items, addToCart, updateQuantity, removeItem, clearCart, subtotal, cartCount } = useCart();
```

## Image Configuration

Remote image patterns configured in `next.config.ts`:
- `cdn.shopify.com/**` - Shopify product images
- `fal.media/**` - AI-generated art images

## Path Aliases

TypeScript path alias configured: `@/*` maps to `./src/*`

## Routing Structure

- `/` - Homepage with hero, featured products, reviews, gallery
- `/shop` - Product listing page
- `/product/[handle]` - Dynamic product detail pages
- `/cart` - Shopping cart
- `/ia-generator` - AI art generation wizard
- `/gallery` - Customer art gallery
- `/contact` - Contact page
- `/user/*` - User dashboard (profile, orders, generations)

## Design System

- Custom Tailwind configuration with brand colors
- Font variables: `--font-epilogue` (headings), `--font-lato` (body)
- Material Symbols Outlined icon font loaded globally
- Light/dark mode support via Tailwind CSS classes
