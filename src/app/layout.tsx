import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Thai Mango | Sun-Dried Mango, Straight From Thailand",
  description:
    "Discover Thai Mango — sun-ripened, sun-dried mango snacks handcrafted from Thailand's finest orchards. No artificial preservatives, just pure tropical flavor.",
  openGraph: {
    title: "Thai Mango | Sun-Dried Mango, Straight From Thailand",
    description:
      "Discover Thai Mango — sun-ripened, sun-dried mango snacks handcrafted from Thailand's finest orchards.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-ivory text-charcoal">
        {children}
      </body>
    </html>
  );
}
