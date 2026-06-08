import { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, 
  Utensils, 
  Trash2, 
  Building, 
  Briefcase, 
  Heart, 
  ShieldAlert, 
  Pill, 
  Gift, 
  Award, 
  Plus, 
  LogOut, 
  UserPlus, 
  LogIn, 
  Camera, 
  Check, 
  Activity, 
  FileCode, 
  MapPin, 
  Clock, 
  Sparkles,
  Coins
} from "lucide-react";
import { DB } from "./db";
import { isConfigValid } from "./firebase";
import { gsap } from "gsap";

export default function App() {
  // --- STATE SYSTEM ---
  const [activeView, setActiveView] = useState("dashboard");
  const [user, setUser] = useState(null);
  
  // Real-Time Sync Lists
  const [foods, setFoods] = useState([]);
  const [drives, setDrives] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [skills, setSkills] = useState([]);
  const [crowd, setCrowd] = useState([]);
  const [sosList, setSosList] = useState([]);
  const [meds, setMeds] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ volunteers: [], restaurants: [] });

  // Dialog Overlays
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [driveModal, setDriveModal] = useState(false);
  const [proofModal, setProofModal] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState("");
  const [foodCompleteModal, setFoodCompleteModal] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [skillModal, setSkillModal] = useState(false);
  const [crowdModal, setCrowdModal] = useState(false);
  const [sosModal, setSosModal] = useState(false);
  const [medModal, setMedModal] = useState(false);
  
  // Custom Toasts
  const [toasts, setToasts] = useState([]);

  // Form Inputs State
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", role: "volunteer", address: "", description: "" });
  const [foodForm, setFoodForm] = useState({ type: "", qty: "", expiry: "", address: "" });
  const [driveForm, setDriveForm] = useState({ title: "", description: "", date: "", time: "", location: "", points: 50 });
  const [proofForm, setProofForm] = useState({ imageUrl: "" });
  const [foodCompleteForm, setFoodCompleteForm] = useState({ feedback: "" });
  const [skillForm, setSkillForm] = useState({ title: "", description: "", skill: "Graphic Design", hours: 4, points: 60 });
  const [crowdForm, setCrowdForm] = useState({ title: "", description: "", target: 10000 });
  const [sosForm, setSosForm] = useState({ title: "", description: "", severity: "high", location: "" });
  const [medForm, setMedForm] = useState({ name: "", qty: "", expiry: "", location: "" });

  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState("volunteers");
  const [activeFoodTab, setActiveFoodTab] = useState("all");
  const [activeNgoTab, setActiveNgoTab] = useState("roster");
  const [skillTaskFilter, setSkillTaskFilter] = useState("all");

  const [donationInputs, setDonationInputs] = useState({});
  const [impactProofForm, setImpactProofForm] = useState({ imageUrl: "", description: "" });
  const [selectedCrowdIdForProof, setSelectedCrowdIdForProof] = useState("");
  const [crowdProofModal, setCrowdProofModal] = useState(false);
  const [skillCompleteModal, setSkillCompleteModal] = useState(false);
  const [selectedSkillIdForComplete, setSelectedSkillIdForComplete] = useState("");
  const [skillCompleteForm, setSkillCompleteForm] = useState({ workLink: "" });

  // Top Taskbar Scroll State
  const [scrolled, setScrolled] = useState(false);

  // --- TOAST NOTIFICATIONS ---
  const triggerToast = useCallback((message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // --- SCROLL LISTENERS ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- REAL-TIME DATA SYNC ---
  useEffect(() => {
    const unsubAuth = DB.onAuthChange((userData) => {
      setUser(userData);
    });

    const unsubFoods = DB.subscribe("foods", setFoods);
    const unsubDrives = DB.subscribe("drives", setDrives);
    const unsubSkills = DB.subscribe("skills", setSkills);
    const unsubCrowd = DB.subscribe("crowd", setCrowd);
    const unsubSos = DB.subscribe("sos", setSosList);
    const unsubMeds = DB.subscribe("meds", setMeds);
    const unsubVouchers = DB.subscribe("vouchers", setVouchers);
    const unsubClaims = DB.subscribe("claims", setClaims);

    return () => {
      unsubAuth();
      unsubFoods();
      unsubDrives();
      unsubSkills();
      unsubCrowd();
      unsubSos();
      unsubMeds();
      unsubVouchers();
      unsubClaims();
    };
  }, []);

  // Sync leaderboards
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scores = await DB.getLeaderboard();
        setLeaderboard(scores);
      } catch (err) {
        console.error("Leaderboard score error:", err);
      }
    };
    fetchScores();
  }, [foods, drives, skills, user]);

  // --- GSAP VIEW ENTRANCE (ZOOMOUT EFFECT) ---
  useEffect(() => {
    gsap.fromTo(
      ".gsap-reveal",
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1.0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeView]);

  // --- SUBMISSIONS BIND ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const u = await DB.login(loginForm.email, loginForm.password);
      triggerToast(`Welcome back, ${u.name}!`);
      setAuthModal(false);
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const extra = {};
    if (registerForm.role === "restaurant") extra.address = registerForm.address;
    if (registerForm.role === "ngo") extra.description = registerForm.description;
    
    try {
      const u = await DB.register(
        registerForm.name,
        registerForm.email,
        registerForm.password,
        registerForm.role,
        extra
      );
      triggerToast(`Account created! Welcome, ${u.name}`);
      setAuthModal(false);
      setRegisterForm({ name: "", email: "", password: "", role: "volunteer", address: "", description: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleLogoutClick = async () => {
    await DB.logout();
    triggerToast("Logged out successfully.");
    setActiveView("dashboard");
  };

  // Food Waste
  const handleFoodPostSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.createFoodPickup(
        foodForm.type,
        foodForm.qty,
        new Date(foodForm.expiry).toISOString(),
        foodForm.address
      );
      triggerToast("Surplus food alert broadcasted successfully!");
      setFoodForm({ type: "", qty: "", expiry: "", address: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleClaimFoodClick = async (id) => {
    try {
      await DB.claimFoodPickup(id);
      triggerToast("Food pickup claimed! Route is locked.");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleFoodCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.completeFoodPickup(selectedFoodId, foodCompleteForm.feedback);
      triggerToast("Distribution verified! Points allocated.");
      setFoodCompleteModal(false);
      setFoodCompleteForm({ feedback: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Swachh Campaigns
  const handleDriveCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.createCleanupDrive(
        driveForm.title,
        driveForm.description,
        driveForm.date,
        driveForm.time,
        driveForm.location,
        driveForm.points
      );
      triggerToast("Cleanup campaign announced!");
      setDriveModal(false);
      setDriveForm({ title: "", description: "", date: "", time: "", location: "", points: 50 });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleJoinDriveClick = async (id) => {
    try {
      await DB.joinCleanupDrive(id);
      triggerToast("Joined campaign squad!");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.submitDriveProof(selectedDriveId, proofForm.imageUrl);
      triggerToast("Completion proof submitted! Awaiting NGO validation.");
      setProofModal(false);
      setProofForm({ imageUrl: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // NGO Roster
  const handleNGOJoinClick = async (ngoId) => {
    try {
      await DB.joinNGO(ngoId);
      triggerToast("Successfully joined NGO roster!");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleApproveProofClick = async (driveId, volunteerId) => {
    try {
      await DB.approveDriveProof(driveId, volunteerId);
      triggerToast("Proof approved! Seva points sent.");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Vouchers
  const handleRedeemVoucherClick = async (voucherId) => {
    if (window.confirm("Do you want to exchange your volunteering points for this gift coupon?")) {
      try {
        const code = await DB.redeemVoucher(voucherId);
        alert(`CONGRATULATIONS!\nYour voucher has been claimed.\n\nCode: ${code}\n\nPresent this code at partner checkout. Code is saved in your claims log below.`);
      } catch (err) {
        triggerToast(err.message, true);
      }
    }
  };

  // Skill Tasks
  const handleSkillCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.createSkillTask(
        skillForm.title,
        skillForm.description,
        skillForm.skill,
        skillForm.hours,
        skillForm.points
      );
      triggerToast("Skill micro-task published!");
      setSkillModal(false);
      setSkillForm({ title: "", description: "", skill: "Graphic Design", hours: 4, points: 60 });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleApplySkillClick = async (id) => {
    try {
      await DB.applyToSkillTask(id);
      triggerToast("Task assigned! Start collaborating.");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleSkillCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.completeSkillTask(selectedSkillIdForComplete, skillCompleteForm.workLink);
      triggerToast("Task completed! Points and hours added.");
      setSkillCompleteModal(false);
      setSkillCompleteForm({ workLink: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Donations & Crowdfunding
  const handleCrowdCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.createCampaign(crowdForm.title, crowdForm.description, crowdForm.target);
      triggerToast("Crowdfunding campaign launched!");
      setCrowdModal(false);
      setCrowdForm({ title: "", description: "", target: 10000 });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleDonateSubmit = async (campaignId) => {
    const amt = donationInputs[campaignId] || 100;
    try {
      await DB.donateToCampaign(campaignId, amt);
      triggerToast(`Thank you! Donated ₹${amt}. Points earned!`);
      setDonationInputs(prev => ({ ...prev, [campaignId]: "" }));
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleCrowdProofSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.uploadCampaignProof(
        selectedCrowdIdForProof,
        impactProofForm.imageUrl,
        impactProofForm.description
      );
      triggerToast("Impact proof upload successful!");
      setCrowdProofModal(false);
      setImpactProofForm({ imageUrl: "", description: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Emergency SOS
  const handleSOSBroadcastSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.broadcastSOS(
        sosForm.title,
        sosForm.description,
        sosForm.severity,
        sosForm.location
      );
      triggerToast("SOS broadcasted successfully!", true);
      setSosModal(false);
      setSosForm({ title: "", description: "", severity: "high", location: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleResolveSOSClick = async (id) => {
    try {
      await DB.resolveSOS(id);
      triggerToast("SOS alert resolved.");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Medicines
  const handleMedSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.donateMedicine(
        medForm.name,
        medForm.qty,
        medForm.expiry,
        medForm.location
      );
      triggerToast("Surplus medicine donation registered!");
      setMedModal(false);
      setMedForm({ name: "", qty: "", expiry: "", location: "" });
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleClaimMedClick = async (id) => {
    try {
      await DB.claimMedicine(id);
      triggerToast("Medicine surplus claimed!");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Calculated variables
  const completedMeals = foods.filter(f => f.status === "completed").length * 15;
  const activeCleanupCount = drives.length;
  const volunteerLeaderboard = leaderboard.volunteers;
  const restaurantLeaderboard = leaderboard.restaurants;
  const activeSOS = sosList.filter(s => s.status === "active");

  return (
    <div className="app-container">
      
      {/* --- STICKY TOP TASKBAR NAVIGATION --- */}
      <header className={`top-taskbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-link" onClick={() => setActiveView("dashboard")}>
          <div className="logo-box">S</div>
          <span className="logo-text">SevaSetu</span>
        </div>

        <nav className="taskbar-nav">
          <div className={`taskbar-item ${activeView === "dashboard" ? "active" : ""}`} onClick={() => setActiveView("dashboard")} role="button">
            <LayoutDashboard />
            <span>Dashboard</span>
          </div>
          <div className={`taskbar-item ${activeView === "food-waste" ? "active" : ""}`} onClick={() => setActiveView("food-waste")} role="button">
            <Utensils />
            <span>Ahaar Setu</span>
          </div>
          <div className={`taskbar-item ${activeView === "cleanup-drives" ? "active" : ""}`} onClick={() => setActiveView("cleanup-drives")} role="button">
            <Trash2 />
            <span>Swachh Setu</span>
          </div>
          <div className={`taskbar-item ${activeView === "ngo-admin" ? "active" : ""}`} onClick={() => setActiveView("ngo-admin")} role="button">
            <Building />
            <span>Sahaayak Setu</span>
          </div>
          <div className={`taskbar-item ${activeView === "skills" ? "active" : ""}`} onClick={() => setActiveView("skills")} role="button">
            <Briefcase />
            <span>Tasks</span>
          </div>
          <div className={`taskbar-item ${activeView === "crowd" ? "active" : ""}`} onClick={() => setActiveView("crowd")} role="button">
            <Heart />
            <span>Crowdfund</span>
          </div>
          <div className={`taskbar-item ${activeView === "sos" ? "active" : ""}`} onClick={() => setActiveView("sos")} role="button">
            <ShieldAlert />
            <span>SOS</span>
            {activeSOS.length > 0 && (
              <span style={{ backgroundColor: "var(--color-green-dark)", color: "var(--color-beige-light)", borderRadius: "50%", padding: "1px 5px", fontSize: "9px", fontWeight: "bold", marginLeft: "4px" }}>
                {activeSOS.length}
              </span>
            )}
          </div>
          <div className={`taskbar-item ${activeView === "meds" ? "active" : ""}`} onClick={() => setActiveView("meds")} role="button">
            <Pill />
            <span>Medicines</span>
          </div>
          <div className={`taskbar-item ${activeView === "rewards-store" ? "active" : ""}`} onClick={() => setActiveView("rewards-store")} role="button">
            <Gift />
            <span>Rewards</span>
          </div>
        </nav>

        {user ? (
          <div className="taskbar-profile">
            <div className="taskbar-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="taskbar-user-info">
              <h5>{user.name}</h5>
              <span>{user.role}</span>
            </div>
            {user.role === "volunteer" && (
              <div className="taskbar-points-badge">
                <Award size={10} />
                <span>{user.rewardPoints || 0} Pts</span>
              </div>
            )}
            {user.role === "restaurant" && (
              <div className="taskbar-points-badge">
                <Award size={10} />
                <span>{user.sevaPoints || 0} Seva Pts</span>
              </div>
            )}
            <button className="btn btn-secondary" onClick={handleLogoutClick} style={{ padding: "4px 8px", fontSize: "11px", marginLeft: "4px" }}>
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => { setAuthModal(true); setAuthTab("login"); }} style={{ padding: "8px 16px", fontSize: "12px" }}>
            <LogIn size={14} /> Login
          </button>
        )}
      </header>

      {/* --- MAIN CENTRALIZED VIEW CONTENT --- */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title-area">
            <h1>
              {activeView === "dashboard" && "SevaSetu Dashboard"}
              {activeView === "food-waste" && "Ahaar Setu"}
              {activeView === "cleanup-drives" && "Swachh Setu"}
              {activeView === "ngo-admin" && (user?.role === "ngo" ? "NGO Administration Console" : "Sahaayak Setu")}
              {activeView === "skills" && "Skill-Based Volunteering"}
              {activeView === "crowd" && "Transparent Crowdfunding"}
              {activeView === "sos" && "Emergency SOS relief"}
              {activeView === "meds" && "Surplus Medicine Pool"}
              {activeView === "rewards-store" && "Voucher Store Marketplace"}
            </h1>
            <p style={{ marginTop: "4px" }}>
              {activeView === "dashboard" && "Overview of community impact, leaderboards, and collaborative modules."}
              {activeView === "food-waste" && "Post food surplus alerts or claim pickups to feed local shelters."}
              {activeView === "cleanup-drives" && "Join sanitation drives or organize cleanup events in your area."}
              {activeView === "ngo-admin" && "Connect with partner NGOs, roster volunteers, and approve work proofs."}
              {activeView === "skills" && "NGOs post skilled tasks; volunteers apply and collaborate."}
              {activeView === "crowd" && "Fund verified campaigns and track spending allocations with transparency."}
              {activeView === "sos" && "Real-time emergency relief coordinates and volunteer broadcasts."}
              {activeView === "meds" && "Redistribute unexpired surplus medicines to free clinics."}
              {activeView === "rewards-store" && "Exchange points earned from civic work for digital gift discount codes."}
            </p>
          </div>
        </header>

        {/* --- VIEW 1: DASHBOARD --- */}
        {activeView === "dashboard" && (
          <section className="module-panel gsap-reveal">
            <div className="stats-grid">
              <div className="card stat-card card-teal">
                <div className="stat-icon teal"><Utensils /></div>
                <div className="stat-info">
                  <span className="stat-number">{completedMeals.toLocaleString()}</span>
                  <span className="stat-label">Meals Redistributed</span>
                </div>
              </div>
              <div className="card stat-card card-violet">
                <div className="stat-icon violet"><Trash2 /></div>
                <div className="stat-info">
                  <span className="stat-number">{activeCleanupCount}</span>
                  <span className="stat-label">Sanitation Campaigns</span>
                </div>
              </div>
              <div className="card stat-card card-orange">
                <div className="stat-icon orange"><ShieldAlert /></div>
                <div className="stat-info">
                  <span className="stat-number">{activeSOS.length}</span>
                  <span className="stat-label">Active SOS Alerts</span>
                </div>
              </div>
            </div>

            <div className="dashboard-columns">
              <div className="card card-teal">
                <div className="info-header">
                  <h3>Connecting Hearts, Empowering Civic Drives</h3>
                </div>
                <p style={{ lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  SevaSetu is a real-time coordination ecosystem. We link restaurants throwing away excess food to active volunteers, coordinate Swachh Bharat cleanliness drives, manage NGO operations, and reward active citizens with digital coupons sponsored by brands (Zepto, Swiggy, etc.).
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "10px" }}>
                  <div style={{ background: "rgba(231, 225, 177, 0.2)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                    <h4 style={{ color: "var(--color-green-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={16} /> Real-Time Live Sync</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Fully bound to live Firestore. Feeds update instantly as users post actions.</p>
                  </div>
                  <div style={{ background: "rgba(231, 225, 177, 0.2)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                    <h4 style={{ color: "var(--color-green-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><Coins size={16} /> Volunteering Points</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Every claimed food delivery, drive completion, or task approval rewards you points.</p>
                  </div>
                </div>
              </div>

              <div className="card card-violet">
                <div className="info-header">
                  <h3>Top Contributors</h3>
                </div>
                <div className="tab-group" style={{ marginBottom: "16px" }}>
                  <button className={`tab-btn ${activeLeaderboardTab === "volunteers" ? "active" : ""}`} onClick={() => setActiveLeaderboardTab("volunteers")}>Volunteers</button>
                  <button className={`tab-btn ${activeLeaderboardTab === "restaurants" ? "active" : ""}`} onClick={() => setActiveLeaderboardTab("restaurants")}>Restaurants</button>
                </div>
                
                <div className="leaderboard-list">
                  {activeLeaderboardTab === "volunteers" ? (
                    volunteerLeaderboard.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>No volunteers recorded.</p>
                    ) : (
                      volunteerLeaderboard.slice(0, 5).map((v, idx) => (
                        <div key={v.uid} className={`leaderboard-item rank-${idx+1}`}>
                          <div className="leaderboard-item-info">
                            <span className="leaderboard-rank">{idx + 1}</span>
                            <div className="user-avatar" style={{ width: "30px", height: "30px", fontSize: "12px" }}>{v.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <h5 style={{ fontSize: "13px" }}>{v.name}</h5>
                              <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{v.completedCount || 0} achievements</span>
                            </div>
                          </div>
                          <span className="leaderboard-points">{v.rewardPoints || 0} Pts</span>
                        </div>
                      ))
                    )
                  ) : (
                    restaurantLeaderboard.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>No restaurants recorded.</p>
                    ) : (
                      restaurantLeaderboard.slice(0, 5).map((r, idx) => (
                        <div key={r.uid} className={`leaderboard-item rank-${idx+1}`}>
                          <div className="leaderboard-item-info">
                            <span className="leaderboard-rank">{idx + 1}</span>
                            <div className="user-avatar" style={{ width: "30px", height: "30px", fontSize: "12px", borderColor: "var(--color-green-medium)", color: "var(--color-green-medium)" }}>{r.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <h5 style={{ fontSize: "13px" }}>{r.name}</h5>
                              <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{r.address ? r.address.split(",")[0] : "Local"}</span>
                            </div>
                          </div>
                          <span className="leaderboard-points orange">{r.sevaPoints || 0} Seva Pts</span>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- VIEW 2: FOOD WASTE (Ahaar Setu) --- */}
        {activeView === "food-waste" && (
          <section className="module-panel gsap-reveal">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
              <div className="card card-teal" style={{ height: "max-content" }}>
                <h3>Report Surplus Food</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "6px 0 20px 0" }}>Share details of surplus food so nearby volunteers are alerted.</p>
                {user?.role === "restaurant" ? (
                  <form onSubmit={handleFoodPostSubmit}>
                    <div className="form-group">
                      <label>Food Item(s)</label>
                      <input type="text" className="form-control" placeholder="e.g. Rice, Dal, 15 Rotis" value={foodForm.type} onChange={e => setFoodForm({...foodForm, type: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Estimated Quantity</label>
                      <input type="text" className="form-control" placeholder="e.g. For 10 people" value={foodForm.qty} onChange={e => setFoodForm({...foodForm, qty: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Safe Expiry Date & Time</label>
                      <input type="datetime-local" className="form-control" value={foodForm.expiry} onChange={e => setFoodForm({...foodForm, expiry: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Pickup Location Address</label>
                      <textarea className="form-control" placeholder="Complete address details" value={foodForm.address} onChange={e => setFoodForm({...foodForm, address: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Plus size={16} /> Broadcast Food Alert</button>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: "30px 0" }}>
                    <Utensils style={{ width: "36px", height: "36px", color: "var(--color-green-medium)", marginBottom: "12px", margin: "0 auto" }} />
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "10px" }}>Please sign in as a <strong>Restaurant</strong> to register food waste alerts.</p>
                  </div>
                )}
              </div>

              <div className="card card-teal">
                <div className="feed-header">
                  <h3>Active Food Alerts</h3>
                  {user?.role === "volunteer" && (
                    <div className="tab-group">
                      <button className={`tab-btn ${activeFoodTab === "all" ? "active" : ""}`} onClick={() => setActiveFoodTab("all")}>Available</button>
                      <button className={`tab-btn ${activeFoodTab === "mine" ? "active" : ""}`} onClick={() => setActiveFoodTab("mine")}>My Claims</button>
                    </div>
                  )}
                </div>

                <div className="card-deck">
                  {foods.filter(f => activeFoodTab === "all" ? (f.status === "pending" || (user && f.claimedBy === user.uid)) : (user && f.claimedBy === user.uid)).length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No active food pickup coordinates found.</p>
                  ) : (
                    foods.filter(f => activeFoodTab === "all" ? (f.status === "pending" || (user && f.claimedBy === user.uid)) : (user && f.claimedBy === user.uid)).map(f => {
                      const isExpired = new Date(f.expiryTime) < new Date();
                      return (
                        <div key={f.id} className={`card pickup-card ${f.status === "completed" ? "card-teal" : f.status === "claimed" ? "card-violet" : "card-orange"}`} style={{ padding: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                            <h4 style={{ fontSize: "16px" }}>{f.foodType}</h4>
                            <span className={`badge ${f.status === "completed" ? "badge-completed" : f.status === "claimed" ? "badge-claimed" : "badge-pending"}`}>{f.status}</span>
                          </div>
                          
                          <div className="pickup-details" style={{ flexGrow: 1, marginTop: "12px" }}>
                            <div className="pickup-details-row">
                              <Building />
                              <span><strong>Restaurant:</strong> {f.restaurantName}</span>
                            </div>
                            <div className="pickup-details-row">
                              <Coins />
                              <span><strong>Quantity:</strong> {f.quantity}</span>
                            </div>
                            <div className="pickup-details-row">
                              <Clock />
                              <span style={isExpired && f.status === "pending" ? { color: "var(--color-green-dark)", fontWeight: "bold" } : {}}>
                                <strong>Expiry:</strong> {new Date(f.expiryTime).toLocaleString()} {isExpired && f.status === "pending" && "(Expired)"}
                              </span>
                            </div>
                            <div className="pickup-details-row">
                              <MapPin />
                              <span><strong>Pickup:</strong> {f.location}</span>
                            </div>
                            {f.feedback && (
                              <p style={{ padding: "8px", background: "rgba(251, 245, 221, 0.4)", border: "1px dashed var(--color-beige-dark)", borderRadius: "var(--radius-sm)", fontSize: "11px", fontStyle: "italic", color: "var(--color-green-dark)" }}>
                                "{f.feedback}"
                              </p>
                            )}
                          </div>

                          {f.status === "pending" && user?.role === "volunteer" && (
                            <button className="btn btn-primary" onClick={() => handleClaimFoodClick(f.id)} style={{ width: "100%", marginTop: "12px" }}><Check size={14} /> Claim Pickup</button>
                          )}
                          {f.status === "claimed" && user?.uid === f.claimedBy && (
                            <button className="btn btn-orange" onClick={() => { setSelectedFoodId(f.id); setSelectedFoodId(f.id); setFoodCompleteModal(true); }} style={{ width: "100%", marginTop: "12px" }}><Activity size={14} /> Complete Delivery</button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- VIEW 3: CLEANUP DRIVES (Swachh Setu) --- */}
        {activeView === "cleanup-drives" && (
          <section className="module-panel gsap-reveal">
            <div className="content-header" style={{ padding: 0 }}>
              <div className="header-title-area">
                <h3>Active Sanitation Campaigns</h3>
                <p>Form teams and claim points by cleaning public areas.</p>
              </div>
              {user?.role === "ngo" && (
                <button className="btn btn-orange" onClick={() => setDriveModal(true)}><Plus size={16} /> Schedule a Drive</button>
              )}
            </div>

            <div className="card-deck">
              {drives.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No scheduled cleanup drives found.</p>
              ) : (
                drives.map(d => {
                  const hasJoined = user && d.participants.includes(user.uid);
                  const isOrganizer = user && d.organizerId === user.uid;
                  const hasSubmitted = user && d.proofs.some(p => p.volunteerId === user.uid);
                  const isApproved = user && d.proofs.some(p => p.volunteerId === user.uid && p.approved);

                  return (
                    <div key={d.id} className="card card-violet" style={{ display: "flex", flexDirection: "column", minHeight: "300px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "18px" }}>{d.title}</h4>
                        <span className="user-points-badge" style={{ color: "var(--color-green-dark)", borderColor: "rgba(13, 83, 14, 0.3)", backgroundColor: "rgba(231, 225, 177, 0.4)", fontSize: "11px" }}>
                          +{d.pointsReward} Pts
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", flexGrow: 1, marginBottom: "16px" }}>{d.description}</p>
                      
                      <div className="pickup-details" style={{ marginBottom: "16px" }}>
                        <div className="pickup-details-row"><Clock /><span>{d.date} at {d.time}</span></div>
                        <div className="pickup-details-row"><MapPin /><span>{d.location}</span></div>
                        <div className="pickup-details-row"><Building /><span>Organizer: {d.organizerName}</span></div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-beige-dark)", paddingTop: "12px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.participants.length} joined</span>
                        {user?.role === "volunteer" && (
                          !hasJoined ? (
                            <button className="btn btn-primary" onClick={() => handleJoinDriveClick(d.id)} style={{ padding: "8px 16px", fontSize: "12px" }}>Join Roster</button>
                          ) : (
                            isApproved ? (
                              <span style={{ color: "var(--color-green-dark)", fontSize: "12px", fontWeight: "bold" }}><Check size={14} /> Points Awarded</span>
                            ) : hasSubmitted ? (
                              <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontStyle: "italic" }}>Review Pending</span>
                            ) : (
                              <button className="btn btn-orange" onClick={() => { setSelectedDriveId(d.id); setProofModal(true); }} style={{ padding: "8px 16px", fontSize: "12px" }}><Camera size={14} /> Submit Proof</button>
                            )
                          )
                        )}
                        {isOrganizer && (
                          <button className="btn btn-outline" onClick={() => setActiveView("ngo-admin")} style={{ padding: "8px 16px", fontSize: "12px" }}>Admin Console</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 4: NGO MANAGEMENT & DIRECTORY --- */}
        {activeView === "ngo-admin" && (
          <section className="module-panel gsap-reveal">
            {user?.role === "ngo" ? (
              <div className="card card-violet">
                <div className="feed-header">
                  <h3>NGO Administration Console</h3>
                  <div className="tab-group">
                    <button className={`tab-btn ${activeNgoTab === "roster" ? "active" : ""}`} onClick={() => setActiveNgoTab("roster")}>Active Roster</button>
                    <button className={`tab-btn ${activeNgoTab === "proofs" ? "active" : ""}`} onClick={() => setActiveNgoTab("proofs")}>Pending Work Reviews</button>
                  </div>
                </div>

                {activeNgoTab === "roster" ? (
                  <div className="leaderboard-list">
                    {leaderboard.volunteers.filter(v => v.ngoId === user.uid).length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "30px" }}>No registered volunteers in your roster yet.</p>
                    ) : (
                      leaderboard.volunteers.filter(v => v.ngoId === user.uid).map((v, idx) => (
                        <div key={v.uid} className="leaderboard-item">
                          <div className="leaderboard-item-info">
                            <span className="leaderboard-rank">{idx + 1}</span>
                            <div className="user-avatar" style={{ width: "30px", height: "30px", fontSize: "12px" }}>{v.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <h5 style={{ fontSize: "13px" }}>{v.name}</h5>
                              <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{v.impactHours || 0} volunteering hours log</span>
                            </div>
                          </div>
                          <span className="leaderboard-points">{v.rewardPoints || 0} Pts</span>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="leaderboard-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                    {drives.filter(d => d.organizerId === user.uid && d.proofs.some(p => !p.approved)).length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "30px", gridColumn: "1/-1" }}>No work completion proofs awaiting review.</p>
                    ) : (
                      drives.filter(d => d.organizerId === user.uid).flatMap(d => 
                        d.proofs.filter(p => !p.approved).map(p => (
                          <div key={d.id + "_" + p.volunteerId} className="card card-violet" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center" }}>
                              <h5 style={{ fontSize: "14px" }}>{p.volunteerName}</h5>
                              <span className="badge badge-pending">+{d.pointsReward} Pts</span>
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Campaign: <strong>{d.title}</strong></span>
                            
                            <img src={p.imageUrl} style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-beige-dark)" }} onerror={(e)=>{e.target.src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300"}} />

                            <button className="btn btn-primary" onClick={() => handleApproveProofClick(d.id, p.volunteerId)} style={{ width: "100%", padding: "8px 12px", fontSize: "12px" }}><Check size={12} /> Approve Work</button>
                          </div>
                        ))
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card card-violet">
                <h3>Explore Verified Partner NGOs</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "6px 0 24px 0" }}>Apply to join NGO cohorts to participate in their coordinated relief campaigns.</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                  {[
                    { uid: "ngo_1", name: "Robin Hood Army", description: "A zero-funds volunteer organization routing surplus food from restaurants to underprivileged houses.", members: 142 },
                    { uid: "ngo_2", name: "Clean Earth Foundation", description: "Dedicated to driving street cleans, public hygiene education, and Swachh drives in major subways.", members: 89 }
                  ].map(n => {
                    const isJoined = user && user.ngoId === n.uid;
                    return (
                      <div key={n.uid} className={`card ${isJoined ? "card-violet" : ""}`} style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                        <div>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                            <div className="logo-box" style={{ width: "36px", height: "36px", fontSize: "16px", borderRadius: "8px" }}>N</div>
                            <div>
                              <h4 style={{ fontSize: "16px" }}>{n.name}</h4>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{n.members} active squad members</span>
                            </div>
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{n.description}</p>
                        </div>

                        {user?.role === "volunteer" ? (
                          isJoined ? (
                            <button className="btn btn-secondary" style={{ width: "100%" }} disabled><Check size={14} /> Registered</button>
                          ) : (
                            <button className="btn btn-primary" onClick={() => handleNGOJoinClick(n.uid)} style={{ width: "100%" }}>Join Volunteer Team</button>
                          )
                        ) : (
                          <button className="btn btn-outline" onClick={() => setAuthModal(true)} style={{ width: "100%" }}>Log in to Join</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- VIEW 5: SEVA TASKS (Skill-Based volunteering) --- */}
        {activeView === "skills" && (
          <section className="module-panel gsap-reveal">
            <div className="content-header" style={{ padding: 0 }}>
              <div className="header-title-area">
                <h3>Skill-Based Volunteering Marketplace</h3>
                <p>Earn points by offering design, teaching, or administrative skills.</p>
              </div>
              {user?.role === "ngo" && (
                <button className="btn btn-primary" onClick={() => setSkillModal(true)}><Plus size={16} /> Post a Task</button>
              )}
            </div>

            <div className="tab-group" style={{ marginBottom: "10px" }}>
              <button className={`tab-btn ${skillTaskFilter === "all" ? "active" : ""}`} onClick={() => setSkillTaskFilter("all")}>All Tasks</button>
              <button className={`tab-btn ${skillTaskFilter === "mine" ? "active" : ""}`} onClick={() => setSkillTaskFilter("mine")}>My Tasks</button>
            </div>

            <div className="card-deck">
              {skills.filter(t => skillTaskFilter === "all" ? true : (user && t.assignedTo === user.uid)).length === 0 ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No skill-based tasks published.</p>
              ) : (
                skills.filter(t => skillTaskFilter === "all" ? true : (user && t.assignedTo === user.uid)).map(t => {
                  const isAssigned = t.status === "assigned";
                  const isCompleted = t.status === "completed";
                  const isMine = user && t.assignedTo === user.uid;

                  return (
                    <div key={t.id} className={`card ${isCompleted ? "card-teal" : isAssigned ? "card-purple" : "card-orange"}`} style={{ display: "flex", flexDirection: "column", minHeight: "300px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "18px" }}>{t.title}</h4>
                        <span className="badge badge-pending">
                          {t.requiredSkill}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", flexGrow: 1, marginBottom: "16px" }}>{t.description}</p>
                      
                      <div className="pickup-details" style={{ marginBottom: "16px" }}>
                        <div className="pickup-details-row"><Award /><span>Reward: <strong>+{t.pointsReward} Points</strong></span></div>
                        <div className="pickup-details-row"><Clock /><span>Impact Hours: <strong>{t.hoursReward} Hours</strong></span></div>
                        <div className="pickup-details-row"><Building /><span>NGO: {t.organizerName}</span></div>
                      </div>

                      {t.status === "open" && user?.role === "volunteer" && (
                        <button className="btn btn-primary" onClick={() => handleApplySkillClick(t.id)} style={{ width: "100%" }}>Apply to Work</button>
                      )}
                      {t.status === "assigned" && isMine && (
                        <button className="btn btn-orange" onClick={() => { setSelectedSkillIdForComplete(t.id); setSkillCompleteModal(true); }} style={{ width: "100%" }}>Submit Deliverable</button>
                      )}
                      {isCompleted && (
                        <div style={{ padding: "8px", background: "rgba(251, 245, 221, 0.4)", border: "1px dashed var(--color-beige-dark)", borderRadius: "var(--radius-sm)", fontSize: "11px" }}>
                          <span><FileCode style={{ display: "inline", width: "12px", height: "12px", marginRight: "4px" }} /> Work link: <a href={t.workLink} target="_blank" style={{ color: "var(--color-green-dark)", fontWeight: "bold" }}>{t.workLink.substring(0, 24)}...</a></span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 6: CROWDFUNDING & DONATIONS --- */}
        {activeView === "crowd" && (
          <section className="module-panel gsap-reveal">
            <div className="content-header" style={{ padding: 0 }}>
              <div className="header-title-area">
                <h3>Micro-Crowdfunding & Proof of Impact</h3>
                <p>Support campaigns directly and verify funding allocation through timeline photographs.</p>
              </div>
              {user?.role === "ngo" && (
                <button className="btn btn-primary" onClick={() => setCrowdModal(true)}><Plus size={16} /> Create Campaign</button>
              )}
            </div>

            <div className="card-deck" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
              {crowd.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No crowdfunding drives active.</p>
              ) : (
                crowd.map(c => {
                  const percent = Math.min(Math.round((c.currentAmount / c.targetAmount) * 100), 100);
                  const isOrganizer = user && c.organizerId === user.uid;

                  return (
                    <div key={c.id} className="card card-teal" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <h4 style={{ fontSize: "18px" }}>{c.title}</h4>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Organized by <strong>{c.organizerName}</strong></span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{c.description}</p>
                      
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                          <span>₹{c.currentAmount.toLocaleString()} Raised</span>
                          <span style={{ color: "var(--color-green-dark)" }}>{percent}% (Target: ₹{c.targetAmount.toLocaleString()})</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid var(--color-beige-dark)", paddingTop: "14px", marginTop: "4px" }}>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                          <input type="number" className="form-control" placeholder="₹ Amount" style={{ flexGrow: 1, padding: "8px 12px" }} value={donationInputs[c.id] || ""} onChange={e => setDonationInputs({ ...donationInputs, [c.id]: e.target.value })} />
                          <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }} onClick={() => handleDonateSubmit(c.id)}>Donate</button>
                        </div>

                        {isOrganizer && (
                          <button className="btn btn-outline" style={{ width: "100%", fontSize: "12px", padding: "8px" }} onClick={() => { setSelectedCrowdIdForProof(c.id); setCrowdProofModal(true); }}><Camera size={14} /> Upload Expense Proof</button>
                        )}
                      </div>

                      {c.proofs && c.proofs.length > 0 && (
                        <div style={{ background: "rgba(251, 245, 221, 0.4)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                          <h5 style={{ fontSize: "12px", color: "var(--color-green-dark)", marginBottom: "8px" }}><Sparkles size={12} /> Live Proof Timeline</h5>
                          {c.proofs.map((pr, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "10px", marginTop: "8px", borderTop: idx > 0 ? "1px solid var(--color-beige-dark)" : "none", paddingTop: idx > 0 ? "8px" : 0 }}>
                              <img src={pr.imageUrl} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} onerror={(e)=>{e.target.src="https://images.unsplash.com/photo-1595275313093-f112e077189d?w=100"}} />
                              <div>
                                <p style={{ fontSize: "11px", color: "var(--color-green-dark)", fontWeight: "500" }}>{pr.description}</p>
                                <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{new Date(pr.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 7: EMERGENCY SOS RELIEF --- */}
        {activeView === "sos" && (
          <section className="module-panel gsap-reveal">
            <div className="content-header" style={{ padding: 0 }}>
              <div className="header-title-area">
                <h3>Real-Time SOS Disaster Relief Coordinates</h3>
                <p>Broadcast high-severity alerts for low-lying areas requiring immediate supply drops.</p>
              </div>
              <button className="btn btn-orange" onClick={() => setSosModal(true)}><ShieldAlert size={16} /> Broadcast SOS</button>
            </div>

            <div className="card-deck">
              {sosList.filter(s => s.status === "active").length === 0 ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No active SOS alerts. Town is safe.</p>
              ) : (
                sosList.filter(s => s.status === "active").map(s => (
                  <div key={s.id} className="card sos-pulse-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="badge badge-pending" style={{ borderColor: "var(--color-green-dark)", color: "var(--color-green-dark)", fontWeight: "bold" }}>{s.severity} Severity</span>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{new Date(s.date).toLocaleTimeString()}</span>
                    </div>
                    <h4>{s.title}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", flexGrow: 1 }}>{s.description}</p>
                    
                    <div className="pickup-details" style={{ margin: "4px 0" }}>
                      <div className="pickup-details-row"><MapPin /><span>Location: {s.location}</span></div>
                    </div>

                    {(user?.role === "ngo" || user?.role === "volunteer") && (
                      <button className="btn btn-primary" onClick={() => handleResolveSOSClick(s.id)} style={{ width: "100%" }}><Check size={14} /> Mark as Resolved</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 8: SURPLUS MEDICINE --- */}
        {activeView === "meds" && (
          <section className="module-panel gsap-reveal">
            <div className="content-header" style={{ padding: 0 }}>
              <div className="header-title-area">
                <h3>Surplus Medicine Pool</h3>
                <p>Donate unused, unexpired medicines from home cabinets to distribute at free clinics.</p>
              </div>
              {user ? (
                <button className="btn btn-primary" onClick={() => setMedModal(true)}><Plus size={16} /> Donate Medicines</button>
              ) : (
                <button className="btn btn-outline" onClick={() => setAuthModal(true)}>Login to Donate</button>
              )}
            </div>

            <div className="card-deck">
              {meds.filter(m => m.status === "available").length === 0 ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>No medicine pool coordinates currently registered.</p>
              ) : (
                meds.filter(m => m.status === "available").map(m => (
                  <div key={m.id} className="card card-orange" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "240px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", justifyItems: "center", alignItems: "center", marginBottom: "8px" }}>
                        <h4>{m.medicineName}</h4>
                        <span className="badge badge-pending">Available</span>
                      </div>
                      <div className="pickup-details" style={{ marginTop: "12px" }}>
                        <div className="pickup-details-row"><Coins /><span>Quantity: {m.quantity}</span></div>
                        <div className="pickup-details-row"><Clock /><span>Expiry: {m.expiryDate}</span></div>
                        <div className="pickup-details-row"><MapPin /><span>Location: {m.location}</span></div>
                      </div>
                    </div>
                    
                    {(user?.role === "ngo" || user?.role === "volunteer") && (
                      <button className="btn btn-primary" onClick={() => handleClaimMedClick(m.id)} style={{ width: "100%", marginTop: "15px" }}><Check size={14} /> Claim Medicine</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* --- VIEW 9: REWARDS STORE --- */}
        {activeView === "rewards-store" && (
          <section className="module-panel gsap-reveal">
            <div className="content-header" style={{ padding: 0 }}>
              <div className="header-title-area">
                <h3>Voucher Store Marketplace</h3>
                <p>Claim digital partner codes for Swiggy, Zepto, and more using points.</p>
              </div>
              <div className="user-points-badge" style={{ fontSize: "12px", padding: "8px 16px" }}>
                <Award size={14} />
                <span>{user?.role === "volunteer" ? `${user.rewardPoints || 0} Points Available` : "Guest Balance: 0 Points"}</span>
              </div>
            </div>

            <div className="voucher-grid">
              {vouchers.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center" }}>Loading rewards shelves...</p>
              ) : (
                vouchers.map(v => {
                  const hasPoints = user && (user.rewardPoints || 0) >= v.pointsCost;
                  return (
                    <div key={v.id} className="card voucher-card card-orange" style={{ padding: "20px" }}>
                      <img src={v.image} className="voucher-logo" alt={v.partner} onerror={(e)=>{e.target.src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=100"}} />
                      <h4>{v.partner}</h4>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{v.title}</span>
                      <span className="voucher-cost">{v.pointsCost} Points</span>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{v.description}</p>
                      
                      {user?.role === "volunteer" ? (
                        <button className="btn btn-primary" onClick={() => handleRedeemVoucherClick(v.id)} style={{ width: "100%" }} disabled={!hasPoints}>
                          {hasPoints ? "Claim Coupon" : "Insufficient Points"}
                        </button>
                      ) : (
                        <button className="btn btn-outline" onClick={() => setAuthModal(true)} style={{ width: "100%" }}>Login to Claim</button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="card card-orange" style={{ marginTop: "40px" }}>
              <h3>Redeemed Promo Codes</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "6px 0 20px 0" }}>Present these digital codes at partner checkouts to claim discounts.</p>
              
              <div className="leaderboard-list">
                {claims.filter(c => user && c.volunteerId === user.uid).length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px", fontStyle: "italic" }}>No redeemed vouchers recorded in history.</p>
                ) : (
                  claims.filter(c => user && c.volunteerId === user.uid).map(c => (
                    <div key={c.id} className="leaderboard-item">
                      <div className="leaderboard-item-info">
                        <div className="user-avatar" style={{ width: "34px", height: "34px", borderColor: "var(--color-green-medium)", color: "var(--color-beige-light)" }}>{c.partner.charAt(0)}</div>
                        <div>
                          <h5 style={{ fontSize: "13px" }}>{c.partner} - {c.voucherTitle}</h5>
                          <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Redeemed on {new Date(c.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span style={{ fontStyle: "normal", fontSize: "13px", fontWeight: "800", color: "var(--color-green-dark)", border: "1px dashed var(--color-green-medium)", padding: "4px 10px", borderRadius: "4px", background: "rgba(231,225,177,0.2)", userSelect: "all", cursor: "copy" }}>
                        {c.code}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* --- TOAST ALERTS OVERLAY --- */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.isError ? "toast-error" : ""}`}>
            <Activity size={18} style={{ color: "var(--color-green-dark)" }} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* --- SETUP ENV KEYS BANNER --- */}
      {!isConfigValid && (
        <div className="demo-mode-indicator">
          <div className="demo-mode-dot"></div>
          <span>Demo Mode (LocalStorage Sandbox)</span>
        </div>
      )}

      {/* --- MODAL 1: AUTH MODAL --- */}
      {authModal && (
        <div className="modal-overlay" onClick={() => setAuthModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authTab === "login" ? "Sign In" : "Create Account"}</h3>
              <button className="modal-close" onClick={() => setAuthModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="tab-group" style={{ justifyContent: "center", marginBottom: "20px" }}>
                <button className={`tab-btn ${authTab === "login" ? "active" : ""}`} onClick={() => setAuthTab("login")}>Sign In</button>
                <button className={`tab-btn ${authTab === "register" ? "active" : ""}`} onClick={() => setAuthTab("register")}>Create Account</button>
              </div>

              {authTab === "login" ? (
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" placeholder="name@domain.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><LogIn size={14} /> Log In</button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-group">
                    <label>Name / Org Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Clean Earth" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" placeholder="name@domain.com" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Account Role Type</label>
                    <select className="form-control" value={registerForm.role} onChange={e => setRegisterForm({...registerForm, role: e.target.value})} required>
                      <option value="volunteer">Volunteer (Citizen)</option>
                      <option value="ngo">NGO Administrator</option>
                      <option value="restaurant">Restaurant Owner</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="Min 6 characters" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} required minLength={6} />
                  </div>
                  {registerForm.role === "restaurant" && (
                    <div className="form-group animate-slide">
                      <label>Business Address</label>
                      <textarea className="form-control" placeholder="123, Street name" value={registerForm.address} onChange={e => setRegisterForm({...registerForm, address: e.target.value})} required />
                    </div>
                  )}
                  {registerForm.role === "ngo" && (
                    <div className="form-group animate-slide">
                      <label>NGO Objective / Mission</label>
                      <textarea className="form-control" placeholder="Short description of your targets..." value={registerForm.description} onChange={e => setRegisterForm({...registerForm, description: e.target.value})} required />
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><UserPlus size={14} /> Create Account</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SCHEDULE CLEANUP DRIVE --- */}
      {driveModal && (
        <div className="modal-overlay" onClick={() => setDriveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Cleanup Drive</h3>
              <button className="modal-close" onClick={() => setDriveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleDriveCreateSubmit}>
                <div className="form-group">
                  <label>Drive Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Sector 2 Plastic Sweeper" value={driveForm.title} onChange={e => setDriveForm({...driveForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea className="form-control" placeholder="Scope of cleaning" value={driveForm.description} onChange={e => setDriveForm({...driveForm, description: e.target.value})} required />
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label>Date</label>
                    <input type="date" className="form-control" value={driveForm.date} onChange={e => setDriveForm({...driveForm, date: e.target.value})} required />
                  </div>
                  <div>
                    <label>Time</label>
                    <input type="text" className="form-control" placeholder="08:00 AM" value={driveForm.time} onChange={e => setDriveForm({...driveForm, time: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Assembly Location</label>
                  <input type="text" className="form-control" placeholder="e.g. Park Gate" value={driveForm.location} onChange={e => setDriveForm({...driveForm, location: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Volunteer Points Reward</label>
                  <input type="number" className="form-control" value={driveForm.points} onChange={e => setDriveForm({...driveForm, points: e.target.value})} required min={10} max={200} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Plus size={14} /> Broadcast Campaign</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: SUBMIT WORK PROOF --- */}
      {proofModal && (
        <div className="modal-overlay" onClick={() => setProofModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Cleanup Proof</h3>
              <button className="modal-close" onClick={() => setProofModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleProofSubmit}>
                <div className="form-group">
                  <label>Photo URL (Simulated Camera Upload)</label>
                  <input type="url" className="form-control" placeholder="https://images.unsplash.com/..." value={proofForm.imageUrl} onChange={e => setProofForm({...proofForm, imageUrl: e.target.value})} required />
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>Paste any online photo link to simulate uploading coordinates.</p>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Camera size={14} /> Submit Proof</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: VERIFY FOOD COMPLETION --- */}
      {foodCompleteModal && (
        <div className="modal-overlay" onClick={() => setFoodCompleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Verify Distribution Completed</h3>
              <button className="modal-close" onClick={() => setFoodCompleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFoodCompleteSubmit}>
                <div className="form-group">
                  <label>Distribution Notes / Feedback</label>
                  <textarea className="form-control" placeholder="Where did you distribute? e.g. orphanage" value={foodCompleteForm.feedback} onChange={e => setFoodCompleteForm({...foodCompleteForm, feedback: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Check size={14} /> Confirm Completed</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: POST SKILL TASK --- */}
      {skillModal && (
        <div className="modal-overlay" onClick={() => setSkillModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Publish Skill Task</h3>
              <button className="modal-close" onClick={() => setSkillModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSkillCreateSubmit}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Poster Design" value={skillForm.title} onChange={e => setSkillForm({...skillForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" placeholder="Task deliverables" value={skillForm.description} onChange={e => setSkillForm({...skillForm, description: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Required Skill Tag</label>
                  <select className="form-control" value={skillForm.skill} onChange={e => setSkillForm({...skillForm, skill: e.target.value})} required>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Writing">Writing</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label>Impact Hours</label>
                    <input type="number" className="form-control" value={skillForm.hours} onChange={e => setSkillForm({...skillForm, hours: e.target.value})} required />
                  </div>
                  <div>
                    <label>Points Prize</label>
                    <input type="number" className="form-control" value={skillForm.points} onChange={e => setSkillForm({...skillForm, points: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Plus size={14} /> Announce Task</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: SUBMIT SKILL TASK DELIVERABLE --- */}
      {skillCompleteModal && (
        <div className="modal-overlay" onClick={() => setSkillCompleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Completed Work</h3>
              <button className="modal-close" onClick={() => setSkillCompleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSkillCompleteSubmit}>
                <div className="form-group">
                  <label>Work Link (Figma/Drive/Doc Link)</label>
                  <input type="url" className="form-control" placeholder="https://drive.google.com/..." value={skillCompleteForm.workLink} onChange={e => setSkillCompleteForm({...skillCompleteForm, workLink: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Check size={14} /> Submit Task</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 7: CREATE CROWDFUND CAMPAIGN --- */}
      {crowdModal && (
        <div className="modal-overlay" onClick={() => setCrowdModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Crowdfunding Campaign</h3>
              <button className="modal-close" onClick={() => setCrowdModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCrowdCreateSubmit}>
                <div className="form-group">
                  <label>Campaign Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Repair Classrooms" value={crowdForm.title} onChange={e => setCrowdForm({...crowdForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Detailed Objective Description</label>
                  <textarea className="form-control" placeholder="What will the donations buy?" value={crowdForm.description} onChange={e => setCrowdForm({...crowdForm, description: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Target Funding Amount (₹)</label>
                  <input type="number" className="form-control" value={crowdForm.target} onChange={e => setCrowdForm({...crowdForm, target: e.target.value})} required min={500} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Plus size={14} /> Publish Campaign</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 8: UPLOAD CROWDFUNDING IMPACT PROOF --- */}
      {crowdProofModal && (
        <div className="modal-overlay" onClick={() => setCrowdProofModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Expense Proof</h3>
              <button className="modal-close" onClick={() => setCrowdProofModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCrowdProofSubmit}>
                <div className="form-group">
                  <label>Photo URL (Receipt / Completed Site Photo)</label>
                  <input type="url" className="form-control" placeholder="https://images.unsplash.com/..." value={impactProofForm.imageUrl} onChange={e => setImpactProofForm({...impactProofForm, imageUrl: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Proof Description / Expenditure Notes</label>
                  <textarea className="form-control" placeholder="e.g. Purchased cement and tin sheets." value={impactProofForm.description} onChange={e => setImpactProofForm({...impactProofForm, description: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Camera size={14} /> Post Proof</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 9: BROADCAST SOS --- */}
      {sosModal && (
        <div className="modal-overlay" onClick={() => setSosModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Broadcast SOS Emergency Alert</h3>
              <button className="modal-close" onClick={() => setSosModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSOSBroadcastSubmit}>
                <div className="form-group">
                  <label>Emergency Category</label>
                  <input type="text" className="form-control" placeholder="e.g. Flood rescue / Water supply stranded" value={sosForm.title} onChange={e => setSosForm({...sosForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea className="form-control" placeholder="Number of people, requirements" value={sosForm.description} onChange={e => setSosForm({...sosForm, description: e.target.value})} required />
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label>Severity Level</label>
                    <select className="form-control" value={sosForm.severity} onChange={e => setSosForm({...sosForm, severity: e.target.value})} required>
                      <option value="high">High Severity</option>
                      <option value="critical">Critical Emergency</option>
                      <option value="moderate">Moderate Relief</option>
                    </select>
                  </div>
                  <div>
                    <label>Stranded Area Location</label>
                    <input type="text" className="form-control" placeholder="e.g. 5th Main Flyover" value={sosForm.location} onChange={e => setSosForm({...sosForm, location: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-orange" style={{ width: "100%", marginTop: "10px" }}><ShieldAlert size={14} /> Send SOS Alert</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 10: REGISTER MEDICINE SURPLUS --- */}
      {medModal && (
        <div className="modal-overlay" onClick={() => setMedModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Donate Surplus Medicine</h3>
              <button className="modal-close" onClick={() => setMedModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleMedSubmit}>
                <div className="form-group">
                  <label>Medicine Name & Dosage</label>
                  <input type="text" className="form-control" placeholder="e.g. Paracetamol 500mg" value={medForm.name} onChange={e => setMedForm({...medForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Quantity / Pack Size</label>
                  <input type="text" className="form-control" placeholder="e.g. 3 strips of 10 tablets" value={medForm.qty} onChange={e => setMedForm({...medForm, qty: e.target.value})} required />
                </div>
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label>Expiry Date</label>
                    <input type="date" className="form-control" value={medForm.expiry} onChange={e => setMedForm({...medForm, expiry: e.target.value})} required />
                  </div>
                  <div>
                    <label>Drop-off/Pickup Location</label>
                    <input type="text" className="form-control" placeholder="e.g. Indiranagar Hub" value={medForm.location} onChange={e => setMedForm({...medForm, location: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><Plus size={14} /> Donate to Medical Pool</button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
