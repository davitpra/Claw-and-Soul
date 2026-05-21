# Admin — Shopify Polaris (v13)

Patrones y snippets extraídos de los archivos commiteados en `src/app/admin/**`. Versión de Polaris: `^13.9.5` (`@shopify/polaris-icons@^9.3.1`).

---

## Setup y provider

`next.config.ts` requiere:
```ts
transpilePackages: ["@shopify/polaris"],
```

El provider (`src/app/admin/PolarisProvider.tsx:1-14`) envuelve **todo** el layout admin (sidebar + main):

```tsx
"use client";

import "@shopify/polaris/build/esm/styles.css";
import "./polaris-overrides.css";
import { AppProvider } from "@shopify/polaris";
import esTranslations from "@shopify/polaris/locales/es.json";

export default function PolarisProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider i18n={esTranslations}>{children}</AppProvider>;
}
```

`src/app/admin/layout.tsx` lo envuelve así (sidebar dentro del provider, no fuera):
```tsx
return (
  <PolarisProvider>
    <div className="flex min-h-screen w-full bg-[#f4f6f8] font-body">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  </PolarisProvider>
);
```

> **Crítico**: si `AdminSidebar` usa `<Avatar>` o `<Icon>` de Polaris y está fuera del `<AppProvider>`, lanza "No i18n was provided". El provider debe envolver el sidebar también.

---

## Override teal de marca

`src/app/admin/polaris-overrides.css` mapea los tokens de Polaris al teal `#448da6`:

```css
:root, .Polaris-Page, [class*="Polaris-"] {
  --p-color-bg-fill-brand: #448da6;
  --p-color-bg-fill-brand-hover: #367a8f;
  --p-color-bg-fill-brand-active: #2d6a7d;
  --p-color-text-brand-on-bg-fill: #ffffff;
  --p-color-border-brand: #448da6;
  --p-color-icon-brand: #448da6;
  --p-color-text-link: #448da6;
  --p-color-text-link-hover: #367a8f;
  --p-color-text-interactive: #448da6;
}
```

Los botones `variant="primary"`, links y badges activos heredan el teal automáticamente. **No hardcodear `#448da6` en JSX Polaris.**

---

## Sidebar

`src/widgets/admin-sidebar/AdminSidebar.tsx` es un componente **custom** (no usa `<Navigation>` de Polaris). Sin embargo usa `<Avatar>` e `<Icon>` de Polaris y los tokens CSS de Polaris para colores (`var(--p-color-bg-fill-brand)` para el ítem activo).

Imports del sidebar:
```tsx
import { Avatar, Icon } from "@shopify/polaris";
import { HomeIcon, TeamIcon, OrderIcon, PaintBrushFlatIcon, LayoutColumns3Icon, InventoryIcon } from "@shopify/polaris-icons";
```

---

## Tabla de mapeo completa

| Necesidad | Componente Polaris | Notas |
|---|---|---|
| Header de página | `<Page title subtitle primaryAction titleMetadata>` | Root de toda página admin |
| Card contenedor | `<Card>` | Con `padding="0"` para tablas flush |
| Tabla de datos | `<IndexTable resourceName itemCount headings selectable={false}>` | Ver nota sobre headings abajo |
| Fila de tabla | `<IndexTable.Row id position tone?>` | `tone="subdued"` para inactivos |
| Celda | `<IndexTable.Cell>` | |
| Texto | `<Text variant as tone fontWeight>` | variants: `heading2xl`, `headingMd`, `headingSm`, `bodyMd`, `bodySm` |
| Badge de estado | `<Badge tone="success|warning|critical|info|enabled">` | children debe ser `string`, no array |
| Botón acción inline | `<Button variant="plain" size="slim" tone? loading? onClick>` | |
| Imagen en tabla | `<Thumbnail source alt size="small|medium|extraSmall">` | En vez de `next/image` o `<img>` |
| Avatar de usuario | `<Avatar size="sm|md|xl" initials name>` | |
| Icono | `<Icon source={SomeIcon} tone?>` | `source` espera componente de `@shopify/polaris-icons` |
| Layout 2-col | `<Layout><Layout.Section>` + `<Layout.Section variant="oneThird">` | |
| Stack horizontal | `<InlineStack gap align blockAlign>` | gap en escala Polaris: "100"–"800" |
| Stack vertical | `<BlockStack gap inlineAlign>` | No tiene prop `inlineSize` |
| Box con borde | `<Box padding borderColor borderBlockEndWidth="025">` | |
| Filtros + búsqueda | `<Filters queryValue filters appliedFilters onQueryChange onClearAll>` | |
| Filtro desplegable | `<ChoiceList title titleHidden choices selected onChange>` | |
| Paginación | `<Pagination hasPrevious hasNext onPrevious onNext label?>` | |
| Tabs | `<Tabs tabs selected onChange>` + condicional en JSX para panel activo | |
| Campo texto | `<TextField label value onChange autoComplete="off">` | `onChange` recibe `(value: string) => void`, no evento |
| Divisor | `<Divider>` | |
| Estado vacío | `<EmptyState heading image="">` | |
| Spinner | `<Spinner size="small">` | |
| Banner | `<Banner tone onDismiss>` | `tone`: `"critical"|"warning"|"success"|"info"` |

---

## Snippets canónicos

### Lista con IndexTable

Referencia: `src/app/admin/formats/page.tsx:75-137`

```tsx
<Card padding="0">
  <IndexTable
    resourceName={{ singular: "formato", plural: "formatos" }}
    itemCount={formats.length}
    headings={[{ title: "Nombre" }, { title: "Estado" }, { title: "Acción" }]}
    selectable={false}
  >
    {formats.map((f, index) => (
      <IndexTable.Row
        id={f.id}
        key={f.id}
        position={index}
        tone={f.isActive ? undefined : "subdued"}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {f.displayName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={f.isActive ? "success" : "enabled"}>
            {f.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            variant="plain"
            tone={f.isActive ? "critical" : undefined}
            size="slim"
            loading={toggling === f.id}
            onClick={() => handleToggle(f)}
          >
            {f.isActive ? "Desactivar" : "Activar"}
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ))}
  </IndexTable>
</Card>
```

### Filtros con ChoiceList

Referencia: `src/app/admin/orders/page.tsx:132-166`

```tsx
const filters = [
  {
    key: "status",
    label: "Estado",
    filter: (
      <ChoiceList
        title="Estado de producción"
        titleHidden
        choices={[{ label: "Pagado", value: "paid" }, { label: "Enviado", value: "shipped" }]}
        selected={status}
        onChange={(v) => { setStatus(v); setPage(1); }}
      />
    ),
    shortcut: true,
  },
];

// En JSX:
<Box paddingInline="400" paddingBlock="300" borderBlockEndWidth="025" borderColor="border">
  <Filters
    queryValue={q}
    filters={filters}
    appliedFilters={appliedFilters}
    onQueryChange={(v) => { setQ(v); setPage(1); }}
    onQueryClear={() => { setQ(""); setPage(1); }}
    onClearAll={() => { setQ(""); setStatus([]); setPage(1); }}
    queryPlaceholder="Buscar…"
  />
</Box>
```

### KPI tiles + recharts en Card

Referencia: `src/app/admin/page.tsx:58-94` (StatTile), `src/app/admin/page.tsx:145-180` (grid)

```tsx
// KPI tile custom (usa estilos inline mínimos + Text de Polaris)
function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: "#f6f6f7", borderRadius: 8, padding: 16, border: "1px solid #e3e3e3" }}>
      <Text variant="heading2xl" as="p">{String(value)}</Text>
      <Text variant="bodySm" as="span" tone="subdued">{label}</Text>
    </div>
  );
}

// Grid de tiles dentro de Card
<Card>
  <BlockStack gap="300">
    <Text variant="headingSm" as="h2">Totales</Text>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
      <StatTile label="Usuarios" value={stats.totals.users} />
      {/* … */}
    </div>
  </BlockStack>
</Card>

// recharts dentro de Card (sin Tailwind, solo ResponsiveContainer)
<Card>
  <BlockStack gap="300">
    <Text variant="headingMd" as="h2">Generaciones — últimos 30 días</Text>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        {/* … */}
        <Line stroke="#448da6" strokeWidth={2} dataKey="count" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </BlockStack>
</Card>
```

### Layout 2 columnas (detalle)

Referencia: `src/app/admin/page.tsx:182-282`

```tsx
<Layout>
  <Layout.Section>
    {/* columna principal, ocupa ~2/3 */}
    <Card> … </Card>
  </Layout.Section>
  <Layout.Section variant="oneThird">
    {/* columna lateral, ocupa ~1/3 */}
    <Card> … </Card>
  </Layout.Section>
</Layout>
```

### Paginación con contador

Referencia: `src/app/admin/orders/page.tsx:348-368`

```tsx
{result && result.meta.totalPages > 1 && (
  <Box padding="400" borderBlockStartWidth="025" borderColor="border">
    <InlineStack align="space-between">
      <Text as="span" tone="subdued" variant="bodySm">
        {result.meta.total} items · Página {page} de {result.meta.totalPages}
      </Text>
      <Pagination
        hasPrevious={page > 1}
        hasNext={page < result.meta.totalPages}
        onPrevious={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </InlineStack>
  </Box>
)}
```

---

## Reglas específicas de Polaris (trampas conocidas)

### headings de IndexTable — siempre inline

```tsx
// CORRECTO — tuple inline, TypeScript infiere NonEmptyArray<IndexTableHeading>
headings={[{ title: "Nombre" }, { title: "Estado" }, { title: "Acción" }]}

// INCORRECTO — variable tipada como array plano; TypeScript lanza error de tipos
const cols: { title: string }[] = [{ title: "Nombre" }, …];
headings={cols}  // ← Error: Type '{ title: string }[]' is not assignable to 'NonEmptyArray<IndexTableHeading>'
```

### BlockStack no tiene prop inlineSize

```tsx
// INCORRECTO
<BlockStack inlineSize="fill">  // ← prop no existe

// CORRECTO — usar Box o inlineAlign según el caso
<BlockStack inlineAlign="stretch">
```

### Badge espera string, no string[]

```tsx
// CORRECTO
<Badge tone="success">{`${count} en total`}</Badge>

// INCORRECTO
<Badge tone="success">{[count, "en total"]}</Badge>  // ← Error de tipos
```

### TextField onChange recibe string, no evento

```tsx
// CORRECTO (Polaris)
<TextField value={val} onChange={(newVal: string) => setVal(newVal)} label="…" autoComplete="off" />

// INCORRECTO (patrón HTML estándar)
<TextField onChange={(e) => setVal(e.target.value)} />  // ← e no existe en Polaris
```

### No mezclar Tailwind en layout interno Polaris

```tsx
// CORRECTO
<Card>
  <BlockStack gap="300">
    <Text variant="headingSm" as="h2">Título</Text>
  </BlockStack>
</Card>

// INCORRECTO
<Card>
  <div className="flex flex-col gap-4 rounded-xl bg-cream p-4">  {/* ← no mezclar */}
    …
  </div>
</Card>
```

### No añadir AppProvider dentro del subtree admin

El provider ya está en `src/app/admin/PolarisProvider.tsx`. Añadir otro `<AppProvider>` anidado rompe el contexto i18n.
