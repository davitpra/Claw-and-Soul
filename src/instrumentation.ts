import { setDefaultResultOrder } from "node:dns";

// En WSL2 (y algunos entornos) la conectividad IPv6 está rota: Shopify resuelve
// a una dirección IPv6 que hace black-hole, y el fetch de undici se cuelga hasta
// el timeout de 10s (UND_ERR_CONNECT_TIMEOUT). Forzar IPv4 primero evita el
// intento fallido. Solo aplica al runtime de Node (no al edge).
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    setDefaultResultOrder("ipv4first");
  }
}
