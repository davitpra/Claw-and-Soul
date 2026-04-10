"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { shopifyFetch, GRAPHQL_QUERIES } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const lines = items
        .map((item) => ({
          merchandiseId: item.variantId || "",
          quantity: item.quantity,
          attributes: [
            { key: "Style", value: item.style || "Default" },
            { key: "Size", value: item.size || "Default" },
            ...(item.generationId
              ? [{ key: "generation_id", value: item.generationId }]
              : []),
            ...(item.imageUrl
              ? [{ key: "image_url", value: item.imageUrl }]
              : []),
          ],
        }))
        .filter((line) => line.merchandiseId !== "");

      if (lines.length === 0) {
        alert(
          "To test checkout, you need real Shopify Product Variant IDs. Please add products to your Shopify store and update the items with their Variant IDs."
        );
        setIsCheckingOut(false);
        return;
      }

      const response = await shopifyFetch<{
        cartCreate: { cart: { checkoutUrl: string }; userErrors: any[] };
      }>({
        query: GRAPHQL_QUERIES.CREATE_CART,
        variables: {
          input: {
            lines: lines,
          },
        },
      });

      const { cart, userErrors } = response.data.cartCreate;

      if (userErrors && userErrors.length > 0) {
        console.error("Shopify checkout errors:", userErrors);
        alert(`Checkout error: ${userErrors[0].message}`);
      } else if (cart?.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("An error occurred during checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-10 lg:px-40 py-10 font-body">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="mb-8">
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-dark/60 hover:text-primary transition-colors"
              href="/shop"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Continue Shopping
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-10 font-display tracking-tight">
            Your Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="w-full p-6 rounded-[2rem] border border-slate-dark/5 bg-white">
                <div className="flex flex-col w-full">
                  <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-slate-dark/10 text-[11px] font-black text-slate-dark/40 uppercase tracking-widest">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-3 text-center">Quantity</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>

                  {items.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-slate-dark/50 font-bold mb-4">
                        Your cart is empty
                      </p>
                      <Link
                        href="/shop"
                        className="text-primary font-black hover:underline"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center py-8 border-b border-slate-dark/10 last:border-none relative group"
                      >
                        <div className="col-span-1 md:col-span-6 flex gap-6">
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-white shrink-0 shadow-sm border border-slate-dark/5">
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col justify-center gap-1">
                            <h3 className="font-black text-lg text-slate-dark leading-tight">
                              {item.name}
                            </h3>
                            {item.size && (
                              <p className="text-sm text-slate-dark/60 font-medium">
                                Size: {item.size}
                              </p>
                            )}
                            {item.style && (
                              <p className="text-sm text-slate-dark/60 font-medium">
                                Style: {item.style}
                              </p>
                            )}
                            {item.color && (
                              <p className="text-sm text-slate-dark/60 font-medium">
                                Color: {item.color}
                              </p>
                            )}
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-[11px] text-red-500 font-black uppercase tracking-wider hover:opacity-70 mt-3 text-left w-fit flex items-center gap-1 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                delete
                              </span>
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center">
                          <span className="md:hidden text-[11px] font-black text-slate-dark/40 uppercase tracking-widest">
                            Quantity
                          </span>
                          <div className="flex items-center rounded-full border border-slate-dark/10 bg-white">
                            <button
                              onClick={() => updateQuantity(item.variantId, -1)}
                              className="size-8 md:size-10 flex items-center justify-center text-slate-dark/60 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                remove
                              </span>
                            </button>
                            <input
                              className="w-8 md:w-12 text-center bg-transparent border-none text-slate-dark font-black p-0 focus:ring-0 text-sm md:text-base"
                              type="number"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              onClick={() => updateQuantity(item.variantId, 1)}
                              className="size-8 md:size-10 flex items-center justify-center text-slate-dark/60 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                add
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end">
                          <span className="md:hidden text-[11px] font-black text-slate-dark/40 uppercase tracking-widest">
                            Total
                          </span>
                          <span className="text-lg font-black text-slate-dark">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-dark/5 border border-slate-dark/5 sticky top-28">
                <h3 className="text-xl font-black text-slate-dark mb-8 font-display uppercase tracking-tight">
                  Order Summary
                </h3>
                <div className="flex flex-col gap-5 mb-8">
                  <div className="flex items-center justify-between text-slate-dark/70 font-medium">
                    <span>Subtotal</span>
                    <span className="font-black text-slate-dark">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-dark/70 font-medium">
                    <span>Shipping estimate</span>
                    <span className="text-primary font-black uppercase tracking-wider text-sm">
                      Free
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-dark/70 font-medium">
                    <span>Tax estimate</span>
                    <span className="font-black text-slate-dark">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="h-px w-full bg-slate-dark/10 mb-8"></div>
                <div className="flex items-center justify-between mb-10">
                  <span className="text-lg font-black text-slate-dark uppercase tracking-tight">
                    Order Total
                  </span>
                  <span className="text-3xl font-black text-slate-dark tracking-tighter">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isCheckingOut}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isCheckingOut ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Proceed to Checkout
                      <span className="material-symbols-outlined font-bold">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-dark/30 uppercase tracking-widest text-center">
                  <span className="material-symbols-outlined text-[14px]">
                    lock
                  </span>
                  Secure 256-bit SSL Checkout
                </div>
              </div>

              {/* Promo Code or similar */}
              <div className="bg-cream rounded-2xl p-6 border border-slate-dark/5">
                <p className="text-sm font-bold text-slate-dark mb-3">
                  Have a promo code?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 rounded-xl border border-slate-dark/10 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-dark/20"
                  />
                  <button className="bg-slate-dark text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-sells */}
          <div className="mt-24 pt-16 border-t border-slate-dark/5">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-slate-dark tracking-tight font-display">
                You Might Also Like
              </h3>
              <Link
                href="/shop"
                className="text-primary font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  name: "Pet Face Pillows",
                  price: "From $32.00",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwUyvhwuagm8xBlUV4CqNbw8qtyWM6R4_jByNEMvf0Jz4KsSZil9bEcoq87botBqpSqdQbP_KRX5RaSVqqVs7Al7C7S8l04u3LtPiDbFAJPB702jUwHduP6FhCXR2_a4KjKoeQ7057Vx5ufDzRVZbAUPjE98ewqmw1oh5r0Dpdiuub6Zfj3MEiC9mdSpXByS-56YzOxjaFWexjl8bqjHQUrlqYo9wi6bHb--6glEDhdAfUxW2BudJktWL4hJZigSDvFwPX-l15A3oB",
                },
                {
                  name: "Animated Notebook",
                  price: "$18.50",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiuF-MhhUcYZ7yC02X2Pho-qkpec9xuUlAuXNJXiOo7hSAozSgxZdPctjsWmw_QwLxA-oIRXnsaCRdE07GDwqDT5T1AmNG_ubh9ZpHEOunJYShQ1nD_hkrpM8OKX8tFjWz12Vn4z4ghQuzFveNNY5vVSlhsxnZB1BiID_dXVpaVJyNb7yO65XnlaYiDOQcXIyTjfogF8gI1tgw0qewKZzQhKY4Vq-G9xNvTgui-GiZhdwwpDJQDE_vnPAKGA1lnVZalhaDIFPfH5ox",
                },
                {
                  name: "Royal Pet Portrait",
                  price: "From $49.00",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUAokx1WgOK5C5WiVKh_q4fgFXTunDrfB9cbnqf8Yua9UREfDL6X4h2EuTh8b1Nl-eiHDLhqlxeddahfKflQeI9CHPX7PCu7mhEAGjgaHzE9gqkj14V5ApM2Q3CMcP7MKjvCMtPA9f6h4yBpH1bNj03S4gfmKZC5u-v8lBRMcfE2h9qfIVKbH82q1ylTjHbGryH51-hbPhYDUFBOb5PI7zstdEj2xO1HIdK1eWXuDRIOC8bfMsB0tUnnmIrgfm-0HCYI_1dkiECnYi",
                },
                {
                  name: "Gift Packaging",
                  price: "$5.00",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAchR4AljnoZmc_XvMxBOdIhNi0fmQFeKSBHmzt87ftzq4jw6F0Y3KS0gvLxj8OyPX_Jj11FrseGk3WF3o-uDyWwDaMaEdckQKsK0kJm1LFTl9mDM8Xz76LQsMCD5V-MmsJ21Ic8CTlfIfzHchv--A4FVC--MIJAw6IfhYzIQGUFcwFF7V7cLj-bodDgLDiU2ve7iUGb5eK-R5RwFnRzGdAKv_3bXXmHUiMEUue-5SEF2iRw2kQojESjqI9o1zy4m40sMOFK0VMgFT1",
                },
              ].map((rec, i) => (
                <div
                  key={i}
                  className="group cursor-pointer flex flex-col gap-4"
                >
                  <div className="aspect-square w-full rounded-[2rem] overflow-hidden bg-white shadow-sm relative border border-slate-dark/5">
                    <img
                      src={rec.img}
                      alt={rec.name}
                      className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <button className="absolute bottom-4 right-4 size-10 bg-white rounded-full flex items-center justify-center text-slate-dark shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0">
                      <span className="material-symbols-outlined font-bold">
                        add
                      </span>
                    </button>
                  </div>
                  <div className="flex flex-col px-1">
                    <h4 className="font-black text-slate-dark text-base leading-tight group-hover:text-primary transition-colors">
                      {rec.name}
                    </h4>
                    <span className="text-sm text-slate-dark/50 font-bold mt-1 uppercase tracking-widest text-[11px]">
                      {rec.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
