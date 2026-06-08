import { useState } from "react";
import { Plus, Pill, Check, Calendar, MapPin, Clipboard, Activity, Users } from "lucide-react";

export default function SwasthyaSetu({ 
  user, 
  camps, 
  meds, 
  onCreateCamp, 
  onRegisterDoctor, 
  onRegisterPatient, 
  onSubmitReport, 
  onDonateMedicine, 
  onClaimMedicine 
}) {
  const [activeTab, setActiveTab] = useState("camps");
  const [campModal, setCampModal] = useState(false);
  const [patientModal, setPatientModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [medModal, setMedModal] = useState(false);
  
  const [selectedCampId, setSelectedCampId] = useState("");

  // Forms state
  const [campForm, setCampForm] = useState({ title: "", location: "", date: "", description: "" });
  const [patientForm, setPatientForm] = useState({ name: "", age: "" });
  const [reportForm, setReportForm] = useState({ summary: "", patientsTreated: 20 });
  const [medForm, setMedForm] = useState({ name: "", qty: "", expiry: "", location: "" });

  const handleCreateCamp = (e) => {
    e.preventDefault();
    onCreateCamp(campForm.title, campForm.location, campForm.date, campForm.description);
    setCampModal(false);
    setCampForm({ title: "", location: "", date: "", description: "" });
  };

  const handleOpenPatient = (id) => {
    setSelectedCampId(id);
    setPatientModal(true);
  };

  const handleRegisterPatientSubmit = (e) => {
    e.preventDefault();
    onRegisterPatient(selectedCampId, patientForm.name, patientForm.age);
    setPatientModal(false);
    setPatientForm({ name: "", age: "" });
    alert("Patient registration complete! Added to checkup queue.");
  };

  const handleOpenReport = (id) => {
    setSelectedCampId(id);
    setReportModal(true);
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    onSubmitReport(selectedCampId, `Completed checkup. Treated ${reportForm.patientsTreated} patients. Summary: ${reportForm.summary}`);
    setReportModal(false);
    setReportForm({ summary: "", patientsTreated: 20 });
    alert("Camp report filed successfully!");
  };

  const handleDonateMed = (e) => {
    e.preventDefault();
    onDonateMedicine(medForm.name, medForm.qty, medForm.expiry, medForm.location);
    setMedModal(false);
    setMedForm({ name: "", qty: "", expiry: "", location: "" });
  };

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity />
          <h3>Swasthya Setu - Medical Camps & Medicine Pool</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === "camps" ? "active" : ""}`} onClick={() => setActiveTab("camps")}>Medical Camps</button>
          <button className={`tab-btn ${activeTab === "meds" ? "active" : ""}`} onClick={() => setActiveTab("meds")}>Medicine Pool</button>
        </div>
      </div>

      {activeTab === "camps" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            NGOs organize free pediatric & geriatric health checkup camps in rural or slum areas. Doctors enlist as clinicians, and patients register for checkup tokens.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {user?.role === "ngo" && (
              <button className="btn btn-primary" onClick={() => setCampModal(true)}><Plus size={14} /> Schedule Medical Camp</button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
            {camps.map(c => (
              <div key={c.id} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <h4>{c.title}</h4>
                  <span className={`badge ${c.status === "completed" ? "badge-completed" : "badge-pending"}`}>{c.status}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "10px 0" }}>{c.description}</p>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12px", color: "var(--color-green-dark)", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> <span>{c.date}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14} /> <span>{c.location}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Users size={14} /> <span>{c.doctors.length} Doctors Signed Up | {c.patientsCount} Patients Registered</span></div>
                </div>

                {c.report && (
                  <div style={{ padding: "10px", background: "rgba(231, 225, 177, 0.3)", border: "1px dashed var(--color-green-medium)", borderRadius: "var(--radius-sm)", fontSize: "12px", marginBottom: "16px" }}>
                    <strong>Health Report Summary:</strong> {c.report}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {c.status === "scheduled" && user?.role === "volunteer" && (
                    <button className="btn btn-primary" onClick={() => onRegisterDoctor(c.id, user.name)}>Enlist as Doctor / Student Clinic Helper</button>
                  )}
                  {c.status === "scheduled" && (
                    <button className="btn btn-secondary" onClick={() => handleOpenPatient(c.id)}>Register Patient Token</button>
                  )}
                  {c.status === "scheduled" && user?.role === "ngo" && (
                    <button className="btn btn-outline" onClick={() => handleOpenReport(c.id)}><Clipboard size={12} /> Submit Post-Camp Report</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Redistribute unexpired surplus medicines donated by cafes, clinics, or individuals to charity dispensaries.
          </p>

          <div>
            <button className="btn btn-primary" onClick={() => setMedModal(true)}><Plus size={14} /> Donate Surplus Medicines</button>
          </div>

          <div className="card-deck" style={{ marginTop: "10px" }}>
            {meds.filter(m => m.status === "available").length === 0 ? (
              <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No medicine pool coordinates currently registered.</p>
            ) : (
              meds.filter(m => m.status === "available").map(m => (
                <div key={m.id} className="card card-orange" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px", background: "rgba(251, 245, 221, 0.4)" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h4>{m.medicineName}</h4>
                      <span className="badge badge-pending">Available</span>
                    </div>
                    <div className="pickup-details" style={{ marginTop: "12px" }}>
                      <div className="pickup-details-row"><Pill /><span>Quantity: {m.quantity}</span></div>
                      <div className="pickup-details-row"><Calendar /><span>Expiry: {m.expiryDate}</span></div>
                      <div className="pickup-details-row"><MapPin /><span>Location: {m.location}</span></div>
                    </div>
                  </div>
                  
                  {(user?.role === "ngo" || user?.role === "volunteer") && (
                    <button className="btn btn-primary" onClick={() => onClaimMedicine(m.id)} style={{ width: "100%", marginTop: "15px" }}><Check size={14} /> Claim Medicine</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Camp Scheduling Modal */}
      {campModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Free Medical Camp</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCamp}>
                <div className="form-group">
                  <label>Camp Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar Slum Health checkup" 
                    value={campForm.title}
                    onChange={e => setCampForm({...campForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location / Area</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Community Center, Koramangala" 
                    value={campForm.location}
                    onChange={e => setCampForm({...campForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={campForm.date}
                    onChange={e => setCampForm({...campForm, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description & Scope</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Free general health checkups, vitals monitoring, and distribution of vitamin syrups." 
                    value={campForm.description}
                    onChange={e => setCampForm({...campForm, description: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Publish Camp</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setCampModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {patientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register Patient Checkup Token</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRegisterPatientSubmit}>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={patientForm.name}
                    onChange={e => setPatientForm({...patientForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Patient Age</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={patientForm.age}
                    onChange={e => setPatientForm({...patientForm, age: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Generate Token</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setPatientModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Camp Report Modal */}
      {reportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit Post-Camp Health Report</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateReport}>
                <div className="form-group">
                  <label>Patients Treated (Count)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={reportForm.patientsTreated}
                    onChange={e => setReportForm({...reportForm, patientsTreated: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Summary & Cases Diagnosed</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Treated 42 kids. Common diagnoses were Vitamin D deficiencies and cold. Distributed supplements." 
                    value={reportForm.summary}
                    onChange={e => setReportForm({...reportForm, summary: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Submit Report</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setReportModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Donate Medicine Modal */}
      {medModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Donate Surplus Medicines</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleDonateMed}>
                <div className="form-group">
                  <label>Medicine Name & Dosage</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Paracetamol 500mg, Cough Syrup" 
                    value={medForm.name}
                    onChange={e => setMedForm({...medForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity / Packs</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 3 Strips (30 tablets)" 
                    value={medForm.qty}
                    onChange={e => setMedForm({...medForm, qty: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={medForm.expiry}
                    onChange={e => setMedForm({...medForm, expiry: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Dropoff Location Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar Red Cross Box" 
                    value={medForm.location}
                    onChange={e => setMedForm({...medForm, location: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Register Medicine Donation</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setMedModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
