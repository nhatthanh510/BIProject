import { useEffect } from "react";
import { NavLink } from "react-router";
import { Home, Settings, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();

  const items = [
    { to: "/", icon: Home, label: t("nav.dashboard") },
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:w-56 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">
            {t("app.title")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/80 hover:bg-sidebar-accent/60 md:hidden"
            aria-label={t("common.close") ?? "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
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
    </>
  );
}
