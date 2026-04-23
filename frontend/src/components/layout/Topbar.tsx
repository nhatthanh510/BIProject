import { useTranslation } from "react-i18next";
import { ChevronDown, LogOut } from "lucide-react";

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

export function Topbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-end gap-3 border-b bg-background px-6">
      <MonthPicker />
      <ClientSelect />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            {user?.username ?? user?.email ?? "admin"}
            <ChevronDown className="h-4 w-4 opacity-60" />
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
