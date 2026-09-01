import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-paper-raised p-5 shadow-card ${className}`}
      {...props}
    />
  );
}
