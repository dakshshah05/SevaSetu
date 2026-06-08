import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Trash2, 
  Building, 
  GraduationCap, 
  Stethoscope, 
  Shirt, 
  Heart, 
  Sprout, 
  PawPrint, 
  Coins, 
  ShieldAlert, 
  Gift, 
  Award, 
  LogOut, 
  UserPlus, 
  LogIn, 
  Activity 
} from "lucide-react";
import { DB } from "./db";
import { isConfigValid } from "./firebase";
import { gsap } from "gsap";

// Import Modular Components
import Dashboard from "./components/Dashboard";
import AhaarSetu from "./components/AhaarSetu";
import SwachhSetu from "./components/SwachhSetu";
import SahaayakSetu from "./components/SahaayakSetu";
import ShikshaSetu from "./components/ShikshaSetu";
import SwasthyaSetu from "./components/SwasthyaSetu";
import VastraSetu from "./components/VastraSetu";
import PunyaSetu from "./components/PunyaSetu";
import VrikshaSetu from "./components/VrikshaSetu";
import PashuSetu from "./components/PashuSetu";
import Crowdfund from "./components/Crowdfund";
import SOS from "./components/SOS";
import RewardsStore from "./components/RewardsStore";

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
  const [tutors, setTutors] = useState([]);
  const [tutorRequests, setTutorRequests] = useState([]);
  const [camps, setCamps] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [elderly, setElderly] = useState([]);
  const [elderlyVisits, setElderlyVisits] = useState([]);
  const [trees, setTrees] = useState([]);
  const [animalRescues, setAnimalRescues] = useState([]);
  
  const [leaderboard, setLeaderboard] = useState({ volunteers: [], restaurants: [] });

  // Dialog Overlays
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  
  // Custom Toasts
  const [toasts, setToasts] = useState([]);

  // Form Inputs State
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", role: "volunteer", address: "", description: "" });

  // Top Taskbar Scroll State
  const [scrolled, setScrolled] = useState(false);

  // Sliding Pill Nav Highlight
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [pillStyle, setPillStyle] = useState({ opacity: 0 });
  const navItemsRef = useRef([]);

  // --- TOAST NOTIFICATIONS ---
  const triggerToast = useCallback((message, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, isError }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // --- SCROLL LISTENER FOR HEADER SCROLLED STATE ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- SLIDING NAV PILL ALIGNMENT ---
  useEffect(() => {
    if (hoveredIndex !== null && navItemsRef.current[hoveredIndex]) {
      const el = navItemsRef.current[hoveredIndex];
      setPillStyle({
        left: `${el.offsetLeft}px`,
        width: `${el.offsetWidth}px`,
        height: `${el.offsetHeight}px`,
        top: `${el.offsetTop}px`,
        opacity: 1
      });
    } else {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredIndex]);

  // --- INTERSECTION OBSERVER FOR SCROLL REVEALS ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
        }
      });
    }, { threshold: 0.05 });

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [activeView]);

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
    
    // New modules data sync
    const unsubTutors = DB.subscribe("tutors", setTutors);
    const unsubTutorRequests = DB.subscribe("tutor_requests", setTutorRequests);
    const unsubCamps = DB.subscribe("camps", setCamps);
    const unsubClothes = DB.subscribe("clothes", setClothes);
    const unsubElderly = DB.subscribe("elderly", setElderly);
    const unsubElderlyVisits = DB.subscribe("elderly_visits", setElderlyVisits);
    const unsubTrees = DB.subscribe("trees", setTrees);
    const unsubAnimalRescues = DB.subscribe("animal_rescues", setAnimalRescues);

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
      unsubTutors();
      unsubTutorRequests();
      unsubCamps();
      unsubClothes();
      unsubElderly();
      unsubElderlyVisits();
      unsubTrees();
      unsubAnimalRescues();
    };
  }, []);

  // Sync leaderboards whenever actions complete or user updates
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
  }, [foods, drives, skills, tutors, camps, clothes, elderly, elderlyVisits, trees, animalRescues, user]);

  // --- GSAP 3D PAGE ENTRANCE TRANSITION ---
  useEffect(() => {
    gsap.fromTo(
      ".gsap-reveal",
      { 
        opacity: 0, 
        scale: 0.96,
        rotationX: 3, 
        y: 20,
        z: -30,
        transformPerspective: 1200,
        transformOrigin: "center top"
      },
      { 
        opacity: 1, 
        scale: 1,
        rotationX: 0,
        y: 0,
        z: 0,
        duration: 0.55, 
        ease: "power2.out" 
      }
    );
  }, [activeView]);

  // --- AUTH SUBMISSIONS ---
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

  const activeSOS = sosList.filter(s => s.status === "active");

  return (
    <div className="app-container">
      
      {/* --- STICKY TOP TASKBAR NAVIGATION --- */}
      <header className={`top-taskbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-link" onClick={() => setActiveView("dashboard")}>
          <div className="logo-box">S</div>
          <span className="logo-text">SevaSetu</span>
        </div>

        <nav className="taskbar-nav" onMouseLeave={() => setHoveredIndex(null)}>
          {/* Absolute sliding highlight background */}
          <div className="nav-highlight-pill" style={pillStyle} />

          {/* 13 Nav Tabs */}
          <div 
            ref={el => navItemsRef.current[0] = el}
            className={`taskbar-item ${activeView === "dashboard" ? "active" : ""}`} 
            onClick={() => setActiveView("dashboard")} 
            onMouseEnter={() => setHoveredIndex(0)}
            role="button"
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </div>

          <div 
            ref={el => navItemsRef.current[1] = el}
            className={`taskbar-item ${activeView === "food-waste" ? "active" : ""}`} 
            onClick={() => setActiveView("food-waste")} 
            onMouseEnter={() => setHoveredIndex(1)}
            role="button"
          >
            <Utensils />
            <span>Ahaar Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[2] = el}
            className={`taskbar-item ${activeView === "cleanup-drives" ? "active" : ""}`} 
            onClick={() => setActiveView("cleanup-drives")} 
            onMouseEnter={() => setHoveredIndex(2)}
            role="button"
          >
            <Trash2 />
            <span>Swachh Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[3] = el}
            className={`taskbar-item ${activeView === "ngo-admin" ? "active" : ""}`} 
            onClick={() => setActiveView("ngo-admin")} 
            onMouseEnter={() => setHoveredIndex(3)}
            role="button"
          >
            <Building />
            <span>Sahaayak Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[4] = el}
            className={`taskbar-item ${activeView === "shiksha" ? "active" : ""}`} 
            onClick={() => setActiveView("shiksha")} 
            onMouseEnter={() => setHoveredIndex(4)}
            role="button"
          >
            <GraduationCap />
            <span>Shiksha Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[5] = el}
            className={`taskbar-item ${activeView === "swasthya" ? "active" : ""}`} 
            onClick={() => setActiveView("swasthya")} 
            onMouseEnter={() => setHoveredIndex(5)}
            role="button"
          >
            <Stethoscope />
            <span>Swasthya Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[6] = el}
            className={`taskbar-item ${activeView === "vastra" ? "active" : ""}`} 
            onClick={() => setActiveView("vastra")} 
            onMouseEnter={() => setHoveredIndex(6)}
            role="button"
          >
            <Shirt />
            <span>Vastra Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[7] = el}
            className={`taskbar-item ${activeView === "punya" ? "active" : ""}`} 
            onClick={() => setActiveView("punya")} 
            onMouseEnter={() => setHoveredIndex(7)}
            role="button"
          >
            <Heart />
            <span>Punya Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[8] = el}
            className={`taskbar-item ${activeView === "vriksha" ? "active" : ""}`} 
            onClick={() => setActiveView("vriksha")} 
            onMouseEnter={() => setHoveredIndex(8)}
            role="button"
          >
            <Sprout />
            <span>Vriksha Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[9] = el}
            className={`taskbar-item ${activeView === "pashu" ? "active" : ""}`} 
            onClick={() => setActiveView("pashu")} 
            onMouseEnter={() => setHoveredIndex(9)}
            role="button"
          >
            <PawPrint />
            <span>Pashu Setu</span>
          </div>

          <div 
            ref={el => navItemsRef.current[10] = el}
            className={`taskbar-item ${activeView === "crowd" ? "active" : ""}`} 
            onClick={() => setActiveView("crowd")} 
            onMouseEnter={() => setHoveredIndex(10)}
            role="button"
          >
            <Coins />
            <span>Crowdfund</span>
          </div>

          <div 
            ref={el => navItemsRef.current[11] = el}
            className={`taskbar-item ${activeView === "sos" ? "active" : ""}`} 
            onClick={() => setActiveView("sos")} 
            onMouseEnter={() => setHoveredIndex(11)}
            role="button"
          >
            <ShieldAlert />
            <span>SOS</span>
            {activeSOS.length > 0 && (
              <span style={{ backgroundColor: "var(--color-green-dark)", color: "var(--color-beige-light)", borderRadius: "50%", padding: "1px 5px", fontSize: "9px", fontWeight: "bold", marginLeft: "4px" }}>
                {activeSOS.length}
              </span>
            )}
          </div>

          <div 
            ref={el => navItemsRef.current[12] = el}
            className={`taskbar-item ${activeView === "rewards-store" ? "active" : ""}`} 
            onClick={() => setActiveView("rewards-store")} 
            onMouseEnter={() => setHoveredIndex(12)}
            role="button"
          >
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
              {activeView === "ngo-admin" && "Sahaayak Setu"}
              {activeView === "shiksha" && "Shiksha Setu"}
              {activeView === "swasthya" && "Swasthya Setu"}
              {activeView === "vastra" && "Vastra Setu"}
              {activeView === "punya" && "Punya Setu"}
              {activeView === "vriksha" && "Vriksha Setu"}
              {activeView === "pashu" && "Pashu Setu"}
              {activeView === "crowd" && "Punya Setu - NGO Crowdfunding"}
              {activeView === "sos" && "Emergency SOS relief"}
              {activeView === "rewards-store" && "Voucher Store Marketplace"}
            </h1>
            <p style={{ marginTop: "4px" }}>
              {activeView === "dashboard" && "Overview of community impact, leaderboards, and collaborative modules."}
              {activeView === "food-waste" && "Post food surplus alerts or claim pickups to feed local shelters."}
              {activeView === "cleanup-drives" && "Join sanitation drives or organize cleanup events in your area."}
              {activeView === "ngo-admin" && "Connect with partner NGOs, roster volunteers, and collaborate on skilled tasks."}
              {activeView === "shiksha" && "Connecting volunteer tutors with underprivileged children who lack academic support."}
              {activeView === "swasthya" && "Coordinate free community medical checkup camps and redistribute surplus medicines."}
              {activeView === "vastra" && "Donate reusable clothing, toys, books, or blankets for local orphanage shelters."}
              {activeView === "punya" && "Provide regular check-in companionship visits and grocery assistance to local senior citizens."}
              {activeView === "vriksha" && "Enlist for local urban reforestation campaigns and plant virtual name-labeled trees."}
              {activeView === "pashu" && "Rescue injured stray animals, check the local veterinary clinic directory, and apply to adopt rescued pets."}
              {activeView === "crowd" && "Fund verified campaigns and track spending allocations with 100% transparency."}
              {activeView === "sos" && "Real-time emergency relief coordinates and volunteer broadcasts."}
              {activeView === "rewards-store" && "Exchange points earned from civic work for partner discount codes."}
            </p>
          </div>
        </header>

        {/* --- DYNAMIC modular switch views --- */}
        {activeView === "dashboard" && (
          <Dashboard 
            user={user}
            foods={foods}
            drives={drives}
            sosList={sosList}
            leaderboard={leaderboard}
            trees={trees}
            camps={camps}
            clothes={clothes}
            rescues={animalRescues}
            tutors={tutors}
          />
        )}

        {activeView === "food-waste" && (
          <AhaarSetu
            user={user}
            foods={foods}
            onAddPickup={(foodType, quantity, expiryTime, location) => 
              DB.createFoodPickup(foodType, quantity, expiryTime, location)
                .then(() => triggerToast("Surplus food alert broadcasted!"))
                .catch(err => triggerToast(err.message, true))
            }
            onClaimPickup={(id) => 
              DB.claimFoodPickup(id)
                .then(() => triggerToast("Food pickup claimed! Route is locked."))
                .catch(err => triggerToast(err.message, true))
            }
            onCompletePickup={(id, feedback) => 
              DB.completeFoodPickup(id, feedback)
                .then(() => triggerToast("Distribution verified! Points allocated."))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "cleanup-drives" && (
          <SwachhSetu
            user={user}
            drives={drives}
            onAddDrive={(title, description, date, time, location, points) => 
              DB.createCleanupDrive(title, description, date, time, location, points)
                .then(() => triggerToast("Cleanup campaign announced!"))
                .catch(err => triggerToast(err.message, true))
            }
            onJoinDrive={(id) => 
              DB.joinCleanupDrive(id)
                .then(() => triggerToast("Joined campaign squad!"))
                .catch(err => triggerToast(err.message, true))
            }
            onSubmitProof={(id, imageUrl) => 
              DB.submitDriveProof(id, imageUrl)
                .then(() => triggerToast("Completion proof submitted! Awaiting NGO validation."))
                .catch(err => triggerToast(err.message, true))
            }
            onApproveProof={(driveId, volunteerId) => 
              DB.approveDriveProof(driveId, volunteerId)
                .then(() => triggerToast("Proof approved! Seva points sent."))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "ngo-admin" && (
          <SahaayakSetu
            user={user}
            leaderboard={leaderboard}
            drives={drives}
            skills={skills}
            onJoinNGO={(ngoId) => 
              DB.joinNGO(ngoId)
                .then(() => triggerToast("Successfully joined NGO roster!"))
                .catch(err => triggerToast(err.message, true))
            }
            onApproveProof={(driveId, volunteerId) => 
              DB.approveDriveProof(driveId, volunteerId)
                .then(() => triggerToast("Proof approved! Seva points sent."))
                .catch(err => triggerToast(err.message, true))
            }
            onCreateSkillTask={(title, description, requiredSkill, hours, points) => 
              DB.createSkillTask(title, description, requiredSkill, hours, points)
                .then(() => triggerToast("Skill micro-task published!"))
                .catch(err => triggerToast(err.message, true))
            }
            onApplySkillTask={(id) => 
              DB.applyToSkillTask(id)
                .then(() => triggerToast("Task assigned! Start collaborating."))
                .catch(err => triggerToast(err.message, true))
            }
            onCompleteSkillTask={(id, workLink) => 
              DB.completeSkillTask(id, workLink)
                .then(() => triggerToast("Task completed! Points and hours added."))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "shiksha" && (
          <ShikshaSetu
            user={user}
            tutors={tutors}
            tutorRequests={tutorRequests}
            onRegisterTutor={(subject, availability, location) => 
              DB.registerTutor(subject, availability, location)
                .then(() => triggerToast("Tutor registration successful!"))
                .catch(err => triggerToast(err.message, true))
            }
            onCreateTutorRequest={(childName, parentName, subject, location, details) => 
              DB.createTutorRequest(childName, parentName, subject, location, details)
                .then(() => triggerToast("Tutoring request submitted successfully!"))
                .catch(err => triggerToast(err.message, true))
            }
            onMatchTutorToRequest={(requestId, tutorName) => 
              DB.matchTutorToRequest(requestId, tutorName)
                .then(() => triggerToast("Claimed tutoring slot! Matches updated."))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "swasthya" && (
          <SwasthyaSetu
            user={user}
            camps={camps}
            meds={meds}
            onCreateCamp={(title, location, date, description) => 
              DB.createMedicalCamp(title, location, date, description)
                .then(() => triggerToast("Free medical camp scheduled!"))
                .catch(err => triggerToast(err.message, true))
            }
            onRegisterDoctor={(campId, doctorName) => 
              DB.registerDoctorForCamp(campId, doctorName)
                .then(() => triggerToast("Enlisted as clinic doctor/helper!"))
                .catch(err => triggerToast(err.message, true))
            }
            onRegisterPatient={(campId, patientName, patientAge) => 
              DB.registerPatientForCamp(campId, patientName, patientAge)
                .then(() => triggerToast("Patient token generated successfully!"))
                .catch(err => triggerToast(err.message, true))
            }
            onSubmitReport={(campId, reportSummary) => 
              DB.submitCampReport(campId, reportSummary)
                .then(() => triggerToast("Camp health report filed successfully!"))
                .catch(err => triggerToast(err.message, true))
            }
            onDonateMedicine={(medicineName, quantity, expiryDate, location) => 
              DB.donateMedicine(medicineName, quantity, expiryDate, location)
                .then(() => triggerToast("Surplus medicine donation registered!"))
                .catch(err => triggerToast(err.message, true))
            }
            onClaimMedicine={(id) => 
              DB.claimMedicine(id)
                .then(() => triggerToast("Medicine surplus claimed!"))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "vastra" && (
          <VastraSetu
            user={user}
            clothes={clothes}
            onListDonation={(category, details, quantity) => 
              DB.listClothesDonation(category, details, quantity)
                .then(() => triggerToast("Donation listing registered!"))
                .catch(err => triggerToast(err.message, true))
            }
            onClaimPickup={(id) => 
              DB.claimClothesPickup(id)
                .then(() => triggerToast("Pickup claimed! Transit logged."))
                .catch(err => triggerToast(err.message, true))
            }
            onDistribute={(id, distributionLocation) => 
              DB.distributeClothes(id, distributionLocation)
                .then(() => triggerToast("Distribution complete! Seva points allocated."))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "punya" && (
          <PunyaSetu
            user={user}
            elderly={elderly}
            visits={elderlyVisits}
            onRequestHelper={(elderlyName, age, helperType, location, details) => 
              DB.requestElderlyHelper(elderlyName, age, helperType, location, details)
                .then(() => triggerToast("Elderly helper request registered!"))
                .catch(err => triggerToast(err.message, true))
            }
            onClaimHelp={(id) => 
              DB.claimElderlyHelp(id)
                .then(() => triggerToast("Enlisted as helper!"))
                .catch(err => triggerToast(err.message, true))
            }
            onLogVisit={(requestId, notes) => 
              DB.logElderlyVisit(requestId, notes)
                .then(() => triggerToast("Visit check-in logged successfully!"))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "vriksha" && (
          <VrikshaSetu
            user={user}
            trees={trees}
            onPlantTree={(driveTitle, location, treeName) => 
              DB.plantVirtualTree(driveTitle, location, treeName)
                .then(() => triggerToast("Virtual tree sapling registered!"))
                .catch(err => triggerToast(err.message, true))
            }
            onUpdateTree={(id, survivalPhoto, status) => 
              DB.updateTreeGrowthStatus(id, survivalPhoto, status)
                .then(() => triggerToast("Tree growth check-in logged successfully!"))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "pashu" && (
          <PashuSetu
            user={user}
            rescues={animalRescues}
            onReportInjury={(animalType, injuryDetails, location, photoUrl) => 
              DB.reportAnimalInjury(animalType, injuryDetails, location, photoUrl)
                .then(() => triggerToast("Injured animal report registered!"))
                .catch(err => triggerToast(err.message, true))
            }
            onClaimRescue={(id, rescuerName) => 
              DB.claimAnimalRescue(id, rescuerName)
                .then(() => triggerToast("Dispatch to rescue location registered!"))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "crowd" && (
          <Crowdfund
            user={user}
            crowd={crowd}
            onCreateCampaign={(title, description, targetAmount) => 
              DB.createCampaign(title, description, targetAmount)
                .then(() => triggerToast("Crowdfunding campaign launched!"))
                .catch(err => triggerToast(err.message, true))
            }
            onDonateToCampaign={(id, amount) => 
              DB.donateToCampaign(id, amount)
                .then(() => triggerToast(`Thank you! Donated ₹${amount}. Points earned!`))
                .catch(err => triggerToast(err.message, true))
            }
            onUploadCampaignProof={(id, imageUrl, description) => 
              DB.uploadCampaignProof(id, imageUrl, description)
                .then(() => triggerToast("Impact proof upload successful!"))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "sos" && (
          <SOS
            user={user}
            sosList={sosList}
            onBroadcastSOS={(title, description, severity, location) => 
              DB.broadcastSOS(title, description, severity, location)
                .then(() => triggerToast("SOS broadcasted successfully!", true))
                .catch(err => triggerToast(err.message, true))
            }
            onResolveSOS={(id) => 
              DB.resolveSOS(id)
                .then(() => triggerToast("SOS alert resolved."))
                .catch(err => triggerToast(err.message, true))
            }
          />
        )}

        {activeView === "rewards-store" && (
          <RewardsStore
            user={user}
            vouchers={vouchers}
            claims={claims}
            onRedeemVoucher={(voucherId) => 
              DB.redeemVoucher(voucherId)
                .then((code) => triggerToast(`Coupon claimed successfully: ${code}`))
                .catch(err => triggerToast(err.message, true))
            }
            onOpenAuthModal={() => { setAuthModal(true); setAuthTab("login"); }}
          />
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
      {authModal && createPortal(
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
        </div>,
        document.body
      )}

    </div>
  );
}
