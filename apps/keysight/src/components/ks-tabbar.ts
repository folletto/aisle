// Tab buttons: Play / Stop, Settings, Stats. Centred at the top.
import { icon } from '../icons';
import { Route } from '../router/router';
import { t } from '../i18n';

const STYLE = `
:host { display: block; }
nav { display: inline-flex; gap: 4px; padding: 4px; background: rgba(255,255,255,.92); border: 1px solid #dfe2ea;
  border-radius: 999px; box-shadow: 0 2px 8px rgba(20,24,40,.08); backdrop-filter: blur(6px); }
button { display: flex; align-items: center; justify-content: center; width: 52px; height: 40px; border: 0; border-radius: 999px;
  background: transparent; color: #4a5060; cursor: pointer; -webkit-tap-highlight-color: transparent; }
button[aria-current="page"] { background: #e8eefc; color: #1d4ed8; }
button.play { background: #1d4ed8; color: #fff; }
button.play.running { background: #d92d20; }
button:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
`;

export class KsTabbar extends HTMLElement {
  private _route: Route = '/play';
  private _running = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button');
      if (!b) return;
      const action = b.dataset.action!;
      this.dispatchEvent(new CustomEvent('ks-tab', { detail: { action }, bubbles: true, composed: true }));
    });
    this.render();
  }

  set route(r: Route) {
    this._route = r;
    this.render();
  }
  set running(v: boolean) {
    this._running = v;
    this.render();
  }

  /** Re-render, e.g. after a language change. */
  refresh(): void {
    this.render();
  }

  private render(): void {
    const cur = (r: Route) => (this._route === r ? 'aria-current="page"' : '');
    this.shadowRoot!.innerHTML = `<style>${STYLE}</style>
      <nav aria-label="${t('main')}">
        <button class="play ${this._running ? 'running' : ''}" data-action="toggle" aria-label="${this._running ? t('stop') : t('play')}">${icon(this._running ? 'stop' : 'play')}</button>
        <button data-action="/settings" aria-label="${t('settings')}" ${cur('/settings')}>${icon('settings')}</button>
        <button data-action="/stats" aria-label="${t('stats')}" ${cur('/stats')}>${icon('stats')}</button>
      </nav>`;
  }
}
if (!customElements.get('ks-tabbar')) customElements.define('ks-tabbar', KsTabbar);
