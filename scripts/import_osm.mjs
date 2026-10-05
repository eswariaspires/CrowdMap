// Imports REAL Vijayawada places from OpenStreetMap into your Supabase "locations" table.
// Needs Node 18+.  Run from the project root:
//
//   npm install @supabase/supabase-js        (already in your project)
//   set SUPABASE_URL=https://xxxx.supabase.co            (Windows CMD)
//   set SUPABASE_SERVICE_KEY=your-service-role-key
//   node scripts/import_osm.mjs
//
// PowerShell:  $env:SUPABASE_URL="..." ; $env:SUPABASE_SERVICE_KEY="..."
// Mac/Linux:   export SUPABASE_URL=... SUPABASE_SERVICE_KEY=...
//
// The service-role key bypasses security rules. Use it ONLY here. Never put it in .env or the website.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY first.');
  process.exit(1);
}
const sb = createClient(url, key);

const BBOX = '16.44,80.52,16.62,80.78'; // south,west,north,east around Vijayawada

const QUERY = `[out:json][timeout:180];
(
  nwr["amenity"~"^(library|coworking_space|cafe|restaurant|fast_food|food_court|hospital|clinic|pharmacy|doctors|dentist|bus_station|community_centre|post_office|townhall|marketplace)$"](${BBOX});
  nwr["internet_access"="wlan"]["name"](${BBOX});
  nwr["shop"~"^(mobile_phone|computer|electronics|bicycle|car_repair|motorcycle_repair|stationery|supermarket|convenience|clothes|books|mall|department_store)$"](${BBOX});
  nwr["craft"~"^(electronics_repair|shoemaker|tailor)$"](${BBOX});
  nwr["railway"="station"](${BBOX});
  nwr["highway"="bus_station"](${BBOX});
);
out center tags;`;

function categorize(t) {
  const a = t.amenity, s = t.shop;
  if (['library', 'coworking_space'].includes(a)) return 'Study';
  if (['cafe', 'restaurant', 'fast_food', 'food_court'].includes(a)) return 'Food';
  if (['hospital', 'clinic', 'pharmacy', 'doctors', 'dentist'].includes(a)) return 'Healthcare';
  if (a === 'bus_station' || t.highway === 'bus_station' || t.railway === 'station') return 'Transport';
  if (t.craft || ['mobile_phone', 'computer', 'electronics', 'bicycle', 'car_repair', 'motorcycle_repair'].includes(s)) return 'Repair';
  if (s || a === 'marketplace') return 'Shopping';
  if (['community_centre', 'post_office', 'townhall'].includes(a)) return 'Other';
  if (t.internet_access === 'wlan') return 'Wi-Fi';
  return null;
}

function buildAddress(t) {
  const parts = [t['addr:housenumber'], t['addr:street'], t['addr:suburb'], t['addr:city']].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Vijayawada, Andhra Pradesh';
}

function buildDescription(t, category) {
  const bits = [];
  if (t.cuisine) bits.push(`Cuisine: ${t.cuisine.replace(/;/g, ', ')}`);
  if (t.opening_hours) bits.push(`Hours: ${t.opening_hours}`);
  if (t.phone || t['contact:phone']) bits.push(`Phone: ${t.phone || t['contact:phone']}`);
  if (t.website || t['contact:website']) bits.push(`Website: ${t.website || t['contact:website']}`);
  if (t.internet_access === 'wlan') bits.push('Wi-Fi available');
  return bits.length ? bits.join(' · ') : `${category} place in Vijayawada. Community reviews welcome.`;
}

async function main() {
  console.log('Downloading data from OpenStreetMap (can take up to a minute)...');
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'crowd-knowledge-map-student-project' },
    body: 'data=' + encodeURIComponent(QUERY),
  });
  if (!res.ok) throw new Error(`Overpass error ${res.status}. Wait a minute and try again.`);
  const { elements } = await res.json();

  const rows = new Map();
  for (const e of elements) {
    const t = e.tags || {};
    const lat = e.lat ?? e.center?.lat;
    const lng = e.lon ?? e.center?.lon;
    const category = categorize(t);
    if (!t.name || lat == null || lng == null || !category) continue;
    const osmId = `${e.type}/${e.id}`;
    rows.set(osmId, {
      osm_id: osmId,
      name: t.name,
      description: buildDescription(t, category),
      category,
      address: buildAddress(t),
      latitude: lat,
      longitude: lng,
      google_maps_url: `https://maps.google.com/?q=${lat},${lng}`,
      image_urls: [],
      created_by: null,
      created_by_name: 'OpenStreetMap',
      verification_status: 'APPROVED',
      source: 'osm',
    });
  }

  const list = [...rows.values()];
  console.log(`Found ${list.length} named places. Uploading...`);
  for (let i = 0; i < list.length; i += 500) {
    const { error } = await sb.from('locations').upsert(list.slice(i, i + 500), { onConflict: 'osm_id' });
    if (error) throw error;
    console.log(`  uploaded ${Math.min(i + 500, list.length)} / ${list.length}`);
  }
  const byCat = list.reduce((m, r) => ((m[r.category] = (m[r.category] || 0) + 1), m), {});
  console.log('Done. By category:', byCat);
}

main().catch((e) => { console.error(e); process.exit(1); });
