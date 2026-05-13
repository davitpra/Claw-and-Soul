# Patrones de Componentes — Claw & Soul

Snippets extraídos de los componentes canónicos del repo. Úsalos como base y adáptalos al contexto.

---

## Botón Primario (CTA)

Referencia: `src/components/home/Hero.tsx:22-26`, `src/components/Navbar.tsx:144-149`

```tsx
// CTA grande (hero, sección principal)
<Link
  href="/shop"
  className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary-dark"
>
  Ver Productos
</Link>

// Botón estándar (navbar, formularios)
<button className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary-dark text-white transition-all shadow-sm text-sm font-semibold hover:shadow-md hover:scale-105">
  Sign Up
</button>

// Botón en card (sin scale, solo color)
<Link
  href={`/product/${handle}`}
  className="mt-auto w-full text-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
>
  Ver Detalles
</Link>
```

---

## Botón Secundario

Referencia: `src/components/Navbar.tsx:138-143`, `src/components/home/Hero.tsx:28-33`

```tsx
// Con borde gris (navbar, modales)
<Link
  href="/login"
  className="flex items-center justify-center rounded-xl h-10 px-5 bg-white hover:bg-gray-50 text-text-main border border-[#E0DED9] transition-all shadow-sm text-sm font-medium hover:shadow-md"
>
  Login
</Link>

// Con borde de marca (hero secondary CTA)
<Link
  href="/gallery"
  className="flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-dark border border-slate-dark/10 transition-colors hover:bg-slate-50"
>
  Ver Galería
</Link>
```

---

## Botón sobre fondo oscuro (Footer)

Referencia: `src/components/Footer.tsx:19-24`

```tsx
<button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors">
  Suscribirse
</button>
```

---

## Input — Sobre fondo claro

Referencia: `src/components/Navbar.tsx:113-118`

```tsx
<div className="relative group">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <span className="material-symbols-outlined text-[18px] text-text-muted group-focus-within:text-primary transition-colors">
      search
    </span>
  </div>
  <input
    type="search"
    className="w-64 h-10 pl-10 pr-4 rounded-xl border border-[#E0DED9] bg-white/50 focus:bg-white text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
    placeholder="Buscar..."
  />
</div>

// Sin icono
<input
  className="rounded-xl border border-[#E0DED9] px-4 py-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
  type="email"
  placeholder="tu@email.com"
/>
```

---

## Input — Sobre fondo oscuro (Footer)

Referencia: `src/components/Footer.tsx:14-18`

```tsx
<input
  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
  placeholder="Ingresa tu email"
  type="email"
/>
```

---

## Card de Producto

Referencia: `src/components/home/FeaturedProducts.tsx:42-73`

```tsx
<div className="group flex flex-col gap-4">
  {/* Imagen con hover scale */}
  <Link
    href={`/product/${handle}`}
    className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
  >
    <div
      className="aspect-[4/5] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
      style={{ backgroundImage: `url('${imgUrl}')` }}
    />
  </Link>

  {/* Contenido */}
  <div className="flex flex-col gap-1 flex-1">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-slate-dark line-clamp-1">{title}</h3>
      <span className="text-base font-bold text-slate-dark">From ${price}</span>
    </div>
    <p className="text-sm text-slate-dark/60 line-clamp-2">{description}</p>
    <Link
      href={`/product/${handle}`}
      className="mt-auto w-full text-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
    >
      Ver Detalles
    </Link>
  </div>
</div>
```

---

## Card Flotante / Info Badge

Referencia: `src/components/home/Hero.tsx:77-92`

```tsx
<div className="rounded-xl bg-white p-4 shadow-xl">
  <div className="flex items-center gap-3">
    <span className="flex items-center justify-center rounded-full bg-green-100 p-2 text-green-600">
      <span className="material-symbols-outlined text-[20px]">check_circle</span>
    </span>
    <div>
      <p className="text-sm font-bold text-slate-dark">Preview Listo</p>
      <p className="text-xs text-slate-dark/60">Verlo ahora</p>
    </div>
  </div>
</div>
```

---

## Link de Navegación con Underline Animado

Referencia: `src/components/Navbar.tsx:82-100`

```tsx
<Link
  href={href}
  className={`text-sm font-medium leading-normal transition-all relative group ${
    isActive ? "text-primary" : "text-text-main hover:text-primary"
  }`}
>
  {label}
  <span
    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
      isActive ? "w-full" : "w-0 group-hover:w-full"
    }`}
  />
</Link>
```

---

## Link con Icono de Flecha (CTA Secundario)

Referencia: `src/components/home/FeaturedProducts.tsx:25-33`

```tsx
<Link
  className="flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all"
  href="/shop"
>
  Ver todos los productos
  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</Link>
```

---

## Sección de Contenido (estructura base)

Referencia: `src/components/home/Hero.tsx:5`, `src/components/home/FeaturedProducts.tsx:13`

```tsx
// Sección sobre cream (más común)
<section className="py-20 bg-cream">
  <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
    {/* contenido */}
  </div>
</section>

// Sección sobre slate dark (Footer, CTA banners)
<section className="py-16 bg-slate-dark text-white">
  <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
    {/* contenido */}
  </div>
</section>
```

---

## Header de Sección (título + acción)

Referencia: `src/components/home/FeaturedProducts.tsx:15-33`

```tsx
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
  <div>
    <h2 className="text-3xl font-black text-slate-dark md:text-4xl">Título Sección</h2>
    <p className="mt-2 text-slate-dark/70">Descripción breve de la sección.</p>
  </div>
  <Link className="flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all" href="/more">
    Ver todos
    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
  </Link>
</div>
```

---

## Icono inline con texto

```tsx
// Icono a la izquierda del texto (20px es el tamaño estándar para UI)
<a className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors" href="mailto:...">
  <span className="material-symbols-outlined text-[18px]">mail</span>
  hello@clawandsoul.com
</a>
```

---

## Grid responsivo (productos, cards)

```tsx
// 4 columnas en desktop (productos)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

// 2 columnas en desktop (hero, split)
<div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-12">

// 3 columnas (footer links)
<div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
```
