import React from "react";
import "./landing.css";
import { ParallaxProvider, Header, Hero, Features, Testimonials, Pricing, CTA, Footer } from "../components/landing";

export default function Landing() {
  return (
    <ParallaxProvider>
      <div className="min-h-screen w-full bg-white text-gray-800">
        <Header />
        <main className="relative">
          <Hero />
          <Features />
          <Testimonials />
          <Pricing />
          <CTA />
          <Footer />
        </main>
      </div>
    </ParallaxProvider>
  );
}
          <div className="shape s2" />
