import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("dashboard.refresh")}
      onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}
