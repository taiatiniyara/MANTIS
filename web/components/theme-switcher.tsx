"use client";

import { Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Theme Switcher Component
 * 
 * MANTIS uses a light-only theme with blue and slate colors.
 * This component displays the current theme (Light Mode) as a badge.
 * Dark mode is not supported to maintain consistency across the platform.
 */
const ThemeSwitcher = () => {
  return (
    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
      <Sun size={14} className="text-primary" />
      <span className="text-xs font-medium">Light Mode</span>
    </Badge>
  );
};

export { ThemeSwitcher };
