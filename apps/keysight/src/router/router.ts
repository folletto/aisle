// Tiny History API router: one URL per tab, back / forward work.
export type Route = '/play' | '/settings' | '/stats';
export const ROUTES: Route[] = ['/play', '/settings', '/stats'];

/** "/" and unknown paths show the play view. */
export function routeFor(pathname: string): Route {
  const p = pathname.replace(/\/+$/, '') || '/';
  return (ROUTES as string[]).includes(p) ? (p as Route) : '/play';
}

export class Router {
  current: Route;
  constructor(private onChange: (r: Route, previous: Route | null) => void) {
    this.current = routeFor(location.pathname);
    window.addEventListener('popstate', () => this.apply(routeFor(location.pathname)));
  }
  start(): void {
    this.onChange(this.current, null);
  }
  navigate(path: Route): void {
    if (path !== location.pathname) history.pushState({}, '', path);
    this.apply(path);
  }
  private apply(r: Route): void {
    const prev = this.current;
    this.current = r;
    if (r !== prev) this.onChange(r, prev);
  }
}
