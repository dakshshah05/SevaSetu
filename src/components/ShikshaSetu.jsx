import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, BookOpen, User, Check, MapPin } from "lucide-react";

export default function ShikshaSetu({ 
  user, 
  tutors, 
  tutorRequests, 
  onRegisterTutor, 
  onCreateTutorRequest, 
  onMatchTutorToRequest 
}) {
  const [activeTab, setActiveTab] = useState("requests");
  const [tutorModal, setTutorModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);

  // Forms state
  const [tutorForm, setTutorForm] = useState({ subject: "Mathematics", availability: "Weekends 10 AM - 12 PM", location: "" });
  const [requestForm, setRequestForm] = useState({ childName: "", parentName: "", subject: "Mathematics", location: "", details: "" });

  const handleRegisterTutor = (e) => {
    e.preventDefault();
    onRegisterTutor(tutorForm.subject, tutorForm.availability, tutorForm.location);
    setTutorModal(false);
    setTutorForm({ subject: "Mathematics", availability: "Weekends 10 AM - 12 PM", location: "" });
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    onCreateTutorRequest(requestForm.childName, requestForm.parentName, requestForm.subject, requestForm.location, requestForm.details);
    setRequestModal(false);
    setRequestForm({ childName: "", parentName: "", subject: "Mathematics", location: "", details: "" });
  };

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen />
          <h3>Shiksha Setu - Education Support</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>Requests</button>
          <button className={`tab-btn ${activeTab === "tutors" ? "active" : ""}`} onClick={() => setActiveTab("tutors")}>Registered Tutors</button>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Connecting educated volunteer tutors with underprivileged children who lack academic support. Volunteers earn points and badges for teaching hours.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        {user?.role === "volunteer" && (
          <button className="btn btn-primary" onClick={() => setTutorModal(true)}><Plus size={14} /> Register as Volunteer Tutor</button>
        )}
        <button className="btn btn-secondary" onClick={() => setRequestModal(true)}><Plus size={14} /> Submit Tutoring Request for a Child</button>
      </div>

      {activeTab === "requests" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4>Active Academic Tutoring Requests</h4>
          {tutorRequests.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No tutoring requests recorded at this moment.</p>
          ) : (
            tutorRequests.map(req => (
              <div key={req.id} style={{ background: "rgba(231, 225, 177, 0.3)", padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h4 style={{ color: "var(--color-green-dark)" }}>{req.subject} Assistance for {req.childName}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}><strong>Parent/Contact:</strong> {req.parentName} | <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {req.location}</p>
                  <p style={{ fontSize: "13px", marginTop: "8px" }}>{req.details}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", minWidth: "180px" }}>
                  <span className={`badge ${req.status === "matched" ? "badge-completed" : "badge-pending"}`}>
                    {req.status === "matched" ? `Matched: ${req.matchedTutor}` : "Pending Match"}
                  </span>
                  {req.status === "pending" && user?.role === "volunteer" && (
                    <button className="btn btn-primary" onClick={() => onMatchTutorToRequest(req.id, user.name)} style={{ padding: "6px 12px", fontSize: "11px", marginTop: "10px" }}>
                      <Check size={12} /> Claim Tutoring Slot
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4>Matching Volunteer Tutor Roster</h4>
          {tutors.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No tutors registered yet.</p>
          ) : (
            tutors.map(tut => (
              <div key={tut.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(231, 225, 177, 0.3)", padding: "12px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <User size={18} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{tut.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Teaches <strong>{tut.subject}</strong> | 📅 {tut.availability} | 📍 {tut.location}</div>
                  </div>
                </div>
                <span className="badge badge-completed">Volunteer Tutor</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tutor Registration Modal */}
      {tutorModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register as Volunteer Tutor</h3>
              <button className="modal-close" onClick={() => setTutorModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleRegisterTutor}>
                <div className="form-group">
                  <label>Subject Specialization</label>
                  <select 
                    className="form-control"
                    value={tutorForm.subject}
                    onChange={e => setTutorForm({...tutorForm, subject: e.target.value})}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science & Physics">Science & Physics</option>
                    <option value="English Grammar">English Grammar</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Basics">Computer Basics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Your Availability</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Saturday & Sunday 4-6 PM" 
                    value={tutorForm.availability}
                    onChange={e => setTutorForm({...tutorForm, availability: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location Area</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar, Bangalore" 
                    value={tutorForm.location}
                    onChange={e => setTutorForm({...tutorForm, location: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Enlist Tutor Profile</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setTutorModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Request Tutoring Modal */}
      {requestModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Tutoring for a Child</h3>
              <button className="modal-close" onClick={() => setRequestModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateRequest}>
                <div className="form-group">
                  <label>Child Name & Age</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Sunny (10 yrs)" 
                    value={requestForm.childName}
                    onChange={e => setRequestForm({...requestForm, childName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parent / Guardian Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Ramesh K." 
                    value={requestForm.parentName}
                    onChange={e => setRequestForm({...requestForm, parentName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject Needed</label>
                  <select 
                    className="form-control"
                    value={requestForm.subject}
                    onChange={e => setRequestForm({...requestForm, subject: e.target.value})}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science & Physics">Science & Physics</option>
                    <option value="English Grammar">English Grammar</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Basics">Computer Basics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location Area</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar slum hub" 
                    value={requestForm.location}
                    onChange={e => setRequestForm({...requestForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specific Needs & Details</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Needs help with arithmetic, basic equations. Family cannot afford coaching classes." 
                    value={requestForm.details}
                    onChange={e => setRequestForm({...requestForm, details: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Submit Tutoring Request</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setRequestModal(false)}>Cancel</button>
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
