import React from "react";
import ParallaxLayer from "./ParallaxLayer";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  depth?: number;
}

export default function FeatureCard({ title, description, icon, depth = 0.06 }: FeatureCardProps) {
  return (
    <ParallaxLayer depth={depth} className="rounded-lg p-6 bg-white shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-primary">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </ParallaxLayer>
  );
}
