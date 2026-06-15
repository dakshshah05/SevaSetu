import { useState } from "react";
import { createPortal } from "react-dom";
import { ShieldAlert, Plus, MapPin, Clock, Check, Sparkles } from "lucide-react";

export default function SOS({
  user,
  sosList,
  onBroadcastSOS,
  onResolveSOS
}) {
  const [sosModal, setSosModal] = useState(false);
  const [sosForm, setSosForm] = useState({ title: "", description: "", severity: "high", location: "" });

  const handleSOSSubmit = (e) => {
    e.preventDefault();
    onBroadcastSOS(sosForm.title, sosForm.description, sosForm.severity, sosForm.location);
    setSosModal(false);
    setSosForm({ title: "", description: "", severity: "high", location: "" });
  };

  const activeSOS = sosList.filter(s => s.status === "active");
  const resolvedSOS = sosList.filter(s => s.status === "resolved");

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldAlert style={{ color: "var(--color-green-dark)" }} />
          <h3>Emergency SOS Disaster Relief Coordinates</h3>
        </div>
        <button className="btn" onClick={() => setSosModal(true)} style={{ backgroundColor: "var(--color-green-dark)", color: "var(--color-beige-light)", fontWeight: "bold" }}>
          <Plus size={14} style={{ marginRight: "4px" }} /> Broadcast New SOS
        </button>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Report critical situations requiring urgent supply drops, medicine dispatch, or emergency rescue. Active coordinates will alert nearby NGOs and volunteers instantly.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "10px" }} className="responsive-sos-grid">
        {/* Active Emergency Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4 style={{ color: "var(--color-green-dark)", borderBottom: "2px solid var(--color-green-medium)", paddingBottom: "6px" }}>
            🔴 Active Alerts ({activeSOS.length})
          </h4>
          {activeSOS.length === 0 ? (
            <div style={{ background: "rgba(231, 225, 177, 0.2)", padding: "24px", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px dashed var(--color-beige-dark)" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No active SOS emergency broadcasts in the area.</p>
            </div>
          ) : (
            activeSOS.map(sos => (
              <div key={sos.id} className="card sos-pulse-card" style={{ background: "rgba(231, 225, 177, 0.4)", border: "1px solid var(--color-green-medium)", display: "flex", flexDirection: "column", gap: "10px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-pending" style={{ borderColor: "var(--color-green-dark)", color: "var(--color-green-dark)", fontWeight: "bold" }}>
                    {sos.severity.toUpperCase()} SEVERITY
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={10} /> {new Date(sos.date).toLocaleTimeString()}
                  </span>
                </div>
                <h4 style={{ color: "var(--color-green-dark)" }}>{sos.title}</h4>
                <p style={{ fontSize: "13px", lineHeight: "1.4" }}>{sos.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--color-green-dark)", fontWeight: "600" }}>
                  <MapPin size={12} />
                  <span>📍 {sos.location}</span>
                </div>
                {(user?.role === "ngo" || user?.role === "volunteer") && (
                  <button className="btn btn-primary" onClick={() => onResolveSOS(sos.id)} style={{ width: "100%", padding: "6px 12px", fontSize: "12px", marginTop: "6px" }}>
                    <Check size={12} style={{ marginRight: "4px" }} /> Mark Resolved / Dispatched
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Resolved Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4 style={{ color: "var(--text-secondary)", borderBottom: "2px solid var(--color-beige-dark)", paddingBottom: "6px" }}>
            🟢 Resolved Relief Drives ({resolvedSOS.length})
          </h4>
          {resolvedSOS.length === 0 ? (
            <div style={{ background: "rgba(231, 225, 177, 0.2)", padding: "24px", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px dashed var(--color-beige-dark)" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No resolved emergency history yet.</p>
            </div>
          ) : (
            resolvedSOS.slice(0, 5).map(sos => (
              <div key={sos.id} style={{ background: "rgba(231, 225, 177, 0.2)", border: "1px solid var(--color-beige-dark)", display: "flex", flexDirection: "column", gap: "10px", padding: "16px", opacity: 0.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-completed">
                    Resolved
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                    {new Date(sos.date).toLocaleDateString()}
                  </span>
                </div>
                <h5 style={{ color: "var(--text-secondary)", textDecoration: "line-through" }}>{sos.title}</h5>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{sos.description}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-secondary)" }}>
                  <MapPin size={10} />
                  <span>{sos.location}</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--color-green-dark)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={10} /> Aid dispatched successfully.
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Broadcast SOS Modal */}
      {sosModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Broadcast Emergency SOS Alert</h3>
              <button className="modal-close" onClick={() => setSosModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSOSSubmit}>
                <div className="form-group">
                  <label>Emergency Category / Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Flooded street rescue / Elder medical evacuation" 
                    value={sosForm.title}
                    onChange={e => setSosForm({...sosForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Detailed Description of Needs</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. 15 seniors stuck on the second floor without fresh drinking water and insulin. Boat or heavy vehicle needed." 
                    value={sosForm.description}
                    onChange={e => setSosForm({...sosForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Severity Level</label>
                  <select 
                    className="form-control"
                    value={sosForm.severity}
                    onChange={e => setSosForm({...sosForm, severity: e.target.value})}
                  >
                    <option value="high">High Severity (Disruption of essentials)</option>
                    <option value="critical">Critical Emergency (Immediate life threat)</option>
                    <option value="moderate">Moderate Relief Required</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stranded Area Coordinates / Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar, near Metro Pillar 125" 
                    value={sosForm.location}
                    onChange={e => setSosForm({...sosForm, location: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-orange" style={{ fontWeight: "bold" }}>Send SOS Alert</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setSosModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
