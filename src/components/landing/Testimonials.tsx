import React from "react";
import { motion } from "framer-motion";

const quotes = [
  { name: "Aisha — Student", text: "GradeUp AI helped me get 30% better scores in two months." },
  { name: "Ravi — Teacher", text: "Creating adaptive content and tracking student growth is effortless." },
  { name: "Mira — Parent", text: "My child enjoys learning again — the streaks and badges are a hit." },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-xl font-semibold mb-6">What people say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <motion.blockquote key={q.name} initial={{ y: 12, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-6 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-700">“{q.text}”</p>
              <footer className="mt-4 text-xs text-gray-500">— {q.name}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
