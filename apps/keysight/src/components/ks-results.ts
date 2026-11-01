// Results panel: correct, total, % side by side, mode underneath.
import { SessionResult } from '../core/session';
import { t } from '../i18n';

export class KsResults extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.hidden = true;
  }
  show(r: SessionResult): void {
    const mode = r.mode === 'static' ? t('static') : t('bpm', { n: r.mode });
    this.shadowRoot!.innerHTML = `<style>
      :host { display: grid; place-items: center; background: rgba(255,255,255,.96); }
      :host([hidden]) { display: none; }
      .row { display: flex; gap: 28px; text-align: center; }
      b { display: block; font: 700 clamp(28px, 8vw, 52px)/1 system-ui, sans-serif; color: #1b1d23; }
      span { font: 600 12px system-ui, sans-serif; color: #6b7080; text-transform: uppercase; letter-spacing: .06em; }
      p { margin: 14px 0 0; text-align: center; font: 500 14px system-ui, sans-serif; color: #4a5060; }
    </style><div><div class="row">
      <div><b>${r.correct}</b><span>${t('correct')}</span></div>
      <div><b>${r.total}</b><span>${t('total')}</span></div>
      <div><b>${r.percent}%</b><span>${t('correct')}</span></div>
    </div><p>${mode}</p></div>`;
    this.hidden = false;
  }
  dismiss(): void {
    this.hidden = true;
  }
}
if (!customElements.get('ks-results')) customElements.define('ks-results', KsResults);
