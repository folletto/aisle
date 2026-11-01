// Stats view: 7 and 30 day averages (anchored on the last session) and the 5 latest scores.
import { computeStats, Average } from '../core/stats';
import { deleteSession, listSessions } from '../data/storage';
import { icon } from '../icons';
import { getLanguage, sessionsLabel, t } from '../i18n';

const STYLE = `
:host { display: block; height: 100%; overflow-y: auto; box-sizing: border-box; background: #f6f7fb; color: #1b1d23; font-family: system-ui, sans-serif;
  padding: calc(72px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }
.wrap { max-width: 520px; margin: 0 auto; display: grid; gap: 14px; }
h1 { margin: 0 0 4px; font-size: 22px; }
h2 { margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #6b7080; }
.card { border: 1px solid #dfe2ea; border-radius: 14px; background: #fff; padding: 14px; }
.avgs { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.big { font-size: 34px; font-weight: 700; line-height: 1.1; }
.sub { margin-top: 4px; font-size: 13px; color: #6b7080; }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th { text-align: right; font-size: 11px; font-weight: 700; color: #6b7080; text-transform: uppercase; letter-spacing: .04em; padding: 0 0 6px 8px; }
td { text-align: right; padding: 8px 0 8px 8px; border-top: 1px solid #eef0f6; font-size: 15px; }
th:first-child, td:first-child { text-align: left; padding-left: 0; }
td:first-child { color: #4a5060; font-size: 13px; }
td.pct { font-weight: 700; }
td.del, th.del { width: 36px; padding-left: 4px; }
.del button { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #6b7080; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.del button:hover { background: #eef0f6; color: #d92d20; }
.del button:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
.empty { color: #6b7080; line-height: 1.5; }
@media (orientation: landscape) { :host { padding-top: calc(16px + env(safe-area-inset-top)); } }
`;

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

function avgCard(title: string, a: Average | null): string {
  return `<div class="card"><h2>${title}</h2>${
    a
      ? `<div class="big">${a.percent}%</div><div class="sub">${t('notesOf', { c: a.correct, t: a.total })} · ${sessionsLabel(a.sessions)}</div>`
      : `<div class="big">–</div><div class="sub">${t('noSessionsShort')}</div>`
  }</div>`;
}

export class KsStatsView extends HTMLElement {
  connectedCallback(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-delete]');
      if (btn) void this.removeScore(Number(btn.dataset.delete));
    });
    void this.render();
  }

  private async removeScore(id: number): Promise<void> {
    if (!confirm(t('deleteScoreConfirm'))) return;
    await deleteSession(id);
    await this.render();
  }

  private async render(): Promise<void> {
    const root = this.shadowRoot!;
    root.innerHTML = `<style>${STYLE}</style><div class="wrap"><h1>${t('stats')}</h1></div>`;
    let body: string;
    try {
      const stats = computeStats(await listSessions());
      if (!this.isConnected) return;
      body = stats.latest.length
        ? `<div class="avgs">${avgCard(t('last7'), stats.last7)}${avgCard(t('last30'), stats.last30)}</div>
           <div class="card"><h2>${t('latest')}</h2><table>
             <tr><th>${t('when')}</th><th>${t('hit')}</th><th>${t('total')}</th><th>%</th><th class="del"></th></tr>
             ${stats.latest
               .map((s) => {
                 const when = new Date(s.startedAt).toLocaleDateString(getLanguage(), { day: 'numeric', month: 'short' });
                 const mode = s.mode === 'static' ? t('static') : t('bpm', { n: s.mode });
                 const del = s.id === undefined ? '' : `<button type="button" data-delete="${s.id}" aria-label="${t('deleteScore')}" title="${t('deleteScore')}">${icon('trash', 16)}</button>`;
                 return `<tr><td>${esc(when)} · ${esc(mode)}</td><td>${s.correct}</td><td>${s.total}</td><td class="pct">${s.percent}%</td><td class="del">${del}</td></tr>`;
               })
               .join('')}
           </table></div>`
        : `<div class="card empty">${t('statsEmpty')}</div>`;
    } catch {
      body = `<div class="card empty">${t('statsError')}</div>`;
    }
    root.querySelector('.wrap')!.insertAdjacentHTML('beforeend', body);
  }
}
if (!customElements.get('ks-stats-view')) customElements.define('ks-stats-view', KsStatsView);
