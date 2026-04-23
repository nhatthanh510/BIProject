import { NavLink } from "react-router";
import { Home, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t } = useTranslation();

  const items = [
    { to: "/", icon: Home, label: t("nav.dashboard") },
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <aside className="flex w-56 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5 text-lg font-semibold tracking-tight">
        {t("app.title")}
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
