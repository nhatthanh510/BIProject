import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const current = i18n.language.startsWith("de") ? "de" : "en";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={current}
            onValueChange={(v) => {
              void i18n.changeLanguage(v);
            }}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">{t("settings.language_de")}</SelectItem>
              <SelectItem value="en">{t("settings.language_en")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.version")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cube BI v0.2.0</p>
        </CardContent>
      </Card>
    </div>
  );
}
