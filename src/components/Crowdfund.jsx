import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Heart, Clipboard } from "lucide-react";

export default function Crowdfund({ 
  user, 
  crowd, 
  onCreateCampaign, 
  onDonateToCampaign, 
  onUploadCampaignProof 
}) {
  const [campaignModal, setCampaignModal] = useState(false);
  const [proofModal, setProofModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [donateInputId, setDonateInputId] = useState("");
  const [donationAmount, setDonationAmount] = useState("500");
  const [txnRef, setTxnRef] = useState("");
  
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Forms state
  const [campaignForm, setCampaignForm] = useState({ title: "", description: "", target: 15000 });
  const [proofForm, setProofForm] = useState({ imageUrl: "", description: "" });

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    onCreateCampaign(campaignForm.title, campaignForm.description, campaignForm.target);
    setCampaignModal(false);
    setCampaignForm({ title: "", description: "", target: 15000 });
    alert("Crowdfunding campaign launched successfully!");
  };

  const triggerDonatePayment = (camp) => {
    setSelectedCampaign(camp);
    // Mock Payment Gateway Integration (Razorpay/PayU modal)
    alert(`💳 Redirecting to Razorpay checkout...\nSimulated payment of ₹${donationAmount} for campaign "${camp.title}"...`);
    onDonateToCampaign(camp.id, parseInt(donationAmount));
    setTxnRef("TXN-" + Math.floor(Math.random() * 10000000));
    setReceiptModal(true); // Open the tax benefit receipt modal
  };

  const handleOpenProof = (camp) => {
    setSelectedCampaign(camp);
    setProofModal(true);
  };

  const handleProofSubmit = (e) => {
    e.preventDefault();
    onUploadCampaignProof(selectedCampaign.id, proofForm.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300", proofForm.description);
    setProofModal(false);
    setProofForm({ imageUrl: "", description: "" });
    setSelectedCampaign(null);
    alert("Transparency proof (receipt/expense statement) uploaded successfully!");
  };

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Heart style={{ color: "var(--color-green-dark)" }} />
          <h3>Punya Setu - NGO Crowdfunding (100% Transparent)</h3>
        </div>
        {user?.role === "ngo" && (
          <button className="btn btn-primary" onClick={() => setCampaignModal(true)}><Plus size={14} /> Launch Campaign</button>
        )}
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Fund verified NGO campaign requirements directly. Monitor 100% transparency tracking, check utilization receipts, and obtain automated tax-exempt 80G receipts.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {crowd.map(c => {
          const progressPercent = Math.min(Math.round(((c.currentAmount || 0) / c.targetAmount) * 100), 100);
          return (
            <div key={c.id} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "340px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <h4>{c.title}</h4>
                  <span className="badge badge-pending">Verified</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>Organized by: {c.organizerName}</p>
                <p style={{ fontSize: "13px", margin: "14px 0", lineHeight: "1.5" }}>{c.description}</p>
                
                {/* Progress bar */}
                <div style={{ margin: "16px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-green-dark)", marginBottom: "4px", fontWeight: "bold" }}>
                    <span>₹{(c.currentAmount || 0).toLocaleString()} raised</span>
                    <span>{progressPercent}% of ₹{c.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {/* Proofs / Transparency Logs */}
                {c.proofs && c.proofs.length > 0 && (
                  <div style={{ marginTop: "14px", padding: "10px", background: "rgba(231, 225, 177, 0.4)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--color-green-medium)" }}>
                    <h5 style={{ fontSize: "11px", color: "var(--color-green-dark)", display: "flex", alignItems: "center", gap: "4px" }}><Clipboard size={12} /> Utilization Receipts</h5>
                    {c.proofs.map((pr, idx) => (
                      <div key={idx} style={{ fontSize: "11px", color: "var(--text-primary)", marginTop: "6px" }}>
                        📌 {pr.description}
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <a href={pr.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-green-medium)", textDecoration: "underline" }}>View Receipt Invoice</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                {c.organizerId === user?.uid && (
                  <button className="btn btn-outline" onClick={() => handleOpenProof(c)} style={{ width: "100%", marginBottom: "10px" }}><Plus size={12} /> Upload Spend Receipt</button>
                )}
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ width: "80px", padding: "6px" }}
                    placeholder="Amt"
                    value={donateInputId === c.id ? donationAmount : "500"}
                    onChange={e => {
                      setDonateInputId(c.id);
                      setDonationAmount(e.target.value);
                    }}
                  />
                  <button className="btn btn-primary" onClick={() => triggerDonatePayment(c)} style={{ flex: 1 }}>
                    Donate ₹
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Launcher Modal */}
      {campaignModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Launch Transparency Campaign</h3>
              <button className="modal-close" onClick={() => setCampaignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCampaign}>
                <div className="form-group">
                  <label>Campaign Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Rebuild School Library" 
                    value={campaignForm.title}
                    onChange={e => setCampaignForm({...campaignForm, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Target Funding Goal (₹ INR)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 15000" 
                    value={campaignForm.target}
                    onChange={e => setCampaignForm({...campaignForm, target: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Usage Plan & Description</label>
                  <textarea 
                    className="form-control" 
                    placeholder="e.g. Purchase of 50 English reading books, 3 study tables, and painting the study hall." 
                    value={campaignForm.description}
                    onChange={e => setCampaignForm({...campaignForm, description: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Launch Campaign</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setCampaignModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Spend Proof Upload Modal */}
      {proofModal && selectedCampaign && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Spend Receipt</h3>
              <button className="modal-close" onClick={() => setProofModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleProofSubmit}>
                <div className="form-group">
                  <label>Expense / Receipt Description</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Purchased 10 cement bags and bricks" 
                    value={proofForm.description}
                    onChange={e => setProofForm({...proofForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Invoice / Photo URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/..." 
                    value={proofForm.imageUrl}
                    onChange={e => setProofForm({...proofForm, imageUrl: e.target.value})}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Upload Verification</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setProofModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Tax Exemption Receipt (80G) Modal */}
      {receiptModal && selectedCampaign && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px", padding: "40px", border: "3px dashed var(--color-green-medium)", background: "#fdfbe8", textAlign: "center" }}>
            <h2 style={{ color: "var(--color-green-dark)" }}>80G TAX EXEMPTION RECEIPT</h2>
            <div style={{ margin: "20px 0", fontSize: "13px" }}>
              <p style={{ marginBottom: "10px" }}>Thank you for your generous contribution of <strong>₹{donationAmount}</strong> to campaign <strong>"{selectedCampaign.title}"</strong>.</p>
              <div style={{ background: "#f5f3cc", padding: "12px", borderRadius: "6px", fontSize: "11px", textAlign: "left", display: "inline-block", width: "100%", border: "1px solid var(--color-beige-dark)" }}>
                <div><strong>Donor:</strong> {user?.name || "Anonymous Donor"}</div>
                <div><strong>NGO Partner:</strong> {selectedCampaign.organizerName}</div>
                <div><strong>Transaction Reference ID:</strong> {txnRef}</div>
                <div><strong>Tax Exemption Code:</strong> 80G-SEC-SEVA</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()}>Print / Save Tax Receipt</button>
            <button className="btn btn-secondary" onClick={() => { setReceiptModal(false); setSelectedCampaign(null); }} style={{ marginLeft: "10px" }}>Close</button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
