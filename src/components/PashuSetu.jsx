import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Check, MapPin, Heart, Activity } from "lucide-react";

export default function PashuSetu({ 
  user, 
  rescues, 
  triggerToast,
  onReportInjury, 
  onClaimRescue,
  onUpgradeToVolunteer
}) {
  const [activeTab, setActiveTab] = useState("rescues");
  const [reportModal, setReportModal] = useState(false);
  const [adoptModal, setAdoptModal] = useState(false);
  
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Forms state
  const [reportForm, setReportForm] = useState({ animalType: "Stray Dog", details: "", location: "", photoUrl: "" });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    onReportInjury(reportForm.animalType, reportForm.details, reportForm.location, reportForm.photoUrl);
    setReportModal(false);
    setReportForm({ animalType: "Stray Dog", details: "", location: "", photoUrl: "" });
  };

  const triggerAdoptionClick = (ani) => {
    setSelectedAnimal(ani);
    setAdoptModal(true);
  };

  const submitAdoption = (e) => {
    e.preventDefault();
    triggerToast(`Thank you! Adoption application for ${selectedAnimal.animalType} submitted. Our shelters will contact you for a house checkup.`);
    setAdoptModal(false);
    setSelectedAnimal(null);
  };

  // Vets Mock directory
  const VET_CLINICS = [
    { name: "Indiranagar Animal Care Clinic", phone: "+91 98765 43210", address: "80 Feet Road, near Metro station", openHours: "24/7 Emergency" },
    { name: "Koramangala Vet Care Center", phone: "+91 98765 01234", address: "1st Block, near Park", openHours: "09:00 AM - 08:30 PM" }
  ];

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Activity />
          <h3>Pashu Setu - Animal Welfare</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === "rescues" ? "active" : ""}`} onClick={() => setActiveTab("rescues")}>Rescue Board</button>
          <button className={`tab-btn ${activeTab === "vets" ? "active" : ""}`} onClick={() => setActiveTab("vets")}>Veterinary Network</button>
          <button className={`tab-btn ${activeTab === "adoption" ? "active" : ""}`} onClick={() => setActiveTab("adoption")}>Adoption Portal</button>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Protecting stray animals. Report injured strays, mobilize volunteer rescue networks, locate emergency veterinary clinics, and browse animals looking for homes.
      </p>

      {activeTab === "rescues" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h4>Active Stray Rescue Reports</h4>
            <button className="btn btn-primary" onClick={() => setReportModal(true)}><Plus size={14} /> Report Injured Stray</button>
          </div>

          <div className="card-deck" style={{ marginTop: "10px" }}>
            {rescues.map(r => (
              <div key={r.id} className="card card-orange" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px", background: "rgba(251, 245, 221, 0.4)" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4>{r.animalType}</h4>
                    <span className={`badge ${r.status === "rescued" ? "badge-completed" : "badge-pending"}`}>{r.status}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "8px" }}>Reported by: {r.reportedBy}</p>
                  
                  <div style={{ position: "relative", height: "100px", overflow: "hidden", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                    <img src={r.photoUrl} alt="Animal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <p style={{ fontSize: "13px", marginBottom: "8px" }}>{r.injuryDetails}</p>
                  <div className="pickup-details">
                    <div className="pickup-details-row"><MapPin size={14} /><span>📍 {r.location}</span></div>
                    {r.rescuedBy && (
                      <div className="pickup-details-row"><Check size={14} /><span>Rescuer: {r.rescuedBy}</span></div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  {r.status === "reported" && user?.role === "volunteer" && (
                    <button className="btn btn-primary" onClick={() => onClaimRescue(r.id, user.name)} style={{ width: "100%" }}>
                      <Check size={12} style={{ marginRight: "6px" }} /> Dispatch to Rescue Location
                    </button>
                  )}
                  {r.status === "reported" && user?.role === "user" && (
                    <button className="btn btn-secondary" onClick={onUpgradeToVolunteer} style={{ width: "100%", backgroundColor: "var(--color-green-dark)", color: "#fff" }}>
                      Register as Volunteer to Dispatch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "vets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <h4>Partner Veterinary Clinics & Emergency Contacts</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {VET_CLINICS.map((vet, idx) => (
              <div key={idx} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)", padding: "20px" }}>
                <h4>{vet.name}</h4>
                <div className="pickup-details" style={{ marginTop: "12px" }}>
                  <div className="pickup-details-row"><strong>Phone:</strong> {vet.phone}</div>
                  <div className="pickup-details-row"><strong>Address:</strong> {vet.address}</div>
                  <div className="pickup-details-row"><strong>Hours:</strong> {vet.openHours}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "adoption" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <h4>Rescued Animals Looking for Homes</h4>
          <div className="card-deck">
            {rescues.filter(r => r.status === "rescued").map(ani => (
              <div key={ani.id} className="card card-orange" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px", background: "rgba(251, 245, 221, 0.4)" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4>Adopt {ani.animalType}</h4>
                    <span className="badge badge-completed">Ready</span>
                  </div>
                  <div style={{ position: "relative", height: "120px", overflow: "hidden", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}>
                    <img src={ani.photoUrl} alt="Adoption" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <p style={{ fontSize: "13px" }}>Fully treated and vaccinated at {ani.vetDetails}. Friendly and looking for a loving family.</p>
                </div>
                <button className="btn btn-primary" onClick={() => triggerAdoptionClick(ani)} style={{ width: "100%", marginTop: "15px" }}>
                  <Heart size={14} style={{ marginRight: "6px" }} /> Submit Adoption Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Stray Modal */}
      {reportModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Injured Stray Animal</h3>
              <button className="modal-close" onClick={() => setReportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleReportSubmit}>
                <div className="form-group">
                  <label>Animal Type</label>
                  <select 
                    className="form-control"
                    value={reportForm.animalType}
                    onChange={e => setReportForm({...reportForm, animalType: e.target.value})}
                  >
                    <option value="Stray Dog">Stray Dog</option>
                    <option value="Stray Cat">Stray Cat</option>
                    <option value="Bird / Eagle">Bird / Eagle</option>
                    <option value="Cow / Cattle">Cow / Cattle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Injury Details & Emergency Level</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Broken left front leg, unable to walk, bleeding. Highly distressed." 
                    value={reportForm.details}
                    onChange={e => setReportForm({...reportForm, details: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Current Location Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Near Indiranagar supermarket junction" 
                    value={reportForm.location}
                    onChange={e => setReportForm({...reportForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Photo URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/photo-..." 
                    value={reportForm.photoUrl}
                    onChange={e => setReportForm({...reportForm, photoUrl: e.target.value})}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Dispatch Alert</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setReportModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Adopt Modal */}
      {adoptModal && selectedAnimal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adoption Request for {selectedAnimal.animalType}</h3>
              <button className="modal-close" onClick={() => setAdoptModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitAdoption}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" className="form-control" defaultValue={user?.name || ""} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="form-control" placeholder="+91 98765 xxxxx" required />
                </div>
                <div className="form-group">
                  <label>Home Environment Details</label>
                  <textarea className="form-control" placeholder="e.g. Living in an apartment with a spacious balcony, no other pets currently." required />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Submit Application</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setAdoptModal(false)}>Cancel</button>
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
