import { ChartColumn, Play, Settings, Square, TriangleAlert, createElement } from 'lucide';

const ICONS = { play: Play, stop: Square, settings: Settings, stats: ChartColumn, warning: TriangleAlert };

/** Lucide icon as an SVG string. */
export function icon(name: keyof typeof ICONS, size = 22): string {
  const el = createElement(ICONS[name], { width: size, height: size, 'stroke-width': 2 });
  return el.outerHTML;
}
