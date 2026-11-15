import * as LucideIcons from "lucide-react";
import { Shapes } from "lucide-react";
const FALLBACK_ICON = Shapes;
const FALLBACK_COLORS = ["#9e9e9e", "#616161"];
export function getAppIcon(app) {
    const iconName = app.launcher?.icon;
    const colors = app.launcher?.colors ?? FALLBACK_COLORS;
    const Icon = iconName && iconName in LucideIcons
        ? LucideIcons[iconName]
        : FALLBACK_ICON;
    return { Icon, iconColor: colors[0] };
}
