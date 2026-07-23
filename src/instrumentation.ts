// En WSL2 (y algunos entornos) la conectividad IPv6 está rota: Shopify resuelve
// a una dirección IPv6 que hace black-hole, y el fetch de undici se cuelga hasta
// el timeout de 10s (UND_ERR_CONNECT_TIMEOUT). Forzar IPv4 primero evita el
// intento fallido. Import dinámico dentro del guard: el archivo también se
// compila para el bundle de Edge (por el proxy), donde node:dns no existe.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
