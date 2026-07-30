import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SiteScripts from "@/components/SiteScripts";
import OrderQueue from "@/components/staff/OrderQueue";

export const metadata: Metadata = { title: "Staff orders — EMBER Coffee", description: "EMBER demo staff order queue." };
export default function StaffOrdersPage() { return <><Nav variant="menu" /><main><section className="section"><p className="kicker">Demo counter</p><h1 className="display">Today&apos;s <em>orders.</em></h1><OrderQueue /></section></main><Footer variant="menu" /><SiteScripts /></>; }
