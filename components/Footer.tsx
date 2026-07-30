import Link from "next/link";

export default function Footer({ variant }: { variant: "home" | "menu" }) {
  const base = variant === "menu" ? "/" : "";
  return (
    <footer data-bg={variant === "home" ? "dark" : undefined}>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-mark">EMBER</div>
            <p className="footer-tag">Coffee for mornings already in motion.</p>
          </div>
          <div className="footer-col">
            <h3>Explore</h3>
            {variant === "menu" ? (
              <a href={`${base}#story`}>Our story</a>
            ) : (
              <Link href="#story">Our story</Link>
            )}
            {variant === "menu" ? (
              <a href={`${base}#craft`}>The roast</a>
            ) : (
              <Link href="#craft">The roast</Link>
            )}
            {variant === "menu" ? (
              <a href={`${base}#blend`}>The blend</a>
            ) : (
              <Link href="#blend">The blend</Link>
            )}
            <a href="/menu">Menu</a>
          </div>
          <div className="footer-col">
            <h3>Visit</h3>
            {variant === "menu" ? (
              <a href={`${base}#gallery`}>Gallery</a>
            ) : (
              <Link href="#gallery">Gallery</Link>
            )}
            <a href="mailto:hello@ember.coffee">Email the café</a>
          </div>
          <div className="footer-col">
            <h3>Contact</h3>
            <a href="mailto:hello@ember.coffee">General enquiries</a>
            <a href="mailto:hello@ember.coffee?subject=Wholesale%20enquiry">Email wholesale</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EMBER Coffee</span>
          <span>Roasted slowly · carried daily</span>
        </div>
      </div>
    </footer>
  );
}
