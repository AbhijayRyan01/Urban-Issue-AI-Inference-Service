import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import PredictedHotspots from "./PredictedHotspots";

function HeatLayer({ issues }) {
  const map = useMap();

  useEffect(() => {
    if (!issues || issues.length === 0) return;

    const points = issues
      .filter(issue => issue.location)
      .map(issue => [
        issue.location.lat,
        issue.location.lng,
        issue.prediction?.severity || 1,
      ]);

    if (points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 18,
      maxZoom: 17,
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [issues, map]);

  return null;
}

function HeatmapView({ issues }) {
  const center = [12.9716, 77.5946]; // Bangalore example

  return (
    <div style={{ height: "450px", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Raw issue density heatmap */}
        <HeatLayer issues={issues} />

        {/* 🔥 ML-predicted future hotspots */}
        <PredictedHotspots />
      </MapContainer>
    </div>
  );
}

export default HeatmapView;
