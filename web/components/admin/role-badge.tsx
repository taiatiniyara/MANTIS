import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, User } from "lucide-react";

type UserRole = "super_admin" | "agency_admin" | "officer";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = {
    super_admin: {
      label: "Super Admin",
      variant: "default" as const,
      icon: ShieldCheck,
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    agency_admin: {
      label: "Agency Admin",
      variant: "secondary" as const,
      icon: Shield,
      className: "bg-zinc-600 hover:bg-zinc-700 text-white",
    },
    officer: {
      label: "Officer",
      variant: "outline" as const,
      icon: User,
      className: "",
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
