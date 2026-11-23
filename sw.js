/* Shop Management service worker — অফলাইনে অ্যাপ খোলা + সবসময় নতুন কোড/কনফিগ আগে নেটওয়ার্ক থেকে */
const VER = 'shop-mgmt-v1';
const SHELL = ["/", "/index.html", "/css/style.css", "/config.js", "/manifest.webmanifest", "/icon.svg", "/pwa-192x192.png", "/pwa-512x512.png", "/js/app-01-core-tenants.js", "/js/app-02-login-session.js", "/js/app-03-sales-cloud-status.js", "/js/app-04-inventory-dashboard-reports.js", "/js/app-05-purchase-expense-orders-saas.js", "/js/app-06-audit-settings.js", "/js/app-07-staff-history-qr.js", "/js/app-08-scan-accounts.js", "/js/app-09-online-orders.js", "/js/app-10-daybook-payments.js", "/js/app-11-corrections.js", "/js/app-12-statements-pwa.js", "/js/app-13-salary-dev-center.js", "/js/app-14-branches.js", "/js/app-15-saas-billing.js", "/js/boot.js", "/js/firebase-loader.js", "/js/security.js"];
const CDN = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {            // নিজের ফাইল: আগে নেটওয়ার্ক, না পেলে ক্যাশ
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('/index.html') : Response.error()))));
  } else if (CDN.includes(u.hostname)) {          // লাইব্রেরি/ফন্ট: ক্যাশ আগে
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; })));
  }                                               // Firestore/অন্য API: সার্ভিস ওয়ার্কার ছোঁয় না
});
