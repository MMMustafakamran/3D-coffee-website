import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteScripts from "@/components/SiteScripts";
import CheckoutClient from "@/components/order/CheckoutClient";

export const metadata: Metadata = { title: "Order ahead — EMBER Coffee", description: "Place an EMBER pickup order." };
export default function OrderPage() { return <><Nav variant="menu" /><main id="order-content"><section className="section"><CheckoutClient /></section></main><Footer variant="menu" /><SiteScripts /></>; }
