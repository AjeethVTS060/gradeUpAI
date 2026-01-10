import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";

export default function Header() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 120], ["rgba(255,255,255,0)", "rgba(255,255,255,0.98)"]);
  const blurPx = useTransform(scrollY, [0, 120], ["0px", "8px"]);

  return (
    <motion.header
      style={{ background: bg, WebkitBackdropFilter: blurPx, backdropFilter: blurPx }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200"
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">GradeUp AI</Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <a href="#features" className="text-gray-700 hover:text-primary">Features</a>
          <a href="#testimonials" className="text-gray-700 hover:text-primary">Testimonials</a>
          <a href="#pricing" className="text-gray-700 hover:text-primary">Pricing</a>
          <Link href="/auth" className="ml-3 inline-flex items-center gap-2 rounded-md bg-primary text-white px-4 py-2 text-sm shadow hover:scale-105 transform transition">Get started</Link>
        </nav>
      </div>
    </motion.header>
  );
}
