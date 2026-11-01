import { registerSW } from 'virtual:pwa-register';
import './styles.css';
import './components/ks-app';
import { settingsStore } from './state';
import { requestPersistence } from './data/storage';

// iOS Safari ignores user-scalable=no: block double-tap zoom and pinch-zoom gestures explicitly.
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd < 350) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault());

async function boot(): Promise<void> {
  await settingsStore.load();
  void requestPersistence();
  document.getElementById('app')!.appendChild(document.createElement('ks-app'));
  registerSW({ immediate: true });
}
boot();
