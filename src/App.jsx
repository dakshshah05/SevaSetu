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
import logoPng from "./assets/logo.png";

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
import Chatbot from "./components/Chatbot";
import LandingPage from "./components/LandingPage";

export default function App() {
  // --- STATE SYSTEM ---
  const [activeView, setActiveView] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (user) {
      setShowLanding(false);
    }
  }, [user]);
  
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
  const [forgotEmail, setForgotEmail] = useState("");

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
    }, 7500);
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      await DB.forgotPassword(forgotEmail);
      triggerToast("Password reset link sent to your email!");
      setAuthTab("login");
      setForgotEmail("");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const role = authTab === "register" ? registerForm.role : "user";
      const u = await DB.loginWithGoogle(role);
      triggerToast(`Welcome back, ${u.name}! Logged in via Google.`);
      setAuthModal(false);
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleLogoutClick = async () => {
    await DB.logout();
    triggerToast("Logged out successfully.");
    setActiveView("dashboard");
    setShowLanding(true);
  };

  const handleUpgradeToVolunteer = () => {
    DB.upgradeToVolunteer()
      .then(() => triggerToast("Congratulations! You are now registered as a Volunteer."))
      .catch(err => triggerToast(err.message, true));
  };

  const activeSOS = sosList.filter(s => s.status === "active");

  return (
    <div className="app-container">
      {showLanding && !user ? (
        <LandingPage 
          onEnterApp={(targetView) => {
            if (targetView && typeof targetView === "string") {
              setActiveView(targetView);
            }
            setShowLanding(false);
          }} 
          onOpenAuth={(tab) => {
            setAuthTab(tab);
            setAuthModal(true);
          }}
        />
      ) : (
        <>
          {/* --- STICKY TOP TASKBAR NAVIGATION --- */}
          <header className={`top-taskbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-link" onClick={() => {
          if (!user) {
            setShowLanding(true);
          } else {
            setActiveView("dashboard");
          }
        }}>
          <div className="logo-box">
            <img src={logoPng} alt="SevaSetu Logo" className="logo-img" />
          </div>
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
            triggerToast={triggerToast}
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            triggerToast={triggerToast}
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            triggerToast={triggerToast}
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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
            triggerToast={triggerToast}
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
            onUpgradeToVolunteer={handleUpgradeToVolunteer}
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

      {/* --- CUTE 3D CHATBOT --- */}
      <Chatbot 
        foods={foods}
        drives={drives}
        skills={skills}
        crowd={crowd}
        sosList={sosList}
        meds={meds}
        tutors={tutors}
        tutorRequests={tutorRequests}
        camps={camps}
        clothes={clothes}
        elderly={elderly}
        trees={trees}
        rescues={animalRescues}
        user={user}
      />
        </>
      )}

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
              <h3>
                {authTab === "login" && "Sign In"}
                {authTab === "register" && "Create Account"}
                {authTab === "forgot" && "Reset Password"}
              </h3>
              <button className="modal-close" onClick={() => setAuthModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {authTab !== "forgot" && (
                <div className="tab-group" style={{ justifyContent: "center", marginBottom: "20px" }}>
                  <button className={`tab-btn ${authTab === "login" ? "active" : ""}`} onClick={() => setAuthTab("login")}>Sign In</button>
                  <button className={`tab-btn ${authTab === "register" ? "active" : ""}`} onClick={() => setAuthTab("register")}>Create Account</button>
                </div>
              )}

              {authTab === "forgot" ? (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", textAlign: "center" }}>
                    Enter your registered email address below, and we'll send you instructions to reset your password.
                  </p>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="name@domain.com" 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}>Send Reset Link</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setAuthTab("login")} 
                    style={{ width: "100%", marginTop: "8px" }}
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : authTab === "login" ? (
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" placeholder="name@domain.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ margin: 0 }}>Password</label>
                      <button 
                        type="button" 
                        onClick={() => setAuthTab("forgot")} 
                        style={{ background: "none", border: "none", color: "var(--color-green-dark)", fontSize: "11px", cursor: "pointer", padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input type="password" className="form-control" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}><LogIn size={14} /> Log In</button>
                  
                  <div className="auth-separator" style={{ display: "flex", alignItems: "center", margin: "16px 0", fontSize: "11px", color: "var(--text-secondary)" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--color-beige-dark)" }}></div>
                    <span style={{ padding: "0 8px" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", background: "var(--color-beige-dark)" }}></div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleGoogleLogin} 
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-beige-dark)", background: "#fff", color: "var(--text-primary)" }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px' }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.07-1.42-1.07-2.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Sign in with Google
                  </button>
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
                      <option value="user">Citizen (Donor/Guest)</option>
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
                  
                  <div className="auth-separator" style={{ display: "flex", alignItems: "center", margin: "16px 0", fontSize: "11px", color: "var(--text-secondary)" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--color-beige-dark)" }}></div>
                    <span style={{ padding: "0 8px" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", background: "var(--color-beige-dark)" }}></div>
                  </div>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleGoogleLogin} 
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-beige-dark)", background: "#fff", color: "var(--text-primary)" }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px' }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.07-1.42-1.07-2.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Sign in with Google
                  </button>
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
