import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteScripts from "@/components/SiteScripts";
import MenuClient from "@/components/menu/MenuClient";

export const metadata: Metadata = {
  title: "Menu — EMBER Coffee",
  description:
    "The EMBER menu — espresso, filter, cold brew, and pastries from small-batch, seasonal lots.",
  openGraph: {
    title: "Menu — EMBER Coffee",
    description: "Espresso, filter, cold brew, and pastries — order at the counter.",
    images: ["/images/hero.webp"],
  },
};

export default function MenuPage() {
  return (
    <>
      <a className="skip-link" href="#menu-content">
        Skip to menu
      </a>
      <Nav variant="menu" />
      <main id="menu-content">
        <section className="section">
          <div className="blend-head" data-reveal>
            <div>
              <p className="kicker">The menu</p>
              <h1 className="display">
                Order for
                <br />
                <em>pickup.</em>
              </h1>
            </div>
            <p className="lead">
              Choose your coffee, review your order, and pay at the
              counter when you collect it.
            </p>
          </div>

          <MenuClient />
        </section>
      </main>
      <Footer variant="menu" />
      <SiteScripts />
    </>
  );
}
