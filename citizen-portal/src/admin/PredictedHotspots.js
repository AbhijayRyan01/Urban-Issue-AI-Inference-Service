import { useEffect, useState } from "react";
import axios from "axios";
import { CircleMarker, Popup } from "react-leaflet";

function PredictedHotspots() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/analytics/hotspots",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHotspots(res.data);
      } catch (err) {
        console.error("Failed to load predicted hotspots", err);
      }
    };

    fetchHotspots();
  }, []);

  return (
    <>
      {hotspots.map((h, idx) => (
        <CircleMarker
          key={idx}
          center={[h.lat, h.lng]}
          radius={12}
          pathOptions={{ color: "red", fillOpacity: 0.6 }}
        >
          <Popup>Predicted hotspot</Popup>
        </CircleMarker>
      ))}
    </>
  );
}

export default PredictedHotspots;
