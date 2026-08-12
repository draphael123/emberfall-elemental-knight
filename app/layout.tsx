import type { Metadata } from "next";
import { Cinzel, Crimson_Pro, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Cinzel({ variable: "--font-display", subsets: ["latin"] });
const body = Crimson_Pro({ variable: "--font-body", subsets: ["latin"] });
const utility = IBM_Plex_Mono({ variable: "--font-utility", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Emberfall - Elemental Knight",
  description: "Rebuild a fallen town and master elemental reactions in a dark fantasy deck-building roguelike.",
  applicationName: "Emberfall",
  keywords: ["deckbuilder", "roguelike", "elemental combat", "town building", "dark fantasy"],
  openGraph: {
    title: "Emberfall - Elemental Knight",
    description: "Choose two elemental vows, reclaim a fallen city, and break the Legion Warden.",
    type: "website",
    images: [{ url: "/art/emberfall-town.webp", width: 1536, height: 1024, alt: "The ruined city of Emberfall" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} ${utility.variable}`}>{children}</body></html>;
}
