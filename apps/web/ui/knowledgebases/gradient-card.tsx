import React from "react";

const colors = [
  ["#FF6B6B", "#4ECDC4"],
  ["#FFA07A", "#20B2AA"],
  ["#87CEFA", "#F08080"],
  ["#DDA0DD", "#20B2AA"],
  ["#FFD700", "#FF69B4"],
  ["#FF6347", "#4682B4"],
  ["#7B68EE", "#00FA9A"],
  ["#FF4500", "#32CD32"],
  ["#6A5ACD", "#00CED1"],
  ["#FF1493", "#1E90FF"],
  ["#00FF7F", "#FF00FF"],
  ["#8A2BE2", "#00BFFF"],
];

interface GradientCardProps {
  className?: string;
}

export default function GradientCard({ className = "" }: GradientCardProps) {
  const [color1, color2] = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className={`h-full w-full ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
      }}
    />
  );
}
