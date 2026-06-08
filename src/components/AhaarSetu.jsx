import { useState, useEffect } from "react";
import { MapPin, Clock, Building, Check, ShieldAlert, Award, Compass } from "lucide-react";

export default function AhaarSetu({ 
  user, 
  foods, 
  onAddPickup, 
  onClaimPickup, 
  onCompletePickup 
}) {
  const [activeFoodTab, setActiveFoodTab] = useState("all");
  const [foodForm, setFoodForm] = useState({ type: "", qty: "", expiryHours: "4", address: "" });
  const [qualityRating, setQualityRating] = useState(5);
  const [qualityNotes, setQualityNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);
    return () => clearTimeout(t);
  }, []);
  
  // Dialog state
  const [completeModal, setCompleteModal] = useState(false);
  const [certModal, setCertModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Weekly Scheduler
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ day: "Monday", time: "19:00", type: "Surplus Cooked Meals", qty: "For 20 people" });
  const [schedules, setSchedules] = useState([
    { id: "sch_1", restaurantName: "Green Garden Cafe", day: "Friday", time: "21:30", type: "Excess Dal & Rice", qty: "For 30 people" }
  ]);

  const handleCreatePickup = (e) => {
    e.preventDefault();
    const expiryDate = new Date(Date.now() + parseInt(foodForm.expiryHours) * 3600000).toISOString();
    onAddPickup(foodForm.type, foodForm.qty, expiryDate, foodForm.address);
    setFoodForm({ type: "", qty: "", expiryHours: "4", address: "" });
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    setSchedules(prev => [...prev, {
      id: "sch_" + Date.now(),
      restaurantName: user?.name || "My Restaurant",
      ...scheduleForm
    }]);
    setScheduleModal(false);
    alert("Recurring donation schedule set up successfully!");
  };

  const triggerCompleteClick = (f) => {
    setSelectedFood(f);
    setCompleteModal(true);
  };

  const submitCompletion = () => {
    if (selectedFood) {
      onCompletePickup(selectedFood.id, `Quality Check: ${qualityRating}/5 Stars. Notes: ${qualityNotes}`);
      setCompleteModal(false);
      setSelectedFood(null);
      setQualityNotes("");
    }
  };

  const triggerCertClick = (f) => {
    setSelectedFood(f);
    setCertModal(true);
  };

  // Filter listings
  const filteredFoods = foods.filter(f => {
    if (activeFoodTab === "all") return true;
    if (activeFoodTab === "pending") return f.status === "pending";
    if (activeFoodTab === "my-pickups") return f.claimedBy === user?.uid;
    return true;
  });

  return (
    <div className="gsap-reveal" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Expiry Alert Warning Banner for Pending Foods */}
      {currentTime > 0 && foods.some(f => f.status === "pending" && new Date(f.expiryTime).getTime() - currentTime < 7200000) && (
        <div style={{ background: "rgba(200, 50, 50, 0.1)", border: "1px solid var(--color-green-dark)", color: "var(--color-green-dark)", padding: "12px 18px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert style={{ color: "var(--color-green-dark)" }} />
          <span style={{ fontSize: "13px", fontWeight: "600" }}>Critical Alert: Some surplus food donations near you are about to expire in less than 2 hours! Claim immediately.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: user?.role === "restaurant" ? "1fr 2fr" : "1fr", gap: "28px" }}>
        
        {/* Left Side forms for Restaurants */}
        {user?.role === "restaurant" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div className="card card-teal">
              <h3>Post Surplus Food</h3>
              <form onSubmit={handleCreatePickup} style={{ marginTop: "16px" }}>
                <div className="form-group">
                  <label>Food Items / Type</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 5kg Biryani, Bread rolls" 
                    value={foodForm.type}
                    onChange={e => setFoodForm({...foodForm, type: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Quantity / Packets</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Serves 15 people" 
                    value={foodForm.qty}
                    onChange={e => setFoodForm({...foodForm, qty: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Expires in (Hours)</label>
                  <select 
                    className="form-control"
                    value={foodForm.expiryHours}
                    onChange={e => setFoodForm({...foodForm, expiryHours: e.target.value})}
                  >
                    <option value="2">2 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="24">24 Hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pickup Location Address</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Indiranagar Store Hub" 
                    value={foodForm.address}
                    onChange={e => setFoodForm({...foodForm, address: e.target.value})}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}>
                  Announce Surplus Food
                </button>
              </form>
            </div>

            {/* Recurring Pickups Card */}
            <div className="card card-orange">
              <h3>Weekly Schedule</h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Set recurring pickup slots for regular donations.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                {schedules.map(sch => (
                  <div key={sch.id} style={{ background: "rgba(231, 225, 177, 0.3)", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-beige-dark)", fontSize: "12px" }}>
                    <strong>Every {sch.day} at {sch.time}</strong>
                    <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>{sch.type} - {sch.qty}</div>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary" onClick={() => setScheduleModal(true)} style={{ width: "100%", marginTop: "15px" }}>
                Schedule Regular Donation
              </button>
            </div>
          </div>
        )}

        {/* Right Side: Active Board & Maps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          <div className="card card-teal">
            <div className="info-header">
              <h3>Active Surplus Food Board</h3>
              <div className="tab-group">
                <button className={`tab-btn ${activeFoodTab === "all" ? "active" : ""}`} onClick={() => setActiveFoodTab("all")}>All Available</button>
                <button className={`tab-btn ${activeFoodTab === "pending" ? "active" : ""}`} onClick={() => setActiveFoodTab("pending")}>Pending</button>
                {user?.role === "volunteer" && (
                  <button className={`tab-btn ${activeFoodTab === "my-pickups" ? "active" : ""}`} onClick={() => setActiveFoodTab("my-pickups")}>My Deliveries</button>
                )}
              </div>
            </div>

            <div className="card-deck" style={{ marginTop: "16px" }}>
              {filteredFoods.map(f => {
                return (
                  <div key={f.id} className="card card-orange pickup-card" style={{ background: "rgba(251, 245, 221, 0.4)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h4>{f.foodType}</h4>
                      <span className={`badge ${f.status === "completed" ? "badge-completed" : f.status === "claimed" ? "badge-claimed" : "badge-pending"}`}>{f.status}</span>
                    </div>

                    <div className="pickup-details">
                      <div className="pickup-details-row"><Building /><span><strong>Restaurant:</strong> {f.restaurantName}</span></div>
                      <div className="pickup-details-row"><Clock /><span><strong>Qty:</strong> {f.quantity}</span></div>
                      <div className="pickup-details-row"><MapPin /><span><strong>Address:</strong> {f.location}</span></div>
                    </div>

                    {/* GPS Delivery Track map display if claimed */}
                    {f.status === "claimed" && (
                      <div style={{ marginTop: "8px", border: "1px solid var(--color-beige-dark)", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#fdfbe6" }}>
                        <div style={{ padding: "6px", background: "rgba(48, 109, 41, 0.1)", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", color: "var(--color-green-dark)" }}>
                          <Compass size={12} className="animate-spin" /> Volunteer Transit GPS Map
                        </div>
                        {/* Interactive Vector Route Map */}
                        <svg viewBox="0 0 300 80" style={{ width: "100%", height: "80px", background: "#f8f6d6" }}>
                          <path d="M 30,40 Q 150,10 270,40" fill="none" stroke="#e7e1b1" strokeWidth="4" strokeDasharray="5,5" />
                          <path d="M 30,40 Q 150,10 270,40" fill="none" stroke="var(--color-green-medium)" strokeWidth="4" strokeDasharray="300" strokeDashoffset="200">
                            <animate attributeName="stroke-dashoffset" values="300;0" dur="8s" repeatCount="indefinite" />
                          </path>
                          <circle cx="30" cy="40" r="6" fill="var(--color-green-dark)" />
                          <circle cx="270" cy="40" r="6" fill="var(--color-green-medium)" />
                          {/* Courier Icon */}
                          <g transform="translate(150, 25)">
                            <text x="-8" y="0" style={{ fontSize: "16px" }}>🚴</text>
                            <animateMotion path="M 30,40 Q 150,10 270,40" dur="8s" repeatCount="indefinite" rotate="auto" />
                          </g>
                        </svg>
                      </div>
                    )}

                    <div style={{ marginTop: "auto", display: "flex", gap: "8px" }}>
                      {f.status === "pending" && user?.role === "volunteer" && (
                        <button className="btn btn-primary" onClick={() => onClaimPickup(f.id)} style={{ width: "100%" }}><Check size={12} /> Claim Route</button>
                      )}
                      {f.status === "claimed" && f.claimedBy === user?.uid && (
                        <button className="btn btn-primary" onClick={() => triggerCompleteClick(f)} style={{ width: "100%" }}><Check size={12} /> Mark Distributed</button>
                      )}
                      {f.status === "completed" && f.restaurantId === user?.uid && (
                        <button className="btn btn-outline" onClick={() => triggerCertClick(f)} style={{ width: "100%" }}><Award size={12} /> Exemption Cert</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Exemption Certificate modal */}
      {certModal && selectedFood && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px", padding: "40px", border: "5px double var(--color-green-dark)", textAlign: "center", background: "#fcfaf0" }}>
            <div style={{ border: "2px solid var(--color-green-medium)", padding: "30px", position: "relative" }}>
              <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "10px" }}>Tax Section 80G Compliant</div>
              <h2 style={{ fontFamily: "Outfit", color: "var(--color-green-dark)", fontSize: "28px" }}>CERTIFICATE OF DONATION</h2>
              <div style={{ margin: "20px 0", fontStyle: "italic" }}>This certificate is proudly presented to</div>
              <h3 style={{ fontSize: "24px", color: "var(--color-green-medium)", textDecoration: "underline" }}>{selectedFood.restaurantName}</h3>
              <p style={{ margin: "20px auto", maxWidth: "450px", fontSize: "13px", lineHeight: "1.6" }}>
                In recognition of donating <strong>{selectedFood.foodType}</strong> ({selectedFood.quantity}) on {new Date(selectedFood.expiryTime).toLocaleDateString()}, saving valuable resources from food wastage and supporting local shelter homes.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
                <div>
                  <div style={{ borderTop: "1px solid var(--color-green-dark)", width: "120px", marginTop: "20px", fontSize: "12px" }}>SevaSetu Audit</div>
                </div>
                <div>
                  <div style={{ borderTop: "1px solid var(--color-green-dark)", width: "120px", marginTop: "20px", fontSize: "12px" }}>NGO Coordinator</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => window.print()}>Print / Download PDF</button>
              <button className="btn btn-secondary" onClick={() => setCertModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Completion verification modal with ratings */}
      {completeModal && selectedFood && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Quality Check & Complete</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Food Quality Rating (1 - 5 Stars)</label>
                <div style={{ display: "flex", gap: "8px", margin: "10px 0" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setQualityRating(star)}
                      style={{ background: "transparent", border: "none", fontSize: "24px", cursor: "pointer", color: star <= qualityRating ? "#D4AF37" : "#BDC3C7" }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Distribution Notes & Feedback</label>
                <textarea 
                  className="form-control" 
                  placeholder="e.g. Distributed to 15 kids near Central Park. Food was hot and fresh."
                  value={qualityNotes}
                  onChange={e => setQualityNotes(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button className="btn btn-primary" onClick={submitCompletion}>Verify & Submit</button>
                <button className="btn btn-secondary" onClick={() => setCompleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Picker modal */}
      {scheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule Recurring Donation</h3>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateSchedule}>
                <div className="form-group">
                  <label>Day of the Week</label>
                  <select 
                    className="form-control"
                    value={scheduleForm.day}
                    onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Friday">Friday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <input 
                    type="time" 
                    className="form-control"
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Surplus Meal Type</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Rice, Veggies and Dal"
                    value={scheduleForm.type}
                    onChange={e => setScheduleForm({...scheduleForm, type: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Average Quantity</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Serves 20 people"
                    value={scheduleForm.qty}
                    onChange={e => setScheduleForm({...scheduleForm, qty: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary">Schedule Pickup</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setScheduleModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
