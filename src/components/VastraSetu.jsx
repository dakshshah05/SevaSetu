import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Gift, Check, Building, MapPin, Truck } from "lucide-react";

export default function VastraSetu({ 
  user, 
  clothes, 
  onListDonation, 
  onClaimPickup, 
  onDistribute,
  onUpgradeToVolunteer
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [donateModal, setDonateModal] = useState(false);
  const [distributeModal, setDistributeModal] = useState(false);
  
  const [selectedItemId, setSelectedItemId] = useState("");

  // Forms state
  const [donationForm, setDonationForm] = useState({ category: "Clothes", details: "", quantity: "" });
  const [distributeForm, setDistributeForm] = useState({ shelter: "" });

  const handleDonateSubmit = (e) => {
    e.preventDefault();
    onListDonation(donationForm.category, donationForm.details, donationForm.quantity);
    setDonateModal(false);
    setDonationForm({ category: "Clothes", details: "", quantity: "" });
  };

  const handleOpenDistribute = (id) => {
    setSelectedItemId(id);
    setDistributeModal(true);
  };

  const handleDistributeSubmit = (e) => {
    e.preventDefault();
    onDistribute(selectedItemId, distributeForm.shelter);
    setDistributeModal(false);
    setDistributeForm({ shelter: "" });
  };

  const filteredClothes = clothes.filter(c => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return c.status === "pending";
    if (activeTab === "my-pickups") return c.claimedBy === user?.uid;
    return true;
  });

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Gift />
          <h3>Vastra Setu - Clothes & Essentials Donation</h3>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All Items</button>
          <button className={`tab-btn ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>Pending Pickups</button>
          {user?.role === "volunteer" && (
            <button className={`tab-btn ${activeTab === "my-pickups" ? "active" : ""}`} onClick={() => setActiveTab("my-pickups")}>My Pickups</button>
          )}
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Donate usable clothes, blankets, books, and toys. Nearby volunteers collect them from your door and deliver them to orphanage shelters and underprivileged schools.
      </p>

      <div>
        <button className="btn btn-primary" onClick={() => setDonateModal(true)}><Plus size={14} /> List Item for Donation</button>
      </div>

      <div className="card-deck" style={{ marginTop: "20px" }}>
        {filteredClothes.map(c => (
          <div key={c.id} className="card card-orange" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px", background: "rgba(251, 245, 221, 0.4)" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4>{c.category}</h4>
                <span className={`badge ${c.status === "completed" ? "badge-completed" : c.status === "claimed" ? "badge-claimed" : "badge-pending"}`}>{c.status}</span>
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", margin: "8px 0" }}>{c.details}</div>
              
              <div className="pickup-details" style={{ marginTop: "12px" }}>
                <div className="pickup-details-row"><Check size={14} /><span>Quantity: {c.quantity}</span></div>
                <div className="pickup-details-row"><Building size={14} /><span>Donor: {c.donorName}</span></div>
                {c.distributionLocation && (
                  <div className="pickup-details-row"><MapPin size={14} /><span>Distributed to: {c.distributionLocation}</span></div>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              {c.status === "pending" && user?.role === "volunteer" && (
                <button className="btn btn-primary" onClick={() => onClaimPickup(c.id)} style={{ width: "100%" }}><Truck size={14} style={{ marginRight: "6px" }} /> Claim Pickup Slot</button>
              )}
              {c.status === "pending" && user?.role === "user" && (
                <button className="btn btn-secondary" onClick={onUpgradeToVolunteer} style={{ width: "100%", backgroundColor: "var(--color-green-dark)", color: "#fff" }}><Truck size={14} style={{ marginRight: "6px" }} /> Register as Volunteer to Claim</button>
              )}
              {c.status === "claimed" && c.claimedBy === user?.uid && (
                <button className="btn btn-secondary" onClick={() => handleOpenDistribute(c.id)} style={{ width: "100%" }}><Check size={14} /> Mark Distributed</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Donate Item Modal */}
      {donateModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Donate Clothes & Essentials</h3>
              <button className="modal-close" onClick={() => setDonateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleDonateSubmit}>
                <div className="form-group">
                  <label>Item Category</label>
                  <select 
                    className="form-control"
                    value={donationForm.category}
                    onChange={e => setDonationForm({...donationForm, category: e.target.value})}
                  >
                    <option value="Clothes">Clothes & Blankets</option>
                    <option value="Books">Educational Books</option>
                    <option value="Toys">Toys & Board games</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity / Pack count</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 1 Bag (10 pairs of shirts)" 
                    value={donationForm.quantity}
                    onChange={e => setDonationForm({...donationForm, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Winter woolen blankets, gently used kids jeans and jackets." 
                    value={donationForm.details}
                    onChange={e => setDonationForm({...donationForm, details: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Publish Donation</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setDonateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Distribute verification Modal */}
      {distributeModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Distribute Items to Shelter</h3>
              <button className="modal-close" onClick={() => setDistributeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleDistributeSubmit}>
                <div className="form-group">
                  <label>Target Shelter / Recipient School Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Mother Teresa Orphanage Home" 
                    value={distributeForm.shelter}
                    onChange={e => setDistributeForm({...distributeForm, shelter: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Complete Distribution</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setDistributeModal(false)}>Cancel</button>
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
