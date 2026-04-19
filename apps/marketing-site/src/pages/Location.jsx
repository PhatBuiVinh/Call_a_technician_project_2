import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import Section from "../components/layout/Section";
import { H2 } from "../components/UI/Heading";
import Button from "../components/atoms/Button";
import { SA_MARKERS } from "../data/Home"; // <-- adjust path if needed

// Optional: brand-friendly default marker fix if not globally set
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Adelaide CBD (approx)
const ADELAIDE = { lat: -34.9285, lng: 138.6007, zoom: 11 };

// Simple quadrant resolver relative to CBD
function regionOf(m) {
  const dy = m.lat - ADELAIDE.lat;
  const dx = m.lng - ADELAIDE.lng;
  const absDy = Math.abs(dy);
  const absDx = Math.abs(dx);
  if (absDy < 0.03 && absDx < 0.03) return "CBD";
  if (absDy >= absDx) return dy > 0 ? "North" : "South";
  return dx > 0 ? "East" : "West";
}

// Distance (km) Haversine
function km(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return Math.round(R * c * 10) / 10;
}

function FlyTo({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo([center.lat, center.lng], zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function Location() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // selected suburb marker
  const [activeRegion, setActiveRegion] = useState("All");

  // Suggestions list from your markers
  const suburbs = useMemo(() => SA_MARKERS.map((m) => m.name).sort(), []);

  // Filter by region
  const markersWithRegion = useMemo(
    () => SA_MARKERS.map((m) => ({ ...m, region: regionOf(m) })),
    []
  );

  const regions = ["All", "CBD", "North", "South", "East", "West"];

  const filtered = useMemo(() => {
    let list = markersWithRegion;
    if (activeRegion !== "All") list = list.filter((m) => m.region === activeRegion);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return list;
  }, [markersWithRegion, activeRegion, query]);

  // When user chooses an exact suburb from datalist, select closest marker by exact name match
  useEffect(() => {
    const exact = markersWithRegion.find((m) => m.name.toLowerCase() === query.toLowerCase());
    if (exact) {
      setSelected(exact);
      // also set region chip to match (optional)
      setActiveRegion("All");
    }
  }, [query, markersWithRegion]);

  // Build a distance-sorted list if a suburb is selected
  const sortedByDistance = useMemo(() => {
    if (!selected) return filtered;
    const from = { lat: selected.lat, lng: selected.lng };
    return [...filtered].sort(
      (a, b) => km(from, a) - km(from, b)
    );
  }, [filtered, selected]);

  return (
    <div className="text-slate-800">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
        <div className="absolute inset-0 bg-dot-grid text-brand-navy/10 pointer-events-none" />
        <div className="container-app relative z-10 py-10">
          <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full" />
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold italic text-brand-navy">
            Service Areas — Adelaide & Surrounds
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            We come to homes and businesses across metropolitan Adelaide and nearby suburbs. 
            Choose your suburb to view the nearest technician.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <Section>
        <div className="container-app grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: Controls + List */}
          <div>
            {/* Search + Chips */}
            <div className="rounded-2xl border bg-white p-4 md:p-5">
              <div className="grid gap-3">
                <label className="text-sm text-slate-700">
                  Find your suburb
                  <input
                    list="sa-suburbs"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60"
                    placeholder="e.g., Glenelg, Norwood, Prospect…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <datalist id="sa-suburbs">
                    {suburbs.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </label>

                <div className="flex flex-wrap gap-2 pt-1">
                  {regions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRegion(r)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition
                        ${activeRegion === r ? "bg-brand-blue text-white border-brand-blue" : "bg-white hover:bg-slate-50"}`}
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    onClick={() => { setQuery(""); setSelected(null); setActiveRegion("All"); }}
                    className="ml-auto px-3 py-1.5 text-xs rounded-md border hover:bg-slate-50"
                    title="Clear filters"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="mt-6">
              <H2 className="text-lg">Nearby & Covered Suburbs</H2>
              <p className="muted text-sm">
                {selected ? (
                  <>Sorted by distance from <span className="font-medium">{selected.name}</span>.</>
                ) : (
                  <>Select a suburb or region to refine.</>
                )}
              </p>

              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {sortedByDistance.map((m) => (
                  <div
                    key={`${m.name}-${m.lat}-${m.lng}`}
                    className="rounded-xl border bg-white p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-brand-navy">{m.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{m.region}</div>
                      </div>
                      {selected && (
                        <span className="text-xs rounded-full bg-brand-lightblue/35 text-brand-blue px-2 py-0.5">
                          {km({ lat: selected.lat, lng: selected.lng }, m)} km
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="text-xs px-3 py-1.5"
                        onClick={() => setSelected(m)}
                        title="Show on map"
                      >
                        View on map
                      </Button>
                      <a
                        className="text-xs font-medium underline text-brand-blue hover:text-brand-lightblue"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Directions
                      </a>
                    </div>
                  </div>
                ))}
                {sortedByDistance.length === 0 && (
                  <div className="text-sm text-slate-600">
                    No suburbs match your filters. Try another region or clear filters.
                  </div>
                )}
              </div>

              {/* CTA band */}
              <div className="mt-8 rounded-2xl overflow-hidden bg-brand-navy text-white p-6 relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-lightblue" />
                <div className="font-semibold italic">Need help today?</div>
                <p className="text-white/80 text-sm mt-1">
                  Same-day bookings available across Adelaide.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href="/contact" className="rounded-md bg-white text-brand-navy px-4 py-2 text-sm font-semibold hover:bg-slate-100">
                    Contact Us
                  </a>
                  <a href="tel:1300551350" className="rounded-md border border-white px-4 py-2 text-sm font-semibold hover:bg-white/10">
                    Call 1300 551 350
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Map */}
          <div className="lg:sticky lg:top-24 h-[360px] lg:h-[700px] rounded-2xl overflow-hidden border bg-white">
            <MapContainer
              center={[ADELAIDE.lat, ADELAIDE.lng]}
              zoom={ADELAIDE.zoom}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selected && <FlyTo center={{ lat: selected.lat, lng: selected.lng }} zoom={13} />}
              {(selected ? markersWithRegion : filtered).map((m) => (
                <Marker
                  key={`${m.name}-${m.lat}-${m.lng}`}
                  position={[m.lat, m.lng]}
                  eventHandlers={{
                    click: () => setSelected(m),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-slate-600">{m.region}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          className="text-xs underline"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Directions
                        </a>
                        <button
                          className="text-xs underline"
                          onClick={() => setSelected(m)}
                        >
                          Center here
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </Section>
    </div>
  );
}
