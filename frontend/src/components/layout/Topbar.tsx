import { useTranslation } from "react-i18next";
import { ChevronDown, LogOut, Menu } from "lucide-react";

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

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-end gap-2 border-b bg-background px-3 py-2 sm:gap-3 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="mr-auto md:hidden"
        onClick={onMenuClick}
        aria-label={t("common.menu") ?? "Menu"}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <MonthPicker />
      <ClientSelect />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="max-w-[140px] gap-1 sm:max-w-none">
            <span className="truncate">{user?.username ?? user?.email ?? "admin"}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
