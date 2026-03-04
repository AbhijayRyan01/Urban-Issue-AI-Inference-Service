import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ── Fix default Leaflet marker icons ─────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ── Priority → marker colour ──────────────────────────────────────────────────
const PRIORITY_COLORS = {
  Emergency: "#dc2626", // red
  High:      "#f97316", // orange
  Medium:    "#f59e0b", // amber
  Low:       "#10b981", // green
};

function makeIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.27 21.73 0 14 0z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="#fff" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize:   [28, 36],
    iconAnchor: [14, 36],
    popupAnchor:[0, -36],
  });
}

// ── Auto-fit map to all markers ───────────────────────────────────────────────
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLatLng(issue) {
  // Shape 1: issue.location.lat / issue.location.lng  (object)
  if (issue.location?.lat != null && issue.location?.lng != null) {
    return [parseFloat(issue.location.lat), parseFloat(issue.location.lng)];
  }
  // Shape 2: issue.lat / issue.lng  (root-level, what IssueForm sends)
  if (issue.lat != null && issue.lng != null) {
    return [parseFloat(issue.lat), parseFloat(issue.lng)];
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
function MapView({ issues }) {
  const defaultCenter = [22.5726, 88.3639]; // Kolkata

  // Build only the issues that have valid coords
  const mappable = issues
    .map(issue => ({ issue, pos: getLatLng(issue) }))
    .filter(({ pos }) => pos !== null && !isNaN(pos[0]) && !isNaN(pos[1]));

  const points = mappable.map(({ pos }) => pos);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit to markers */}
        <FitBounds points={points} />

        {mappable.map(({ issue, pos }) => {
          const priority = issue.prediction?.priority;
          const color    = PRIORITY_COLORS[priority] || "#6366f1";
          return (
            <Marker
              key={issue._id}
              position={pos}
              icon={makeIcon(color)}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "sans-serif", fontSize: 13 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "#0f172a" }}>
                    {issue.prediction?.issueType || "Issue"}
                  </div>
                  <div style={{ color: "#475569", marginBottom: 6 }}>{issue.description}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div><b>Severity:</b> {issue.prediction?.severity ?? "—"}</div>
                    <div>
                      <b>Priority:</b>{" "}
                      <span style={{ color, fontWeight: 700 }}>{priority ?? "—"}</span>
                    </div>
                    <div>
                      <b>Status:</b>{" "}
                      <span style={{
                        background: issue.status === "Resolved" ? "#dcfce7" : issue.status === "In Progress" ? "#dbeafe" : "#fef9c3",
                        color:      issue.status === "Resolved" ? "#15803d" : issue.status === "In Progress" ? "#1d4ed8" : "#a16207",
                        padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      }}>
                        {issue.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                      📍 {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;