---
name: security-check
description: Checkeo de seguridad paso a paso del frontend (Next.js 16 App Router + React 19). Usa esta skill cuando el usuario pida un checkeo/revisión/auditoría de seguridad, "security check", "security review", "revisar seguridad" o quiera saber si el frontend es seguro. Guía un análisis de código completo (exposición de secretos, XSS, proxy Shopify, proxy (middleware), tokens, open redirects) y produce un reporte por severidades SIN modificar código.
---

# Security Check — Frontend (Next.js App Router)

Auditoría de seguridad guiada del frontend de Claw & Soul. **Esta skill es de solo lectura: no edites ningún archivo.** El entregable es un reporte de hallazgos con severidades (formato al final).

## Reglas del análisis

1. **Verifica antes de reportar.** Un match de grep no es un hallazgo: lee el código alrededor y confirma que el problema es real y explotable. Reporta solo hallazgos confirmados; si algo queda dudoso, márcalo como "por confirmar" con la razón.
2. **Cada hallazgo necesita**: ubicación exacta (`archivo:línea`), escenario concreto de explotación y recomendación (sin aplicarla).
3. Ejecuta los 9 pasos en orden. Los pasos que pasen limpios también se listan en el reporte.

## Arquitectura relevante (contexto)

- Next.js 16 App Router, Feature-Sliced Design bajo `src/` (`app`, `entities`, `features`, `widgets`, `shared`, `context`, `hooks`, `lib`).
- Auth: cookies httpOnly emitidas por el backend NestJS (access 15min / refresh 7d); `AuthContext` + `useAuthFetch` con auto-refresh.
- Shopify Storefront API se consume server-side vía `src/app/api/shopify/proxy/route.ts`.
- `src/proxy.ts` protege `/user/*` y `/admin/*` decodificando el JWT **sin verificar firma** (solo UI-gating). Next 16 renombró `middleware.ts` → `proxy.ts` y `middleware()` → `proxy()`.

## Paso 1 — Exposición de secretos

- Grep de `NEXT_PUBLIC_` en todo `src/` y en configs: nada sensible puede llevar ese prefijo (todo `NEXT_PUBLIC_*` se embebe en el bundle del cliente). Tokens/keys con ese prefijo = CRÍTICO.
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` y `SHOPIFY_STORE_DOMAIN` deben usarse solo en código server-side (route handlers, Server Components sin `"use client"`). Grep del token/`process.env.SHOPIFY` y verifica en qué contexto se lee: si un archivo con `"use client"` (o importado por uno) lo referencia, Next lo dejaría en `undefined`, pero revisa que nadie lo haya "arreglado" pasándolo por props o con prefijo público.
- Grep de strings tipo token (`shpat_`, `shpss_`, `sk-`, base64 largos) hardcodeados = CRÍTICO si son reales.

## Paso 2 — Proxy Shopify

Lee `src/app/api/shopify/proxy/route.ts` completo:

- ¿Restringe qué operaciones GraphQL acepta (allowlist de queries/mutations o de nombres de operación), o reenvía cualquier query arbitraria del cliente a Shopify con el token de la tienda? Proxy abierto = ALTO (un tercero puede usar tu token para consultar toda la Storefront API, agotar rate limits o hacer mutations de carrito ajenas).
- ¿Valida origen/mismo sitio o puede llamarse desde cualquier página externa? (los route handlers de Next no aplican CORS a peticiones same-origin de un atacante con credenciales del usuario, pero un endpoint sin restricción es abusable server-to-server).
- ¿Limita tamaño/complejidad del body? ¿Devuelve errores de Shopify crudos (fuga de detalles)?

## Paso 3 — XSS

- Grep de `dangerouslySetInnerHTML` e `innerHTML`: cada uso debe sanitizar o venir de fuente confiable estática. Contenido de usuario (nombres de mascotas, descripciones, notas de pedidos mostradas en `/admin`) renderizado así = CRÍTICO.
- Contenido de Shopify (descripciones de producto en HTML) renderizado con `dangerouslySetInnerHTML`: aceptable solo si la fuente es la propia tienda; anótalo como MEDIO/BAJO según el caso.
- URLs controladas por el usuario en `href`/`src` (imágenes de mascotas, links de perfil): esquema `javascript:` o data-URLs no validadas = ALTO.
- Grep de `eval(`, `new Function(`, `document.write` = ALTO si procesan datos externos.

## Paso 4 — Frontera de seguridad del proxy

- `src/proxy.ts` decodifica el payload JWT en base64 **sin verificar la firma**: cualquiera puede fabricar una cookie con `role: 'admin'` y pasar el proxy. Esto es aceptable **solo** si es puro UI-gating.
- Verifica que ninguna página `/admin` ni ruta `/user` confíe en haber "pasado el proxy": todo dato sensible debe venir de llamadas al backend que revalidan el JWT con firma. Busca Server Components o route handlers bajo `src/app/admin/**` y `src/app/user/**` que devuelvan datos sensibles sin llamar al backend autenticado = CRÍTICO.
- Documenta en el reporte (BAJO, informativo) que el proxy es UI-gating y que la frontera real es el backend — para que nadie construya sobre la suposición contraria.

## Paso 5 — Route handlers y Server Actions

- Lista todo `src/app/api/**/route.ts` y todo archivo/función con `"use server"` (grep).
- Cada uno que haga algo sensible (leer/escribir datos de usuario, llamar APIs con secretos, generar PDFs con datos de pedidos) debe reautenticar: reenviar las cookies al backend y respetar su respuesta 401/403, no decidir con datos del cliente.
- Handler que acepta `userId`/`orderId` del body y opera sin verificar sesión = CRÍTICO (IDOR desde el frontend).

## Paso 6 — Manejo de tokens

- Los tokens viven en cookies httpOnly gestionadas por el backend. Grep de `localStorage`/`sessionStorage`: ningún resultado debe guardar `accessToken`, `refreshToken` ni credenciales. Token en localStorage = ALTO (robable por cualquier XSS).
- Revisa `src/context/AuthContext*` y `useAuthFetch`: ¿el token se mantiene solo en cookies (fetch con `credentials: 'include'`) o se copia a estado/JS accesible? ¿Se loguea el token en consola?
- Carrito en localStorage (`CartContext`) es aceptable: solo verifica que no guarde PII ni precios que el backend no revalide al crear la orden (manipulación de precios = ALTO si el backend confía en ellos — anótalo como "por confirmar" hacia el backend).

## Paso 7 — Open redirects

- Grep de `redirect`, `returnUrl`, `callbackUrl`, `next=` en login y `src/proxy.ts`.
- Todo redirect post-login construido desde query params debe validarse: solo rutas relativas internas (`startsWith('/')` y no `//` ni `https:`). Redirect a URL absoluta controlada por el atacante = MEDIO (phishing con dominio legítimo).

## Paso 8 — Datos sensibles en el cliente

- Grep de `console.log` en `src/`: ¿se loguean respuestas de API con PII (emails, direcciones de envío, datos de pedidos)? = BAJO/MEDIO.
- Estado global (`context/`): ¿se guardan datos de otros usuarios o listados admin completos en contextos accesibles desde páginas no-admin?
- Páginas públicas que renderizan datos que deberían requerir sesión (galería: ¿expone generaciones privadas de otros usuarios?) = ALTO.

## Paso 9 — Enlaces y librerías

- Grep de `target="_blank"` sin `rel="noopener noreferrer"` = BAJO (reverse tabnabbing).
- `jspdf`: ¿los PDFs incrustan contenido de usuario sin escapar? (menor riesgo, pero texto controlado por usuario en PDFs de pedidos puede inyectar contenido engañoso) = BAJO.
- Scripts de terceros (`next/script`, tags en `layout.tsx`): cada dominio externo cargado debe ser conocido y necesario; script externo no reconocido = ALTO.

## Formato del reporte (entregable único)

```markdown
# Reporte de seguridad — Frontend — <fecha>

## Resumen
N críticos · N altos · N medios · N bajos

## Hallazgos

### 1. [CRÍTICO] <título corto>
- **Ubicación**: src/xxx/yyy.tsx:NN
- **Riesgo**: <escenario concreto de explotación>
- **Recomendación**: <fix sugerido, no aplicado>

### 2. [ALTO] ...

## Checkeos pasados sin hallazgos
- Paso N — <nombre>: <qué se verificó>

## Por confirmar
- <duda + qué haría falta para confirmarla (incluye lo que dependa del backend)>
```

Ordena los hallazgos de mayor a menor severidad. No apliques ningún fix: si el usuario quiere arreglar algo, que lo pida explícitamente después del reporte.
