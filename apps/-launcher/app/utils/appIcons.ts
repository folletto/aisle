import * as LucideIcons from "lucide-react";
import { Shapes } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

const FALLBACK_ICON = Shapes;

export function getAppIcon(app: {
  name: string;
  launcher?: { icon?: string; colors?: [string, string] };
}): { Icon: ComponentType<LucideProps> } {
  const iconName = app.launcher?.icon;

  const Icon =
    iconName && iconName in LucideIcons
      ? (LucideIcons as unknown as Record<string, ComponentType<LucideProps>>)[iconName]
      : FALLBACK_ICON;

  return { Icon };
}
