// App shell: tab bar + the view mounted by the router.
import './ks-tabbar';
import './ks-play-view';
import './ks-settings-view';
import './ks-stats-view';
import type { KsPlayView } from './ks-play-view';
import type { KsTabbar } from './ks-tabbar';
import { Route, Router } from '../router/router';
import { settingsStore } from '../state';

const VIEWS: Record<Route, string> = { '/play': 'ks-play-view', '/settings': 'ks-settings-view', '/stats': 'ks-stats-view' };

const STYLE = `
:host { display: block; position: fixed; inset: 0; background: #fff; }
ks-tabbar { position: absolute; top: calc(8px + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); z-index: 10; }
main { position: absolute; inset: 0; }
main > * { height: 100%; }
@media (orientation: landscape) {
  ks-tabbar { top: 50%; left: calc(8px + env(safe-area-inset-left)); transform: translateY(-50%); }
  main { left: calc(86px + env(safe-area-inset-left)); }
}
`;

export class KsApp extends HTMLElement {
  private main!: HTMLElement;
  private bar!: KsTabbar;
  private router!: Router;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLE}</style><main></main><ks-tabbar></ks-tabbar>`;
    this.main = root.querySelector('main')!;
    this.bar = root.querySelector('ks-tabbar') as KsTabbar;
    this.router = new Router((route) => this.mount(route));
    this.addEventListener('ks-session-state', (e) => (this.bar.running = (e as CustomEvent).detail.running));
    this.addEventListener('ks-tab', (e) => this.onTab((e as CustomEvent).detail.action));
    settingsStore.subscribe(() => this.bar.refresh());
    this.router.start();
  }

  private mount(route: Route): void {
    // Replacing the view disconnects the play view, which aborts any running session.
    this.main.replaceChildren(document.createElement(VIEWS[route]));
    this.bar.running = false;
    this.bar.route = route;
  }

  private onTab(action: string): void {
    if (action !== 'toggle') return this.router.navigate(action as Route);
    const view = () => this.main.firstElementChild as KsPlayView;
    if (this.router.current === '/play' && view().running) return view().stopSession();
    // Play from any tab: go to /play first, then start.
    this.router.navigate('/play');
    void view().startSession();
  }
}
if (!customElements.get('ks-app')) customElements.define('ks-app', KsApp);
