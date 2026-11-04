import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casewake — Evidence-backed memory for recurring Sui failures",
  description: "The next failure shouldn't start from zero. Casewake pairs real Tatum Sui transaction evidence with reusable, transparently qualified Walrus Memory precedents.",
  openGraph: {
    title: "Casewake — The next failure shouldn't start from zero",
    description: "Real Sui transaction evidence. Simulation-tested troubleshooting. Durable memory powered by Tatum and Walrus.",
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
