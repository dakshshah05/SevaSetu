import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Calendar, MapPin, Sprout } from "lucide-react";

export default function VrikshaSetu({ 
  trees, 
  onPlantTree, 
  onUpdateTree 
}) {
  const [activeTab, setActiveTab] = useState("forest");
  const [plantModal, setPlantModal] = useState(false);
  const [growthModal, setGrowthModal] = useState(false);
  
  const [selectedTreeId, setSelectedTreeId] = useState("");

  // Forms state
  const [plantForm, setPlantForm] = useState({ driveTitle: "Clean Earth Lake Side Drive", location: "Koramangala Lake", treeName: "" });
  const [growthForm, setGrowthForm] = useState({ photoUrl: "", status: "Growing Young Tree" });

  const handlePlantSubmit = (e) => {
    e.preventDefault();
    onPlantTree(plantForm.driveTitle, plantForm.location, plantForm.treeName);
    setPlantModal(false);
    setPlantForm({ driveTitle: "Clean Earth Lake Side Drive", location: "Koramangala Lake", treeName: "" });
  };

  const handleOpenGrowth = (id) => {
    setSelectedTreeId(id);
    setGrowthModal(true);
  };

  const handleGrowthSubmit = (e) => {
    e.preventDefault();
    onUpdateTree(selectedTreeId, growthForm.photoUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300", growthForm.status);
    setGrowthModal(false);
    setGrowthForm({ photoUrl: "", status: "Growing Young Tree" });
  };

  // Get icon based on tree growth status
  const getGrowthIcon = (status) => {
    if (status === "Fully Blossomed Tree") return "🌳";
    if (status === "Growing Young Tree") return "🌿";
    return "🌱";
  };

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sprout />
          <h3>Vriksha Setu - Tree Plantation Drives</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === "forest" ? "active" : ""}`} onClick={() => setActiveTab("forest")}>Virtual Forest Grid</button>
          <button className={`tab-btn ${activeTab === "drives" ? "active" : ""}`} onClick={() => setActiveTab("drives")}>Plantation Drives</button>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Combating deforestation and urban air pollution. Register for plantation drives, plant a virtual sapling labeled with your name, and track its growth updates.
      </p>

      {activeTab === "forest" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h4>Virtual Canopy Growth Grid</h4>
            <button className="btn btn-primary" onClick={() => setPlantModal(true)}><Plus size={14} /> Plant / Name a Sapling</button>
          </div>

          {/* Virtual tree grid display */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "16px", marginTop: "10px" }}>
            {trees.map(tree => (
              <div 
                key={tree.id} 
                className="card" 
                style={{ 
                  background: "rgba(251, 245, 221, 0.4)", 
                  padding: "16px", 
                  textAlign: "center", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  border: "1px solid var(--color-beige-dark)",
                  cursor: "default"
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                  {getGrowthIcon(tree.status)}
                </div>
                <h5 style={{ fontSize: "12px", color: "var(--color-green-dark)" }}>{tree.treeName}</h5>
                <span style={{ fontSize: "9px", color: "var(--text-secondary)", marginTop: "2px" }}>Pld: {tree.volunteerName}</span>
                <span className="badge badge-pending" style={{ fontSize: "8px", marginTop: "8px", padding: "2px 6px" }}>{tree.status}</span>
                
                <div style={{ display: "flex", gap: "4px", marginTop: "10px", width: "100%" }}>
                  <button className="btn btn-outline" onClick={() => handleOpenGrowth(tree.id)} style={{ flex: 1, padding: "2px", fontSize: "9px" }}>
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
          <h4>Upcoming Plantation Schedules</h4>
          <div className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <h4>Clean Earth Lake Side Drive</h4>
              <span className="badge badge-pending">50 Pts Reward</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "10px 0" }}>
              Help us plant 100 neem and sapodilla saplings along the Koramangala Lake walking corridor. Tools provided.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12px", color: "var(--color-green-dark)", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> <span>Saturday at 08:30 AM</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14} /> <span>Koramangala Lake Entry</span></div>
            </div>
            <button className="btn btn-primary" onClick={() => setPlantModal(true)}>Register & Plant tree</button>
          </div>
        </div>
      )}

      {/* Plant Tree Modal */}
      {plantModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Plant & Label a Tree Sapling</h3>
              <button className="modal-close" onClick={() => setPlantModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handlePlantSubmit}>
                <div className="form-group">
                  <label>Name Your Tree</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. My Neem Tree, Hope" 
                    value={plantForm.treeName}
                    onChange={e => setPlantForm({...plantForm, treeName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Plantation Drive Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={plantForm.location}
                    disabled
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Plant Sapling</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setPlantModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Growth Update Modal */}
      {growthModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Tree Growth Status</h3>
              <button className="modal-close" onClick={() => setGrowthModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleGrowthSubmit}>
                <div className="form-group">
                  <label>Growth Status Stage</label>
                  <select 
                    className="form-control"
                    value={growthForm.status}
                    onChange={e => setGrowthForm({...growthForm, status: e.target.value})}
                  >
                    <option value="Healthy Sapling">🌱 Healthy Sapling</option>
                    <option value="Growing Young Tree">🌿 Growing Young Tree</option>
                    <option value="Fully Blossomed Tree">🌳 Fully Blossomed Tree</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Growth Proof Photo URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/photo-..." 
                    value={growthForm.photoUrl}
                    onChange={e => setGrowthForm({...growthForm, photoUrl: e.target.value})}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Log Growth Update</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setGrowthModal(false)}>Cancel</button>
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
