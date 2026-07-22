import { useState, useEffect, useRef } from "react";
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw,
  Utensils
} from "lucide-react";

export default function LiveDeliveryTracker({ item, user, onClose, triggerToast }) {
  const [progress, setProgress] = useState(0.25); // 0 to 1
  const [isSimulating, setIsSimulating] = useState(true);
  const animationFrameRef = useRef(null);

  // Bezier curve route control points
  const p0 = { x: 80, y: 200 };
  const p1 = { x: 220, y: 260 };
  const p2 = { x: 380, y: 40 };
  const p3 = { x: 520, y: 80 };

  // Calculate coordinates on Bezier path
  const getCubicBezierPoint = (t, p0, p1, p2, p3) => {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const xt = ax * (t * t * t) + bx * (t * t) + cx * t + p0.x;
    const yt = ay * (t * t * t) + by * (t * t) + cy * t + p0.y;

    return { x: xt, y: yt };
  };

  const courierPos = getCubicBezierPoint(progress, p0, p1, p2, p3);

  // Live movement animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isSimulating) {
        setProgress((prev) => {
          if (prev >= 1) return 1;
          return prev + delta * 0.035; // Advance ~3.5% per second
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSimulating]);

  // Derived tracking metrics
  const etaMinutes = Math.max(1, Math.round(14 * (1 - progress)));
  const distanceKm = (3.6 * (1 - progress)).toFixed(1);
  const courierName = item?.claimedByName || "Rahul Kumar (Volunteer)";
  const sourceName = item?.restaurantName || "Golden Spoon Restaurant";
  const sourceLocation = item?.location || "Koramangala 5th Block";
  const destinationName = "Indiranagar Community Shelter";
  const destinationLocation = "Indiranagar 100ft Road";

  const getStatusStep = () => {
    if (progress < 0.15) return 1; // Picked Up
    if (progress < 0.92) return 2; // En Route
    return 3; // Delivered
  };

  const currentStep = getStatusStep();

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
          gap: "20px",
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
                width: "36px", 
                height: "36px", 
                borderRadius: "12px", 
                background: "linear-gradient(135deg, #22c55e, #15803d)", 
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "2px 2px 6px rgba(0,0,0,0.15)"
              }}
            >
              <Navigation size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "var(--color-green-dark)" }}>
                Live Delivery Tracker <span style={{ fontSize: "10px", background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: "10px", verticalAlign: "middle", textTransform: "uppercase", fontWeight: "800" }}>● LIVE</span>
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                Order #{item?.id || "FOOD-8921"} • {item?.quantity || "30"} Meals Redistribution Route
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
              <span style={{ fontSize: "11px", opacity: 0.85, textTransform: "uppercase", fontWeight: "700" }}>Estimated Arrival</span>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#ffffff" }}>
                {progress >= 0.95 ? "Arrived at Shelter!" : `${etaMinutes} Mins`}
              </h2>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", opacity: 0.85, textTransform: "uppercase", fontWeight: "700" }}>Distance Remaining</span>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#86efac" }}>
              {progress >= 0.95 ? "0.0 km" : `${distanceKm} km`}
            </div>
          </div>
        </div>

        {/* Interactive SVG Route Map Canvas */}
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            borderRadius: "24px", 
            background: "#eef2e6",
            boxShadow: "inset 4px 4px 10px rgba(180, 172, 130, 0.35), inset -4px -4px 10px #ffffff",
            overflow: "hidden"
          }}
        >
          <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" width="100%" height="auto" style={{ overflow: "hidden" }}>
            {/* Map Grid / City Streets Background Pattern */}
            <defs>
              <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(48, 109, 41, 0.06)" strokeWidth="1" />
              </pattern>
              
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              <filter id="bikeShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
              </filter>
            </defs>

            <rect width="600" height="280" fill="url(#cityGrid)" />

            {/* Stylized River & Park Paths */}
            <path d="M 0 140 Q 200 180 400 90 T 600 160" fill="none" stroke="#dcfce7" strokeWidth="24" opacity="0.6" />
            <path d="M 120 0 Q 180 140 280 280" fill="none" stroke="#fef3c7" strokeWidth="18" opacity="0.5" />

            {/* Delivery Route Path */}
            <path 
              d={`M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} 
              fill="none" 
              stroke="rgba(48, 109, 41, 0.2)" 
              strokeWidth="6" 
              strokeLinecap="round" 
            />

            <path 
              d={`M ${p0.x},${p0.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} 
              fill="none" 
              stroke="url(#routeGradient)" 
              strokeWidth="5" 
              strokeDasharray="8 6" 
              strokeLinecap="round" 
            />

            {/* Source Pin: Restaurant */}
            <g transform={`translate(${p0.x}, ${p0.y})`}>
              <circle r="14" fill="#22c55e" opacity="0.25" />
              <circle r="8" fill="#15803d" />
              <circle r="4" fill="#ffffff" />
              <text x="0" y="24" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--color-green-dark)">
                📍 {sourceName}
              </text>
              <text x="0" y="36" textAnchor="middle" fontSize="8" fill="var(--text-secondary)">
                (Source Pickup)
              </text>
            </g>

            {/* Destination Pin: Shelter */}
            <g transform={`translate(${p3.x}, ${p3.y})`}>
              <circle r="14" fill="#f59e0b" opacity="0.25" />
              <circle r="8" fill="#b45309" />
              <circle r="4" fill="#ffffff" />
              <text x="0" y="-14" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--color-green-dark)">
                🏢 {destinationName}
              </text>
              <text x="0" y="-26" textAnchor="middle" fontSize="8" fill="var(--text-secondary)">
                (Destination Shelter)
              </text>
            </g>

            {/* Animated Delivery Bike Courier Marker */}
            <g transform={`translate(${courierPos.x}, ${courierPos.y})`} filter="url(#bikeShadow)">
              {/* Radar pulse ring */}
              <circle r="18" fill="rgba(34, 197, 94, 0.3)">
                <animate attributeName="r" values="12;22;12" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
              
              {/* Courier vehicle bubble */}
              <circle r="12" fill="#15803d" stroke="#ffffff" strokeWidth="2" />
              
              {/* Bike Icon simulated in SVG */}
              <path 
                d="M -5 0 L 0 -5 L 5 0 L 0 5 Z" 
                fill="#ffffff" 
              />

              {/* Floating Name Badge above Courier */}
              <g transform="translate(0, -22)">
                <rect x="-55" y="-12" width="110" height="18" rx="9" fill="#0d530e" opacity="0.9" />
                <text x="0" y="0" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff">
                  🚴 {courierName.split(" ")[0]} (24 km/h)
                </text>
              </g>
            </g>
          </svg>

          {/* Map Simulation Control Overlay */}
          <div style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", gap: "8px" }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsSimulating(!isSimulating)}
              style={{ padding: "6px 12px", fontSize: "11px", gap: "6px", background: "rgba(255, 255, 255, 0.9)" }}
            >
              {isSimulating ? <Pause size={12} /> : <Play size={12} />}
              {isSimulating ? "Pause Track" : "Resume Track"}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setProgress(0.0)}
              style={{ padding: "6px 10px", fontSize: "11px", background: "rgba(255, 255, 255, 0.9)" }}
              title="Reset Courier to Pickup"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Live Delivery Stepper */}
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", padding: "10px 0" }}>
          {/* Progress Connecting Line */}
          <div style={{ position: "absolute", top: "24px", left: "10%", right: "10%", height: "4px", background: "rgba(48, 109, 41, 0.15)", zIndex: 1 }}>
            <div 
              style={{ 
                height: "100%", 
                width: `${Math.min(100, Math.max(0, progress * 100))}%`, 
                background: "linear-gradient(90deg, #22c55e, #15803d)", 
                transition: "width 0.2s linear" 
              }} 
            />
          </div>

          {/* Step 1: Claimed */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#15803d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
              <CheckCircle2 size={16} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-green-dark)" }}>1. Claimed</span>
          </div>

          {/* Step 2: Picked Up */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: currentStep >= 2 ? "#15803d" : "var(--color-beige-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
              <Utensils size={16} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: currentStep >= 2 ? "var(--color-green-dark)" : "var(--text-secondary)" }}>2. Picked Up</span>
          </div>

          {/* Step 3: En Route */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: currentStep >= 2 && progress < 0.95 ? "#f59e0b" : currentStep === 3 ? "#15803d" : "var(--color-beige-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
              <Truck size={16} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: currentStep >= 2 ? "var(--color-green-dark)" : "var(--text-secondary)" }}>3. En Route</span>
          </div>

          {/* Step 4: Delivered */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 2 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: progress >= 0.95 ? "#15803d" : "var(--color-beige-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
              <MapPin size={16} />
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: progress >= 0.95 ? "var(--color-green-dark)" : "var(--text-secondary)" }}>4. Delivered</span>
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
                  <ShieldCheck size={10} /> Verified Courier
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
