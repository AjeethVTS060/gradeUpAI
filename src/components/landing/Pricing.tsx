import React from "react";
import { motion } from "framer-motion";

const plans = [
  { name: "Starter", price: "$0", perks: ["Basic AI tutor", "Up to 3 courses"] },
  { name: "Pro", price: "$12/mo", perks: ["Advanced analytics", "Unlimited courses", "Priority support"] },
  { name: "School", price: "Contact", perks: ["Site license", "Dedicated onboarding"] },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-xl font-semibold mb-6">Simple pricing — built for classrooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div whileHover={{ y: -6, scale: 1.02 }} key={p.name} className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{p.name}</h4>
                  <p className="text-2xl font-bold mt-2">{p.price}</p>
                </div>
              </div>
              <ul className="mt-4 text-sm text-gray-600 space-y-2">
                {p.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <div className="mt-6">
                <a href="#choose" className="inline-block px-4 py-2 bg-primary text-white rounded shadow">Choose</a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
