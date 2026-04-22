import { ChevronDown, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MonthPicker } from "@/components/dashboard/MonthPicker";
import { ClientSelect } from "@/components/dashboard/ClientSelect";
import { useAuth } from "@/auth/AuthContext";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";

export function Topbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { filters, setMonth, setClient } = useDashboardFilters();

  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b bg-background px-6">
      <MonthPicker value={filters.month} onChange={setMonth} />
      <ClientSelect value={filters.clientId} onChange={setClient} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <span>{user?.full_name || user?.email || "admin"}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void logout()} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
