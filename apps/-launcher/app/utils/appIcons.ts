import {
  Calendar,
  Share2,
  LayoutGrid,
  Video,
  Music,
  Image,
  MessageCircle,
  Map,
  ShoppingBag,
  Globe,
  Wrench,
  Zap,
  BookOpen,
  BarChart2,
  Clock,
  Mail,
  FileText,
  Camera,
  Gamepad2,
  Rss,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

/* Tag → Lucide icon */
const TAG_ICONS: Record<string, ComponentType<LucideProps>> = {
  meta: LayoutGrid,
  calendar: Calendar,
  social: Share2,
  video: Video,
  audio: Music,
  music: Music,
  image: Image,
  photo: Camera,
  chat: MessageCircle,
  message: MessageCircle,
  map: Map,
  location: Map,
  shop: ShoppingBag,
  shopping: ShoppingBag,
  web: Globe,
  utility: Wrench,
  tool: Wrench,
  productivity: Zap,
  book: BookOpen,
  read: BookOpen,
  chart: BarChart2,
  analytics: BarChart2,
  time: Clock,
  email: Mail,
  document: FileText,
  game: Gamepad2,
  news: Rss,
  feed: Rss,
};

/* Tag → gradient (CSS value) */
const TAG_GRADIENTS: Record<string, string> = {
  meta: "linear-gradient(145deg, #003b4d 0%, #137ba8 100%)",
  calendar: "linear-gradient(145deg, #e07b54 0%, #f0a875 100%)",
  social: "linear-gradient(145deg, #4776e6 0%, #8e54e9 100%)",
  video: "linear-gradient(145deg, #1d976c 0%, #5dbe8a 100%)",
  audio: "linear-gradient(145deg, #f093fb 0%, #f5576c 100%)",
  music: "linear-gradient(145deg, #f093fb 0%, #f5576c 100%)",
  image: "linear-gradient(145deg, #fd7043 0%, #ffb300 100%)",
  photo: "linear-gradient(145deg, #fd7043 0%, #ffb300 100%)",
  chat: "linear-gradient(145deg, #25d366 0%, #128c7e 100%)",
  message: "linear-gradient(145deg, #25d366 0%, #128c7e 100%)",
  map: "linear-gradient(145deg, #fc4a1a 0%, #f7b733 100%)",
  location: "linear-gradient(145deg, #fc4a1a 0%, #f7b733 100%)",
  shop: "linear-gradient(145deg, #232526 0%, #414345 100%)",
  shopping: "linear-gradient(145deg, #232526 0%, #414345 100%)",
  web: "linear-gradient(145deg, #0099f7 0%, #f11712 100%)",
  utility: "linear-gradient(145deg, #536976 0%, #292e49 100%)",
  tool: "linear-gradient(145deg, #536976 0%, #292e49 100%)",
  productivity: "linear-gradient(145deg, #f7971e 0%, #ffd200 100%)",
  book: "linear-gradient(145deg, #ee9ca7 0%, #ffdde1 100%)",
  read: "linear-gradient(145deg, #ee9ca7 0%, #ffdde1 100%)",
  chart: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
  analytics: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
  time: "linear-gradient(145deg, #2c3e50 0%, #3498db 100%)",
  email: "linear-gradient(145deg, #c94b4b 0%, #4b134f 100%)",
  document: "linear-gradient(145deg, #4568dc 0%, #b06ab3 100%)",
  game: "linear-gradient(145deg, #141e30 0%, #243b55 100%)",
  news: "linear-gradient(145deg, #f64f59 0%, #c471ed 100%)",
  feed: "linear-gradient(145deg, #f64f59 0%, #c471ed 100%)",
};

const FALLBACK_ICON = Globe;
const FALLBACK_GRADIENT = "linear-gradient(145deg, #7cadc3 0%, #003b4d 100%)";

/* Stable fallback colour from app name hash */
const EXTRA_GRADIENTS = [
  "linear-gradient(145deg, #e96c8a 0%, #f0a875 100%)",
  "linear-gradient(145deg, #43b89c 0%, #2b7a6e 100%)",
  "linear-gradient(145deg, #7f60d4 0%, #4a90d9 100%)",
  "linear-gradient(145deg, #d4608d 0%, #9b3060 100%)",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getAppIcon(
  app: { name: string; tags: string[] },
): { Icon: ComponentType<LucideProps>; iconBg: string } {
  for (const tag of app.tags) {
    if (TAG_ICONS[tag]) {
      return {
        Icon: TAG_ICONS[tag],
        iconBg: TAG_GRADIENTS[tag] ?? FALLBACK_GRADIENT,
      };
    }
  }
  // Use name hash for a stable fallback colour
  const idx = hashStr(app.name) % EXTRA_GRADIENTS.length;
  return { Icon: FALLBACK_ICON, iconBg: EXTRA_GRADIENTS[idx] };
}
