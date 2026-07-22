import { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Utensils,
  Radio,
  Zap,
  CheckCircle2
} from "lucide-react";
import { DB } from "../db";

export default function LiveDeliveryTracker({ item, user, onClose, triggerToast }) {
  // Delivery Progress along route (0.0 = Source Pickup, 1.0 = Destination Shelter)
  const [progress, setProgress] = useState(0.40); // Default ~40% en route for clean demo
  const [isBroadcasting, setIsBroadcasting] = useState(true);

  // Fixed Source (Restaurant) & Destination (Shelter) Earth Coordinates in Bengaluru
  const sourceCoords = {
    name: item?.restaurantName || "Golden Spoon Restaurant",
    address: item?.location || "Koramangala 5th Block, Bengaluru",
    lat: 12.9352,
    lng: 77.6244
  };

  const destCoords = {
    name: "Indiranagar Community Shelter",
    address: "100ft Road, Indiranagar, Bengaluru",
    lat: 12.9610,
    lng: 77.6387
  };

  // Compute Courier Position strictly projected along the delivery route
  const courierCoords = {
    lat: parseFloat((sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * progress).toFixed(5)),
    lng: parseFloat((sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * progress).toFixed(5)),
    speed: 24
  };

  // Haversine Distance Formula (Physical Earth Distance in km)
  const calculateHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  };

  const totalRouteKm = calculateHaversine(sourceCoords.lat, sourceCoords.lng, destCoords.lat, destCoords.lng);
  const distanceRemaining = parseFloat((totalRouteKm * (1 - progress)).toFixed(2));
  const etaMinutes = Math.max(1, Math.round((distanceRemaining / (courierCoords.speed || 20)) * 60));

  // --- REAL-TIME MOVEMENT ANIMATION LOOP ALONG THE DELIVERY ROUTE ---
  useEffect(() => {
    let interval = null;
    if (isBroadcasting) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 0.98) return 1.0;
          const next = prev + 0.015;
          const clamped = Math.min(1.0, next);

          // Broadcast real location to database pub-sub
          const updatedLat = sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * clamped;
          const updatedLng = sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * clamped;
          if (item?.id) {
            DB.updateDeliveryLocation(item.id, updatedLat, updatedLng, 24);
          }

          return clamped;
        });
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBroadcasting, item?.id]);

  // Optional HTML5 Device GPS Listener (Clamped to route to avoid 17 km off-route triangular jumps)
  useEffect(() => {
    let watchId = null;

    if ("geolocation" in navigator && isBroadcasting) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Calculate distance from device position to source
          const distFromSource = calculateHaversine(sourceCoords.lat, sourceCoords.lng, latitude, longitude);
          
          // If device is reasonably near the delivery route corridor (within 5 km), advance progress smoothly
          if (distFromSource <= 5.0) {
            const calculatedProgress = Math.min(1.0, Math.max(0.05, distFromSource / totalRouteKm));
            setProgress(calculatedProgress);
          }
        },
        () => {
          // Fallback notice ignored silently
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isBroadcasting]);

  // --- LEAFLET INTERACTIVE MAP TILES ---
  useEffect(() => {
    let cssLink = document.getElementById("leaflet-css");
    if (!cssLink) {
      cssLink = document.createElement("link");
      cssLink.id = "leaflet-css";
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);
    }

    let map = null;

    const initMap = () => {
      if (!window.L) return;

      const container = window.L.DomUtil.get("live-leaflet-map-canvas");
      if (container) {
        container._leaflet_id = null;
      }

      map = window.L.map("live-leaflet-map-canvas", {
        zoomControl: true,
        attributionControl: false
      }).setView([courierCoords.lat, courierCoords.lng], 14);

      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(map);

      // Source Restaurant Pin
      const sourceIcon = window.L.divIcon({
        html: `<div style="background:#22c55e; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.3)">🏪</div>`,
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      window.L.marker([sourceCoords.lat, sourceCoords.lng], { icon: sourceIcon })
        .addTo(map)
        .bindPopup(`<b>${sourceCoords.name}</b><br/>${sourceCoords.address}`);

      // Destination Shelter Pin
      const destIcon = window.L.divIcon({
        html: `<div style="background:#f59e0b; color:#fff; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:15px; border:2px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.3)">🏢</div>`,
        className: "",
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      window.L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>${destCoords.name}</b><br/>${destCoords.address}`);

      // Real Volunteer Courier GPS Pin (Positioned strictly along delivery route)
      const courierIcon = window.L.divIcon({
        html: `<div style="background:#0d530e; color:#fff; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid #86efac; box-shadow:0 0 14px rgba(34, 197, 94, 0.9)">🚴</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      window.L.marker([courierCoords.lat, courierCoords.lng], { icon: courierIcon })
        .addTo(map)
        .bindPopup(`<b>${item?.claimedByName || "Rahul Kumar"}</b><br/>En Route (${Math.round(progress * 100)}%)`);

      // 1. Solid Green Covered Route Segment (Source ➔ Courier)
      const coveredPath = [
        [sourceCoords.lat, sourceCoords.lng],
        [courierCoords.lat, courierCoords.lng]
      ];
      window.L.polyline(coveredPath, {
        color: "#22c55e",
        weight: 6,
        lineCap: "round"
      }).addTo(map);

      // 2. Dashed Amber Remaining Route Segment (Courier ➔ Destination)
      const remainingPath = [
        [courierCoords.lat, courierCoords.lng],
        [destCoords.lat, destCoords.lng]
      ];
      const remainingLine = window.L.polyline(remainingPath, {
        color: "#f59e0b",
        weight: 5,
        dashArray: "8, 8",
        lineCap: "round"
      }).addTo(map);

      // Fit map bounds cleanly around the 2-point delivery corridor
      const fullCorridor = window.L.polyline([
        [sourceCoords.lat, sourceCoords.lng],
        [destCoords.lat, destCoords.lng]
      ]);
      map.fitBounds(fullCorridor.getBounds(), { padding: [40, 40] });
    };

    const timer = setTimeout(() => {
      if (window.L) {
        initMap();
      } else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map) {
        map.remove();
      }
    };
  }, [courierCoords.lat, courierCoords.lng, progress]);

  const courierName = item?.claimedByName || "Rahul Kumar (Volunteer)";

  return (
    <div className="modal-overlay" style={{ backdropFilter: "blur(8px)", zIndex: 1000 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: "760px", 
          width: "95%", 
          padding: "24px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px",
          borderRadius: "32px",
          background: "linear-gradient(135deg, var(--color-beige-light) 0%, #f7f1db 100%)",
          boxShadow: "12px 12px 32px rgba(180, 172, 130, 0.4), -12px -12px 32px #ffffff"
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid rgba(48, 109, 41, 0.1)", paddingBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div 
              style={{ 
                width: "38px", 
                height: "38px", 
                borderRadius: "12px", 
                background: "linear-gradient(135deg, #22c55e, #15803d)", 
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 6px rgba(0,0,0,0.15)"
              }}
            >
              <Navigation size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--color-green-dark)" }}>
                Track Delivery <span style={{ fontSize: "10px", background: "#22c55e", color: "#fff", padding: "2px 8px", borderRadius: "10px", verticalAlign: "middle", textTransform: "uppercase", fontWeight: "800" }}>● LIVE</span>
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                Order #{item?.id || "FOOD-8921"} • {item?.quantity || "30 Meals"} Redistribution Route
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ width: "32px", height: "32px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Hardware Telemetry Capsule */}
        <div 
          style={{ 
            display: "flex", 
            justify: "space-between", 
            alignItems: "center", 
            padding: "10px 16px", 
            background: "rgba(34, 197, 94, 0.12)", 
            border: "1px solid rgba(34, 197, 94, 0.3)", 
            borderRadius: "16px",
            fontSize: "11px",
            fontWeight: "600",
            color: "var(--color-green-dark)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Radio size={14} className="animate-pulse" style={{ color: "#22c55e" }} />
            <span>GPS Tracking: <strong>Active ({Math.round(progress * 100)}% Completed)</strong></span>
          </div>

          <div style={{ display: "flex", gap: "14px" }}>
            <span>Lat: <strong>{courierCoords.lat.toFixed(5)}° N</strong></span>
            <span>Lng: <strong>{courierCoords.lng.toFixed(5)}° E</strong></span>
            <span>Speed: <strong>{courierCoords.speed} km/h</strong></span>
          </div>
        </div>

        {/* Live ETA Banner & Distance Badge */}
        <div 
          className="card" 
          style={{ 
            display: "flex", 
            justify: "space-between", 
            alignItems: "center", 
            padding: "16px 24px", 
            background: "linear-gradient(135deg, #15803d 0%, #0d530e 100%)", 
            color: "#ffffff",
            borderRadius: "20px",
            boxShadow: "6px 6px 16px rgba(13, 83, 14, 0.3), -4px -4px 10px #ffffff"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.15)", borderRadius: "14px" }}>
              <Clock size={24} />
            </div>
            <div>
              <span style={{ fontSize: "11px", opacity: 0.85, textTransform: "uppercase", fontWeight: "700" }}>Estimated Arrival Time</span>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#ffffff" }}>
                {progress >= 0.98 ? "Arrived at Shelter!" : `${etaMinutes} Mins`}
              </h2>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", opacity: 0.85, textTransform: "uppercase", fontWeight: "700" }}>Distance Remaining</span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#86efac" }}>
              {progress >= 0.98 ? "0.0 km" : `${distanceRemaining} km remaining`}
            </div>
          </div>
        </div>

        {/* Leaflet Real-World Interactive OpenStreetMap Canvas */}
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            height: "280px", 
            borderRadius: "24px", 
            boxShadow: "inset 4px 4px 10px rgba(180, 172, 130, 0.35), inset -4px -4px 10px #ffffff",
            overflow: "hidden"
          }}
        >
          <div id="live-leaflet-map-canvas" style={{ width: "100%", height: "100%", borderRadius: "24px" }} />

          {/* Device GPS Stream Action Bar */}
          <div style={{ position: "absolute", bottom: "12px", right: "12px", zIndex: 500 }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsBroadcasting(!isBroadcasting);
                triggerToast(isBroadcasting ? "Tracking stream paused." : "Resuming live delivery tracking...");
              }}
              style={{ padding: "8px 14px", fontSize: "11px", gap: "6px", background: "rgba(255, 255, 255, 0.95)", boxShadow: "2px 2px 8px rgba(0,0,0,0.2)" }}
            >
              <Zap size={13} style={{ color: isBroadcasting ? "#22c55e" : "#ef4444" }} />
              {isBroadcasting ? "Pause Tracking" : "Resume Tracking"}
            </button>
          </div>
        </div>

        {/* Courier Volunteer Profile & Direct Action Bar */}
        <div 
          className="card" 
          style={{ 
            display: "flex", 
            justify: "space-between", 
            alignItems: "center", 
            padding: "16px 20px", 
            background: "var(--color-beige-light)", 
            boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.3), inset -3px -3px 6px #ffffff",
            borderRadius: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div 
              style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "50%", 
                background: "linear-gradient(135deg, #306d29, #0d530e)", 
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "800"
              }}
            >
              {courierName.charAt(0)}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>{courierName}</h4>
                <span style={{ fontSize: "9px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", gap: "3px" }}>
                  <ShieldCheck size={10} /> Verified Volunteer
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                Vehicle: Ather 450X EV Scooter (KA 01 EA 4092)
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => triggerToast(`Calling volunteer courier ${courierName} at +91 98765 43210...`)}
              style={{ padding: "8px 14px", fontSize: "12px", gap: "6px" }}
            >
              <Phone size={14} /> Call Courier
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => triggerToast(`Chat channel opened with ${courierName}.`)}
              style={{ padding: "8px 14px", fontSize: "12px", gap: "6px" }}
            >
              <MessageSquare size={14} /> Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
