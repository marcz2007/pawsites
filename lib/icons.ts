import type { IconName } from "@/lib/tenant/types";
import {
  Clock,
  Heart,
  Home,
  PawPrint,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/** Maps tenant-config icon names to lucide components. */
export const ICONS: Record<IconName, LucideIcon> = {
  Home,
  ShieldCheck,
  Shield,
  Sparkles,
  Heart,
  Clock,
  PawPrint,
  Stethoscope,
};

export function icon(name: IconName): LucideIcon {
  return ICONS[name] ?? PawPrint;
}
