import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function CTA() {
  return (
    <section className="py-12 bg-gradient-to-r from-primary to-pink-500 text-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-semibold">Ready to transform learning?</h4>
          <p className="text-sm opacity-90">Start a free trial today and see the impact of AI-driven learning.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }}>
          <Link href="/auth" className="inline-flex items-center gap-2 bg-white text-primary px-5 py-3 rounded-md font-semibold shadow">Start free trial</Link>
        </motion.div>
      </div>
    </section>
  );
}
