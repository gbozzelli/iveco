// Shared demo data + relay helpers for the IVECO "Supplier follow-up" OE mockup.
// Used by index.html (flow), supplier.html (supplier form) and action.html (Teams button landing page).

// Relay used to pass Teams-button clicks and supplier-form submissions back to the flow page.
// Public pub/sub service; each demo run uses a random topic so runs don't interfere.
const RELAY_URL = 'https://ntfy.sh/';

const DEMO = {
  supplier: { id: '12345', name: 'ACME COMPONENTS', email: 'order.desk@acme-components.example' },
  expediter: 'Giammarco',
  // need = date by which the part is needed (forecast stockout or dealer date)
  lines: [
    { po: '4500123401', item: '10', part: '503133035',  desc: 'REAR MIRROR',          qty: 40,  requested: '2026-12-05', need: '2026-12-08', vor: 19, urgent: 4,  plannerReq: true,  depot: '3 – Madrid',    stockout: '2026-12-06' },
    { po: '4500123402', item: '20', part: '5801779427', desc: 'REAR MIRROR LEFT',     qty: 30,  requested: '2026-12-15', need: '2026-12-20', vor: 16, urgent: 12, plannerReq: false, depot: '2 – Lieusaint', stockout: '2026-12-03', freeQty: 6, freeFrom: '1 – Torino' },
    { po: '4500123405', item: '10', part: '500615782',  desc: 'SUPPORT ARM',          qty: 25,  requested: '2026-12-10', need: '2026-12-18', vor: 0,  urgent: 12, plannerReq: true,  depot: '2 – Lieusaint', stockout: '2026-12-14' },
    { po: '4500123410', item: '30', part: '504345159',  desc: 'BRAKE PAD SET',        qty: 120, requested: '2026-12-12', need: '2027-01-05', vor: 0,  urgent: 2,  plannerReq: false, depot: '3 – Madrid',    stockout: '2027-01-02' },
    { po: '4500123411', item: '10', part: '5801523310', desc: 'FUEL FILTER CARTRIDGE',qty: 200, requested: '2026-12-18', need: '2027-01-10', vor: 0,  urgent: 0,  plannerReq: false, depot: '1 – Torino',    stockout: '2027-01-08' },
    { po: '4500123418', item: '40', part: '41221455',   desc: 'WIPER BLADE',          qty: 300, requested: '2026-12-20', need: '2027-01-15', vor: 0,  urgent: 0,  plannerReq: false, depot: '2 – Lieusaint', stockout: '2027-01-12' },
    { po: '4500123420', item: '10', part: '5802265412', desc: 'HEADLAMP UNIT RH',     qty: 15,  requested: '2026-12-22', need: '2027-01-20', vor: 0,  urgent: 1,  plannerReq: false, depot: '1 – Torino',    stockout: '2027-01-18' },
    { po: '4500123421', item: '20', part: '504087321',  desc: 'DOOR HANDLE',          qty: 60,  requested: '2027-01-08', need: '2027-01-25', vor: 0,  urgent: 0,  plannerReq: false, depot: '3 – Madrid',    stockout: '2027-01-22' },
    { po: '4500123425', item: '10', part: '5801645630', desc: 'BUMPER BRACKET',       qty: 80,  requested: '2027-01-12', need: '2027-02-01', vor: 0,  urgent: 0,  plannerReq: false, depot: '2 – Lieusaint', stockout: '2027-01-29' },
  ],
  // Default supplier answer used by the on-page fallback (demo path: one line gets a date that is too late)
  defaultAnswer: { '4500123402/20': { response: 'newdate', date: '2027-01-12' } },
};

function fmtDate(iso, withYear = true) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return withYear ? `${d}.${m}.${y}` : `${d}.${m}`;
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function relayPublish(topic, obj) {
  // No custom headers -> simple CORS request, no preflight
  return fetch(RELAY_URL + encodeURIComponent(topic), { method: 'POST', body: JSON.stringify(obj) });
}
function relaySubscribe(topic, onEvent) {
  const es = new EventSource(RELAY_URL + encodeURIComponent(topic) + '/sse');
  es.onmessage = (e) => {
    try {
      const d = JSON.parse(e.data);
      if (d.event && d.event !== 'message') return;
      onEvent(JSON.parse(d.message));
    } catch (_) { /* ignore non-JSON */ }
  };
  return es;
}
