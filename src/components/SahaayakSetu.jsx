import { useState } from "react";
import { createPortal } from "react-dom";
import { Building, User, Check, Plus, Award, Clock } from "lucide-react";

export default function SahaayakSetu({ 
  user, 
  leaderboard, 
  drives, 
  skills,
  onJoinNGO, 
  onApproveProof,
  onCreateSkillTask,
  onApplySkillTask,
  onCompleteSkillTask,
  onUpgradeToVolunteer
}) {
  const [activeNgoTab, setActiveNgoTab] = useState("directory");
  const [skillModal, setSkillModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [skillForm, setSkillForm] = useState({ title: "", description: "", skill: "Graphic Design", hours: 4, points: 60 });
  const [completeForm, setCompleteForm] = useState({ workLink: "" });
  const [skillFilter, setSkillFilter] = useState("all");

  const PARTNER_NGOS = [
    { id: "ngo_1", name: "Robin Hood Army", email: "rha@seva.org", description: "Zero-funds volunteer organization redistributing surplus food.", volunteersCount: 4, completedCount: 42 },
    { id: "ngo_2", name: "Clean Earth Foundation", email: "clean@seva.org", description: "Dedicated to local sanitation drives and public cleanliness campaigns.", volunteersCount: 3, completedCount: 19 }
  ];

  const ngoVolunteers = leaderboard.volunteers.filter(vol => {
    if (user?.role === "ngo") {
      return vol.ngoId === user.uid;
    }
    return vol.ngoId === "ngo_1";
  });

  const handleCreateSkillSubmit = (e) => {
    e.preventDefault();
    onCreateSkillTask(skillForm.title, skillForm.description, skillForm.skill, skillForm.hours, skillForm.points);
    setSkillModal(false);
    setSkillForm({ title: "", description: "", skill: "Graphic Design", hours: 4, points: 60 });
  };

  const handleOpenComplete = (id) => {
    setSelectedSkillId(id);
    setCompleteModal(true);
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    onCompleteSkillTask(selectedSkillId, completeForm.workLink);
    setCompleteModal(false);
    setCompleteForm({ workLink: "" });
    setSelectedSkillId("");
  };

  const filteredSkills = skills.filter(s => {
    if (skillFilter === "all") return true;
    return s.assignedTo === user?.uid;
  });

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Building />
          <h3>Sahaayak Setu - NGO Administration & Tasks</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeNgoTab === "directory" ? "active" : ""}`} onClick={() => setActiveNgoTab("directory")}>NGO Directory</button>
          <button className={`tab-btn ${activeNgoTab === "tasks" ? "active" : ""}`} onClick={() => setActiveNgoTab("tasks")}>Skill Tasks</button>
          {user?.role === "ngo" && (
            <button className={`tab-btn ${activeNgoTab === "roster" ? "active" : ""}`} onClick={() => setActiveNgoTab("roster")}>Volunteer Roster</button>
          )}
          {user?.role === "ngo" && (
            <button className={`tab-btn ${activeNgoTab === "proofs" ? "active" : ""}`} onClick={() => setActiveNgoTab("proofs")}>Pending Validations</button>
          )}
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Explore our cohort of verified NGOs, apply for team memberships, and participate in online skill-based micro-tasks like graphic design, basic bookkeeping, and tutoring material prep.
      </p>

      {/* Tab 1: NGO Directory */}
      {activeNgoTab === "directory" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "10px" }}>
          {PARTNER_NGOS.map(ngo => {
            const isMyNGO = user?.ngoId === ngo.id;
            return (
              <div key={ngo.id} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid var(--color-beige-dark)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Building size={18} />
                    <h4>{ngo.name}</h4>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>{ngo.description}</p>
                  <div style={{ fontSize: "11px", color: "var(--color-green-dark)", marginBottom: "16px" }}>
                    <div>👥 {ngo.volunteersCount} Active Volunteers</div>
                    <div style={{ marginTop: "2px" }}>✅ {ngo.completedCount} Projects Completed</div>
                  </div>
                </div>

                {user?.role === "volunteer" ? (
                  <button 
                    className={`btn ${isMyNGO ? "btn-secondary" : "btn-primary"}`} 
                    onClick={() => !isMyNGO && onJoinNGO(ngo.id)}
                    disabled={isMyNGO}
                    style={{ width: "100%", fontSize: "12px" }}
                  >
                    {isMyNGO ? "Joined Partner Roster" : "Enlist as Volunteer"}
                  </button>
                ) : user?.role === "user" ? (
                  <button 
                    className="btn btn-secondary" 
                    onClick={onUpgradeToVolunteer}
                    style={{ width: "100%", fontSize: "12px", backgroundColor: "var(--color-green-dark)", color: "#fff" }}
                  >
                    Register as Volunteer to Enlist
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Skill Tasks */}
      {activeNgoTab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div className="tab-group" style={{ margin: 0 }}>
              <button className={`tab-btn ${skillFilter === "all" ? "active" : ""}`} onClick={() => setSkillFilter("all")}>All Available</button>
              {user?.role === "volunteer" && (
                <button className={`tab-btn ${skillFilter === "mine" ? "active" : ""}`} onClick={() => setSkillFilter("mine")}>My Claimed Tasks</button>
              )}
            </div>
            {user?.role === "ngo" && (
              <button className="btn btn-primary" onClick={() => setSkillModal(true)}><Plus size={14} /> Post Skill Task</button>
            )}
          </div>

          <div className="card-deck">
            {filteredSkills.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", width: "100%", padding: "24px" }}>No active skill tasks found.</p>
            ) : (
              filteredSkills.map(t => {
                const isCompleted = t.status === "completed";
                const isMine = user && t.assignedTo === user.uid;

                return (
                  <div key={t.id} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)", display: "flex", flexDirection: "column", justifyItems: "space-between", minHeight: "260px", border: "1px solid var(--color-beige-dark)" }}>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <h4 style={{ color: "var(--color-green-dark)" }}>{t.title}</h4>
                        <span className="badge badge-pending">{t.requiredSkill}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>NGO: {t.organizerName}</p>
                      <p style={{ fontSize: "13px", marginTop: "10px", lineHeight: "1.4" }}>{t.description}</p>
                      
                      <div className="pickup-details" style={{ marginTop: "14px" }}>
                        <div className="pickup-details-row"><Award size={14} /><span>Reward: +{t.pointsReward} Points</span></div>
                        <div className="pickup-details-row"><Clock size={14} /><span>Impact: {t.hoursReward} Hours</span></div>
                      </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      {t.status === "open" && user?.role === "volunteer" && (
                        <button className="btn btn-primary" onClick={() => onApplySkillTask(t.id)} style={{ width: "100%", fontSize: "12px" }}>Claim Work</button>
                      )}
                      {t.status === "open" && user?.role === "user" && (
                        <button className="btn btn-secondary" onClick={onUpgradeToVolunteer} style={{ width: "100%", fontSize: "12px", backgroundColor: "var(--color-green-dark)", color: "#fff" }}>Register as Volunteer to Claim</button>
                      )}
                      {t.status === "assigned" && isMine && (
                        <button className="btn btn-secondary" onClick={() => handleOpenComplete(t.id)} style={{ width: "100%", fontSize: "12px" }}>Submit Deliverable Link</button>
                      )}
                      {isCompleted && (
                        <div style={{ background: "rgba(13, 83, 14, 0.08)", padding: "8px", border: "1px dashed var(--color-green-medium)", borderRadius: "var(--radius-sm)", fontSize: "11px", color: "var(--color-green-dark)" }}>
                          <span>✅ Task Completed. Deliverable: <a href={t.workLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-green-dark)", fontWeight: "bold", textDecoration: "underline" }}>View link</a></span>
                        </div>
                      )}
                      {t.status === "assigned" && !isMine && (
                        <span style={{ fontSize: "11px", fontStyle: "italic", color: "var(--text-secondary)" }}>Assigned to {t.assignedToName}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Volunteer Roster */}
      {activeNgoTab === "roster" && user?.role === "ngo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <h4>Enlisted Volunteer Squad</h4>
          {ngoVolunteers.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No volunteers have joined your team roster yet.</p>
          ) : (
            ngoVolunteers.map(vol => (
              <div key={vol.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(231, 225, 177, 0.3)", padding: "12px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <User size={18} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{vol.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Completed Actions: {vol.completedCount || 0} | Hours: {vol.impactHours || 0}h</div>
                  </div>
                </div>
                <span className="badge badge-completed">{vol.rewardPoints || 0} Pts</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Pending Validations */}
      {activeNgoTab === "proofs" && user?.role === "ngo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
          <h4>Pending Cleanup Validation Queue</h4>
          {drives.filter(d => d.organizerId === user.uid).flatMap(d => (d.proofs || []).filter(p => !p.approved)).length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No pending volunteer drive proofs in your validation queue.</p>
          ) : (
            drives.filter(d => d.organizerId === user.uid).map(d => (
              <div key={d.id}>
                {(d.proofs || []).filter(p => !p.approved).map((p, idx) => (
                  <div key={idx} style={{ background: "rgba(231, 225, 177, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px" }}>{d.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Submitted by: {p.volunteerName}</div>
                      <div style={{ marginTop: "10px" }}>
                        <img src={p.imageUrl.split("||")[0]} alt="Proof" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--color-beige-dark)" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button className="btn btn-primary" onClick={() => onApproveProof(d.id, p.volunteerId)}><Check size={12} /> Approve Roster Points</button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Post Skill Task Modal */}
      {skillModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Publish Skill-Based Task</h3>
              <button className="modal-close" onClick={() => setSkillModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateSkillSubmit}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Design Awareness Flyers"
                    value={skillForm.title}
                    onChange={e => setSkillForm({...skillForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deliverables Description</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Provide details of files required"
                    value={skillForm.description}
                    onChange={e => setSkillForm({...skillForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category Skill Required</label>
                  <select 
                    className="form-control"
                    value={skillForm.skill}
                    onChange={e => setSkillForm({...skillForm, skill: e.target.value})}
                  >
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Teaching Material">Teaching Material</option>
                    <option value="Basic Bookkeeping">Basic Bookkeeping</option>
                    <option value="Content Writing">Content Writing</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label>Volunteer Points Reward</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={skillForm.points}
                      onChange={e => setSkillForm({...skillForm, points: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label>Volunteer Impact Hours</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={skillForm.hours}
                      onChange={e => setSkillForm({...skillForm, hours: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Announce Task</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setSkillModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Complete Task Modal */}
      {completeModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit Completed Work</h3>
              <button className="modal-close" onClick={() => setCompleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCompleteSubmit}>
                <div className="form-group">
                  <label>Deliverable Link (Google Drive / Figma / GitHub)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://drive.google.com/..."
                    value={completeForm.workLink}
                    onChange={e => setCompleteForm({...completeForm, workLink: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Submit for Points</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setCompleteModal(false)}>Cancel</button>
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
