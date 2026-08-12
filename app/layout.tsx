import type { Metadata } from "next";
import { Cinzel, Crimson_Pro, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Cinzel({ variable: "--font-display", subsets: ["latin"] });
const body = Crimson_Pro({ variable: "--font-body", subsets: ["latin"] });
const utility = IBM_Plex_Mono({ variable: "--font-utility", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Emberfall — Elemental Knight",
  description: "Rebuild a fallen town and master elemental reactions in a dark fantasy deck-building roguelike.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} ${utility.variable}`}>{children}</body></html>;
}
