import Image from "next/image";
import Link from "next/link";
export function Brand() {
  return <Link href="/" className="brand" aria-label="Rouse home"><Image src="/brand/rouse/wordmark-light.svg" width={132} height={29} alt="Rouse" priority /></Link>;
}
export function SkipLink(){
  return <a className="skip-link" href="#main">Skip to main content</a>;
}
export function SiteHeader() {
  return <header className="rouse-header"><SkipLink /><Brand /><nav aria-label="Primary"><Link href="/#method">How it works</Link><Link href="/cases">Reviewed cases</Link><Link href="/journal/casewake" className="nav-secondary">Field notes</Link><Link href="/workspace" className="nav-cta">Open workspace <span aria-hidden="true">↗</span></Link></nav></header>;
}
export function SiteFooter() {
  return <footer className="rouse-footer"><Brand /><span>Resolution memory for Sui engineers.</span><span>Human judgment stays with the engineer.</span></footer>;
}
