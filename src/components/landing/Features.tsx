import React from "react";
import FeatureCard from "./FeatureCard";
import { Bot, BarChart3, Trophy, Users, FileText } from "lucide-react";

const features = [
  { title: "AI Tutor", description: "Context-aware hints and step-by-step explanations.", icon: <Bot /> },
  { title: "Insightful Analytics", description: "Track learning, identify gaps, and celebrate progress.", icon: <BarChart3 /> },
  { title: "Gamified Learning", description: "Streaks, badges, and leaderboards to motivate students.", icon: <Trophy /> },
  { title: "Collaborative", description: "Community Q&A and group activities.", icon: <Users /> },
  { title: "Content Manager", description: "Create lessons, quizzes and assignments with ease.", icon: <FileText /> },
];

export default function Features() {
  return (
    <section id="features" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-6">Powerful features for modern learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} depth={0.06 + i * 0.02} />
          ))}
        </div>
      </div>
    </section>
  );
}
