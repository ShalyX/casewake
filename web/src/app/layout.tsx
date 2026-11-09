import type { Metadata } from "next";
import "./globals.css";
import "./rouse.css";

export const metadata: Metadata = {
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://tryrouse.vercel.app"),
  title: "Rouse — Evidence-backed memory for recurring Sui failures",
  description: "The next failure shouldn't start from zero. Rouse pairs real Tatum Sui transaction evidence with earlier reviewed procedures retained in Walrus Memory.",
  openGraph: {
    title: "Rouse — The next failure shouldn't start from zero",
    description: "Real Sui transaction evidence. Human-reviewed resolutions. Durable memory powered by Tatum and Walrus.",
    images:[{url:"/brand/rouse/social-card.png",width:1200,height:630,alt:"Rouse — the next failure shouldn't start from zero"}],
  },
  twitter: { card: "summary_large_image" },
  icons:{icon:[{url:"/brand/rouse/favicon.svg",type:"image/svg+xml"},{url:"/brand/rouse/favicon-32.png",sizes:"32x32"}],apple:"/brand/rouse/avatar.png"},
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><head><link rel="preload" href="/fonts/SpaceGrotesk.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/DMSans.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body>{children}</body></html>;
}
