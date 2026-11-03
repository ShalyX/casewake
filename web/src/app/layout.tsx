import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Incident Memory — verified resolution intelligence",
  description: "A Sui engineering memory of evidence-backed incident resolutions, powered by Tatum and Walrus Memory.",
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
