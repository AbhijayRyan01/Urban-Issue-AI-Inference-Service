import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapView({ issues }) {
  const defaultCenter = [12.9716, 77.5946]; // Example: Bangalore

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => {
          if (!issue.location) return null;

          return (
            <Marker
              key={issue._id}
              position={[
                issue.location.lat,
                issue.location.lng,
              ]}
            >
              <Popup>
                <strong>{issue.prediction?.issueType}</strong>
                <br />
                {issue.description}
                <br />
                <b>Severity:</b> {issue.prediction?.severity}
                <br />
                <b>Priority:</b> {issue.prediction?.priority}
                <br />
                <b>Status:</b> {issue.status}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
