import { Home, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="flex w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-white/10 px-6 text-xl font-semibold">
        {t("app.title")}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <NavItem to="/" icon={<Home className="h-4 w-4" />} label={t("nav.dashboard")} end />
        <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label={t("nav.settings")} />
      </nav>
    </aside>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-white"
            : "text-slate-300 hover:bg-sidebar-accent hover:text-white",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
