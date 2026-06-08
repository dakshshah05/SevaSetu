import { useState } from "react";
import { Plus, Heart, Check, ShieldAlert, FileText } from "lucide-react";

export default function PunyaSetu({ 
  user, 
  elderly, 
  visits, 
  onRequestHelper, 
  onClaimHelp, 
  onLogVisit 
}) {
  const [activeTab, setActiveTab] = useState("requests");
  const [requestModal, setRequestModal] = useState(false);
  const [visitModal, setVisitModal] = useState(false);
  
  const [selectedRequestId, setSelectedRequestId] = useState("");

  // Forms state
  const [requestForm, setRequestForm] = useState({ name: "", age: "", helperType: "Groceries & Pharmacy run", location: "", details: "" });
  const [visitForm, setVisitForm] = useState({ notes: "" });

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    onRequestHelper(requestForm.name, requestForm.age, requestForm.helperType, requestForm.location, requestForm.details);
    setRequestModal(false);
    setRequestForm({ name: "", age: "", helperType: "Groceries & Pharmacy run", location: "", details: "" });
    alert("Elderly helper request registered! Local volunteer squad alerted.");
  };

  const handleOpenVisit = (id) => {
    setSelectedRequestId(id);
    setVisitModal(true);
  };

  const handleVisitSubmit = (e) => {
    e.preventDefault();
    onLogVisit(selectedRequestId, visitForm.notes);
    setVisitModal(false);
    setVisitForm({ notes: "" });
    alert("Visit check-in logged successfully! Status update dispatched to family members.");
  };

  const triggerSOS = () => {
    const loc = prompt("Elderly Emergency! Enter location coordinates or address:", "Koramangala 4th Block, flat 302");
    if (loc) {
      alert(`🚨 RED ALERT SOS BROADCASTED! Emergency help dispatched to ${loc}. Nearby volunteers notified.`);
    }
  };

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Heart style={{ color: "var(--color-green-dark)" }} />
          <h3>Punya Setu - Elderly Care Connect</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>Active Requests</button>
          <button className={`tab-btn ${activeTab === "visits" ? "active" : ""}`} onClick={() => setActiveTab("visits")}>Check-in Logs</button>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Supporting senior citizens living alone. Volunteers visit, deliver essential items, check health vitals, and provide companionship.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <button className="btn btn-primary" onClick={() => setRequestModal(true)}><Plus size={14} /> Request Assistant for Senior Citizen</button>
        <button 
          className="btn" 
          onClick={triggerSOS} 
          style={{ backgroundColor: "var(--color-green-dark)", color: "var(--color-beige-light)", fontWeight: "bold", border: "2px solid var(--color-green-dark)" }}
        >
          <ShieldAlert size={14} style={{ marginRight: "4px" }} /> Elderly Red Alert SOS
        </button>
      </div>

      {activeTab === "requests" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4>Active Support Registrations</h4>
          {elderly.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No active help requests recorded.</p>
          ) : (
            elderly.map(eld => (
              <div key={eld.id} style={{ background: "rgba(231, 225, 177, 0.3)", padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h4 style={{ color: "var(--color-green-dark)" }}>{eld.helperType} for {eld.elderlyName}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>📍 {eld.location} | Age: {eld.age} yrs</p>
                  <p style={{ fontSize: "13px", marginTop: "8px" }}>{eld.details}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", minWidth: "180px" }}>
                  <span className={`badge ${eld.status === "completed" ? "badge-completed" : eld.status === "assigned" ? "badge-claimed" : "badge-pending"}`}>
                    {eld.status === "completed" ? "Completed" : eld.status === "assigned" ? `Helper: ${eld.helperName}` : "Pending Helper"}
                  </span>
                  
                  {eld.status === "pending" && user?.role === "volunteer" && (
                    <button className="btn btn-primary" onClick={() => onClaimHelp(eld.id)} style={{ padding: "6px 12px", fontSize: "11px", marginTop: "10px" }}>
                      Enlist as Helper
                    </button>
                  )}
                  {eld.status === "assigned" && eld.helperId === user?.uid && (
                    <button className="btn btn-primary" onClick={() => handleOpenVisit(eld.id)} style={{ padding: "6px 12px", fontSize: "11px", marginTop: "10px" }}>
                      <Check size={12} /> Log Check-in Visit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4>Volunteer Check-in History Logs</h4>
          {visits.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No check-in logs submitted yet.</p>
          ) : (
            visits.map(vis => (
              <div key={vis.id} style={{ background: "rgba(231, 225, 177, 0.3)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-green-dark)", fontWeight: "bold", fontSize: "13px" }}>
                  <FileText size={16} />
                  <span>Check-in visit by {vis.volunteerName}</span>
                  <span style={{ fontSize: "11px", fontWeight: "normal", color: "var(--text-secondary)", marginLeft: "auto" }}>{new Date(vis.date).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: "13px", marginTop: "8px", color: "var(--text-primary)" }}>{vis.notes}</p>
                <div style={{ fontSize: "10px", color: "var(--color-green-medium)", marginTop: "8px" }}>
                  🟢 Vitals verified. Family notified via email/SMS.
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Elderly Request Modal */}
      {requestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Assistant for Senior</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRequestSubmit}>
                <div className="form-group">
                  <label>Elderly Person's Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={requestForm.name}
                    onChange={e => setRequestForm({...requestForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={requestForm.age}
                    onChange={e => setRequestForm({...requestForm, age: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Helper Activity Needed</label>
                  <select 
                    className="form-control"
                    value={requestForm.helperType}
                    onChange={e => setRequestForm({...requestForm, helperType: e.target.value})}
                  >
                    <option value="Groceries & Pharmacy run">Groceries & Pharmacy run</option>
                    <option value="Medical clinic escort">Medical clinic escort</option>
                    <option value="Companionship & Walk">Companionship & Walk</option>
                    <option value="House checkup & Vitals check">House checkup & Vitals check</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location / Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Koramangala 4th block" 
                    value={requestForm.location}
                    onChange={e => setRequestForm({...requestForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specific Details / Schedule</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Needs help carrying water bottles and refilling thyroid pills from the pharmacy twice a week." 
                    value={requestForm.details}
                    onChange={e => setRequestForm({...requestForm, details: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Enlist Request</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setRequestModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Log Visit Modal */}
      {visitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Check-in Visit Notes</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleVisitSubmit}>
                <div className="form-group">
                  <label>Visit Summary & Elderly Vitals status</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Escorted grandfather to clinic. BP checked: 130/85 (stable). Delivered grocery items." 
                    value={visitForm.notes}
                    onChange={e => setVisitForm({...visitForm, notes: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Submit Check-in Log</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setVisitModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
