import * as LucideIcons from "lucide-react";
import { Shapes } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

const FALLBACK_ICON = Shapes;
const FALLBACK_COLORS: [string, string] = ["#9e9e9e", "#616161"];

export function getAppIcon(app: {
  name: string;
  launcher?: { icon?: string; colors?: [string, string] };
}): { Icon: ComponentType<LucideProps>; iconBg: string } {
  const iconName = app.launcher?.icon;
  const colors = app.launcher?.colors ?? FALLBACK_COLORS;

  const Icon =
    iconName && iconName in LucideIcons
      ? (LucideIcons as unknown as Record<string, ComponentType<LucideProps>>)[iconName]
      : FALLBACK_ICON;

  const iconBg = `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 100%)`;

  return { Icon, iconBg };
}
