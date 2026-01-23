import type { Metadata } from "next";
import { Epilogue, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Claw & Soul",
  description: "Capture your pet's soul in art with our personalized gifts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${epilogue.variable} ${lato.variable} antialiased bg-background-light dark:bg-background-dark text-text-main font-body`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
