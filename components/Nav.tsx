"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartTotal, readCart, type CartItem } from "@/lib/cart";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const links = [
  { href: "/menu", label: "Menu" },
  { href: "/#story", label: "Our coffee" },
  { href: "/#craft", label: "The roast" },
  { href: "/#about", label: "Our story" },
  { href: "/#gallery", label: "Gallery" },
  { href: "mailto:hello@ember.coffee", label: "Contact" },
];

export default function Nav({ variant }: { variant: "home" | "menu" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const syncCart = () => setCart(readCart());
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("ember-cart-change", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("ember-cart-change", syncCart);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", open);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [open]);

  const orderHref = count ? "/order" : "/menu";
  const orderLabel = count
    ? `${count} item${count === 1 ? "" : "s"} · ${money(cartTotal(cart))}`
    : "Order pickup";

  return (
    <nav id="brandnav" className={variant === "menu" ? "nav-dark" : undefined} aria-label="Primary navigation">
      <Link className="wordmark" href="/" aria-label="EMBER Coffee home">
        <strong>EMBER</strong>
        <small>ROASTERS</small>
      </Link>
      <div className="links">
        {links.map((link) => (
          <Link key={link.label} href={link.href} aria-current={link.href === pathname ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </div>
      <div className="nav-actions">
        <Link className="navcta" href={orderHref} aria-label={count ? `View order, ${orderLabel}` : orderLabel}>
          {orderLabel}
        </Link>
        <button
          className="nav-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>
      <div className="mobile-navigation" id="mobile-navigation" hidden={!open}>
        <div className="mobile-navigation-links">
          {links.map((link, index) => (
            <Link key={link.label} href={link.href} aria-current={link.href === pathname ? "page" : undefined} onClick={() => setOpen(false)}>
              <span>0{index + 1}</span>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mobile-navigation-meta">
          <span>Pickup orders</span>
          <a href="mailto:hello@ember.coffee">hello@ember.coffee</a>
        </div>
      </div>
    </nav>
  );
}
