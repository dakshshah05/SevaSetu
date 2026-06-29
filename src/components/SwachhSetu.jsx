import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, MapPin, Plus, Upload } from "lucide-react";

export default function SwachhSetu({ 
  user, 
  drives, 
  onAddDrive, 
  onJoinDrive, 
  onSubmitProof, 
  onApproveProof,
  onUpgradeToVolunteer
}) {
  const [driveModal, setDriveModal] = useState(false);
  const [proofModal, setProofModal] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState("");
  
  // Form states
  const [driveForm, setDriveForm] = useState({ title: "", description: "", date: "", time: "", location: "", points: 50 });
  const [proofForm, setProofForm] = useState({ beforeUrl: "", afterUrl: "", kgCollected: 25, sqCleaned: 50 });
  
  // Local before/after toggle state for mock view
  const [photoToggles, setPhotoToggles] = useState({});

  const handleCreateDrive = (e) => {
    e.preventDefault();
    onAddDrive(driveForm.title, driveForm.description, driveForm.date, driveForm.time, driveForm.location, driveForm.points);
    setDriveModal(false);
    setDriveForm({ title: "", description: "", date: "", time: "", location: "", points: 50 });
  };

  const handleOpenProof = (id) => {
    setSelectedDriveId(id);
    setProofModal(true);
  };

  const handleCreateProof = (e) => {
    e.preventDefault();
    onSubmitProof(selectedDriveId, `${proofForm.beforeUrl || "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400"}||${proofForm.afterUrl || "https://images.unsplash.com/photo-1595275313093-f112e077189d?w=400"}||KGs Collected: ${proofForm.kgCollected}||Sq Meters: ${proofForm.sqCleaned}`);
    setProofModal(false);
    setProofForm({ beforeUrl: "", afterUrl: "", kgCollected: 25, sqCleaned: 50 });
  };

  // Cumulative impact
  let totalKgs = 120; // seed default
  let totalSq = 350; // seed default
  drives.forEach(d => {
    (d.proofs || []).forEach(p => {
      if (p.imageUrl && p.imageUrl.includes("KGs")) {
        const parts = p.imageUrl.split("||");
        const kgs = parseInt(parts[2]?.replace("KGs Collected: ", "")) || 0;
        const sq = parseInt(parts[3]?.replace("Sq Meters: ", "")) || 0;
        totalKgs += kgs;
        totalSq += sq;
      }
    });
  });

  const togglePhoto = (driveId, proofIdx) => {
    const key = `${driveId}_${proofIdx}`;
    setPhotoToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="gsap-reveal" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* 1. Impact Meter Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }} className="reveal-on-scroll">
        <div className="card card-teal" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ fontSize: "32px" }}>♻️</div>
          <div>
            <h3 style={{ fontSize: "28px", color: "var(--color-green-dark)" }}>{totalKgs} KGs</h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Waste Collected & Recycled</span>
          </div>
        </div>
        <div className="card card-violet" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ fontSize: "32px" }}>🧹</div>
          <div>
            <h3 style={{ fontSize: "28px", color: "var(--color-green-dark)" }}>{totalSq} m²</h3>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Public Area Sanitized</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "28px" }}>
        
        {/* Left Side: Drives and Proofs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div className="card card-teal">
            <div className="info-header">
              <h3>Active Swachh Bharat Drives</h3>
              {user?.role === "ngo" && (
                <button className="btn btn-primary" onClick={() => setDriveModal(true)}><Plus size={14} /> Schedule Drive</button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
              {drives.map(d => (
                <div key={d.id} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.3)", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <h4>{d.title}</h4>
                    <span className="badge badge-pending">{d.pointsReward} Points Reward</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "10px 0" }}>{d.description}</p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12px", color: "var(--color-green-dark)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> <span>{d.date} at {d.time}</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14} /> <span>{d.location}</span></div>
                  </div>

                  {/* Before/After Photos rendering */}
                  {d.proofs && d.proofs.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <h5 style={{ fontSize: "12px", marginBottom: "8px" }}>Proof & Impact Submissions</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        {d.proofs.map((p, idx) => {
                          const hasDoublePhoto = p.imageUrl && p.imageUrl.includes("||");
                          const isShowingAfter = photoToggles[`${d.id}_${idx}`];
                          
                          let beforeImg = p.imageUrl;
                          let afterImg = p.imageUrl;
                          let kg = "25";
                          let sq = "50";

                          if (hasDoublePhoto) {
                            const parts = p.imageUrl.split("||");
                            beforeImg = parts[0];
                            afterImg = parts[1];
                            kg = parts[2]?.replace("KGs Collected: ", "") || "25";
                            sq = parts[3]?.replace("Sq Meters: ", "") || "50";
                          }

                          return (
                            <div key={idx} style={{ background: "rgba(231, 225, 177, 0.4)", borderRadius: "var(--radius-sm)", padding: "10px", border: "1px solid var(--color-beige-dark)" }}>
                              <div style={{ position: "relative", height: "130px", overflow: "hidden", borderRadius: "4px" }}>
                                <img 
                                  src={isShowingAfter ? afterImg : beforeImg} 
                                  alt="Cleanup Proof"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                />
                                <button 
                                  onClick={() => togglePhoto(d.id, idx)}
                                  style={{ position: "absolute", bottom: "8px", right: "8px", background: "var(--color-green-dark)", color: "#fff", border: "none", padding: "4px 8px", fontSize: "10px", borderRadius: "3px", cursor: "pointer" }}
                                >
                                  {isShowingAfter ? "Show Before" : "Show After"}
                                </button>
                                <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 6px", fontSize: "9px", borderRadius: "2px" }}>
                                  {isShowingAfter ? "AFTER CLEANUP" : "BEFORE CLEANUP"}
                                </div>
                              </div>
                              <div style={{ fontSize: "11px", marginTop: "8px", color: "var(--text-primary)" }}>
                                <strong>Volunteer:</strong> {p.volunteerName}
                                <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>♻️ {kg}kg waste | 🧹 {sq}m² cleaned</div>
                              </div>

                              {user?.role === "ngo" && !p.approved && (
                                <button className="btn btn-primary" onClick={() => onApproveProof(d.id, p.volunteerId)} style={{ width: "100%", padding: "4px", fontSize: "10px", marginTop: "8px" }}>
                                  Approve & Reward Points
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    {!d.participants.includes(user?.uid) && user?.role === "volunteer" && (
                      <button className="btn btn-primary" onClick={() => onJoinDrive(d.id)} style={{ flex: 1 }}>Join Drive</button>
                    )}
                    {user?.role === "user" && (
                      <button className="btn btn-secondary" onClick={onUpgradeToVolunteer} style={{ flex: 1, backgroundColor: "var(--color-green-dark)", color: "#fff" }}>
                        Register as Volunteer to Join
                      </button>
                    )}
                    {d.participants.includes(user?.uid) && (
                      <button className="btn btn-secondary" onClick={() => handleOpenProof(d.id)} style={{ flex: 1 }}><Upload size={12} /> Submit Before/After Proof</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Event Calendar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }} className="reveal-on-scroll">
          <div className="card card-teal">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Calendar />
              <h3>Cleanup Calendar</h3>
            </div>
            
            {/* Calendar Grid representation (June 2026) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", fontSize: "11px", textAlign: "center" }}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <div key={d} style={{ fontWeight: "700", padding: "4px 0", color: "var(--color-green-dark)" }}>{d}</div>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                // Highlight days that have drives scheduled
                // Mock dates are 2 days from now, or 3 days ago
                const hasDrive = dayNum === 10 || dayNum === 5 || dayNum === 15;
                
                return (
                  <div 
                    key={i} 
                    style={{ 
                      padding: "8px 0", 
                      borderRadius: "4px",
                      background: hasDrive ? "var(--color-green-medium)" : "rgba(231, 225, 177, 0.3)",
                      color: hasDrive ? "var(--color-beige-light)" : "var(--color-green-dark)",
                      fontWeight: hasDrive ? "bold" : "normal",
                      border: "1px solid var(--color-beige-dark)"
                    }}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "12px", borderTop: "1px solid var(--color-beige-dark)", paddingTop: "8px" }}>
              🟢 Green highlighted dates indicate scheduled sanitation campaigns in your region.
            </div>
          </div>
        </div>

      </div>

      {/* Upload proof modal */}
      {proofModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Cleanup Proof</h3>
              <button className="modal-close" onClick={() => setProofModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateProof}>
                <div className="form-group">
                  <label>Before Photo URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9" 
                    value={proofForm.beforeUrl}
                    onChange={e => setProofForm({...proofForm, beforeUrl: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>After Photo URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/photo-1595275313093-f112e077189d" 
                    value={proofForm.afterUrl}
                    onChange={e => setProofForm({...proofForm, afterUrl: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estimate Waste Collected (KGs)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={proofForm.kgCollected}
                    onChange={e => setProofForm({...proofForm, kgCollected: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estimate Area Cleaned (Sq Meters)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={proofForm.sqCleaned}
                    onChange={e => setProofForm({...proofForm, sqCleaned: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Submit for Validation</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setProofModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Cleanup Drive Modal */}
      {driveModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Cleanup Campaign</h3>
              <button className="modal-close" onClick={() => setDriveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateDrive}>
                <div className="form-group">
                  <label>Campaign Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Sector 5 Street Clean" 
                    value={driveForm.title}
                    onChange={e => setDriveForm({...driveForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Detailed Scope / Description</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Scope of work, what tools are provided..." 
                    value={driveForm.description}
                    onChange={e => setDriveForm({...driveForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label>Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={driveForm.date}
                      onChange={e => setDriveForm({...driveForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Time</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 07:30 AM" 
                      value={driveForm.time}
                      onChange={e => setDriveForm({...driveForm, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Assembly Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar Park Gate" 
                    value={driveForm.location}
                    onChange={e => setDriveForm({...driveForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Volunteer Points Reward</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={driveForm.points}
                    onChange={e => setDriveForm({...driveForm, points: parseInt(e.target.value) || 50})}
                    required
                    min={10}
                    max={200}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Publish Campaign</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setDriveModal(false)}>Cancel</button>
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
