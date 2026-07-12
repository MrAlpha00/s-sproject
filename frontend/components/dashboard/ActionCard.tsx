"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  iconColor?: "blue" | "purple" | "emerald" | "amber";
}

export function ActionCard({ title, description, icon: Icon, href, onClick, iconColor = "blue" }: ActionCardProps) {
  const colorMap = {
    blue: "text-electric-blue border-electric-blue/10 bg-electric-blue/5 hover:bg-electric-blue/10",
    purple: "text-accent-purple border-accent-purple/10 bg-accent-purple/5 hover:bg-accent-purple/10",
    emerald: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10",
    amber: "text-amber-400 border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10",
  };

  const cardContent = (
    <div className="flex items-center gap-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${colorMap[iconColor]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white group-hover:text-electric-blue transition-colors truncate">
          {title}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>
    </div>
  );

  const className = "group block w-full rounded-xl border border-white/[0.06] bg-zinc-900/30 p-4 text-left transition-all duration-200 hover:border-white/[0.12] hover:bg-zinc-900/50 cursor-pointer relative overflow-hidden";

  if (href) {
    return (
      <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
        <Link href={href} className={className}>
          <div className="absolute top-0 right-0 h-16 w-16 bg-white/[0.01] rounded-bl-full pointer-events-none" />
          {cardContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button onClick={onClick} whileHover={{ x: 3 }} transition={{ duration: 0.15 }} className={className}>
      <div className="absolute top-0 right-0 h-16 w-16 bg-white/[0.01] rounded-bl-full pointer-events-none" />
      {cardContent}
    </motion.button>
  );
}
