import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import ParallaxLayer from "./ParallaxLayer";
import CinematicShapes from "./CinematicShapes";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20">{/* account for fixed header */}
      <div className="cinematic-bg cinematic-vignette film-grain" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1 initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl font-extrabold leading-tight">
              GradeUp AI — Smarter learning, faster mastery
            </motion.h1>
            <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.12 }} className="mt-4 text-lg text-gray-700 max-w-xl">
              Personalized AI tutor, deep analytics, and gamified practice to keep students engaged and teachers informed.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 flex items-center gap-3">
              <Link href="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-5 py-3 shadow hover:-translate-y-1 transition">Get started</Link>
              <a href="#features" className="text-sm text-gray-600 hover:underline">See features</a>
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <div className="relative w-full max-w-md mx-auto">
              <ParallaxLayer depth={0.18} scrollDepth={0.12} className="absolute -left-6 -top-6">
                <div className="w-36 h-36 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-2xl opacity-90 shadow-xl transform-gpu" />
              </ParallaxLayer>

              <ParallaxLayer depth={0.1} scrollDepth={0.08} className="relative z-10">
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="mock-device w-full rounded-2xl p-6 bg-white shadow-lg">
                  <div className="mock-screen h-72 rounded-md bg-gradient-to-b from-white to-white/30 p-4 flex flex-col justify-between">
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-40 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-28 mt-2" />
                  </div>
                </motion.div>
              </ParallaxLayer>

              <ParallaxLayer depth={0.06} scrollDepth={0.04} className="absolute -right-6 -bottom-6">
                <div className="w-24 h-24 bg-white/60 rounded-xl shadow-lg" />
              </ParallaxLayer>
              <div className="absolute inset-0 -z-10">
                {/* cinematic SVG shapes */}
                <CinematicShapes />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
