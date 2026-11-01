// Stats placeholder: v1 only collects data (every session and key press is stored on completion).
export class KsStatsView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `<style>
      :host { display: grid; place-items: center; height: 100%; padding: 72px 24px 24px; box-sizing: border-box; text-align: center; color: #4a5060; }
      h1 { margin: 0 0 8px; font-size: 22px; color: #1b1d23; }
      p { margin: 0; max-width: 32ch; line-height: 1.5; }
    </style><div><h1>Stats</h1><p>Coming soon. Your completed sessions are already being saved on this device.</p></div>`;
  }
}
if (!customElements.get('ks-stats-view')) customElements.define('ks-stats-view', KsStatsView);
