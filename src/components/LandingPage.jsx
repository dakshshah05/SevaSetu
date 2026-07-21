import { useState, useEffect, useRef } from "react";
import { 
  LogIn, 
  UserPlus, 
  Compass, 
  Mail, 
  Phone, 
  MapPin, 
  Activity, 
  Award, 
  ShieldAlert, 
  ArrowDown, 
  Sparkles, 
  CheckCircle, 
  MessageSquare,
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
  Gift
} from "lucide-react";
import { gsap } from "gsap";
import logoPng from "../assets/logo.png";
import DomeGallery from "./DomeGallery";

export default function LandingPage({ onEnterApp, onOpenAuth }) {
  // Preloader States
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const loaderRef = useRef(null);

  // Custom Cursor Refs
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const [cursorHovered, setCursorHovered] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  // --- PRELOADER PROGRESS SIMULATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            gsap.to(loaderRef.current, {
              yPercent: -100,
              duration: 0.8,
              ease: "power3.inOut",
              onComplete: () => setLoading(false)
            });
          }, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // --- CUSTOM CURSOR TRAILING EFFECT ---
  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = cursorFollowerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    const updateFollower = () => {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      if (follower) {
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      requestAnimationFrame(updateFollower);
    };

    window.addEventListener("mousemove", onMouseMove);
    const animationFrame = requestAnimationFrame(updateFollower);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest(".hover-active") || 
        target.closest("button") || 
        target.closest("a")
      ) {
        setCursorHovered(true);
      } else {
        setCursorHovered(false);
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrame);
    };
  }, [loading]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <>
      {/* Custom Cursor Followers */}
      <div ref={cursorRef} className="custom-cursor"></div>
      <div 
        ref={cursorFollowerRef} 
        className={`custom-cursor-follower ${cursorHovered ? "expanded" : ""}`}
      ></div>

      {/* Preloader overlay */}
      {loading && (
        <div ref={loaderRef} className="preloader">
          <div className="preloader-content">
            <div className="preloader-logo-box">
              <img src={logoPng} alt="SevaSetu" className="preloader-logo" />
            </div>
            <h2 className="preloader-brand">SEVASETU</h2>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-number">{progress}%</span>
            <p className="preloader-tag">Connecting Hands, Empowering Lives</p>
          </div>
        </div>
      )}

      <div className="landing-container scrollable-landing">
        {/* Background Video */}
        <video autoPlay loop muted playsInline className="landing-video">
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Dark tint overlay */}
        <div className="landing-overlay"></div>

        {/* Glassmorphic Navigation Header */}
        <header className="landing-header hover-active">
          <div className="landing-logo" onClick={onEnterApp}>
            <div className="landing-logo-box">
              <img src={logoPng} alt="SevaSetu Logo" className="landing-logo-img" />
            </div>
            <span className="landing-logo-text">SevaSetu</span>
          </div>

          <nav className="landing-nav">
            <a href="#about" className="landing-nav-link">About Project</a>
            <a href="#modules" className="landing-nav-link">Initiatives</a>
            <a href="#gallery" className="landing-nav-link">Gallery</a>
            <a href="#contact" className="landing-nav-link">Contact</a>
          </nav>

          <div className="landing-auth-buttons">
            <button 
              className="landing-btn-glass" 
              onClick={() => onOpenAuth("login")}
            >
              <LogIn size={15} />
              <span>Login</span>
            </button>
            <button 
              className="landing-btn-gradient" 
              onClick={() => onOpenAuth("register")}
            >
              <UserPlus size={15} />
              <span>Start Today</span>
            </button>
          </div>
        </header>

        {/* 1. Hero Section */}
        <section className="landing-section landing-hero-fullscreen">
          <div className="landing-hero-content">
            <div className="landing-badge">
              <Sparkles size={12} className="text-accent" />
              <span>Civic Collaboration Web Portal</span>
            </div>
            
            <h1 className="landing-title">
              <span className="gradient-span">SevaSetu</span>
            </h1>
            
            <p className="landing-subtitle">
              A premium, rewards-driven platform bridging restaurants with food surplus, 
              organizing sanitation drives, scheduling medical camps, and matching volunteers with local social needs.
            </p>

            <div className="landing-hero-actions">
              <button className="landing-btn-primary-large" onClick={() => onOpenAuth("register")}>
                <UserPlus size={18} />
                <span>Join Our Mission</span>
              </button>
              <button className="landing-btn-secondary-large" onClick={onEnterApp}>
                <Compass size={18} />
                <span>Explore as Guest</span>
              </button>
            </div>
          </div>

          <a href="#about" className="scroll-indicator animate-bounce">
            <span className="scroll-text">Discover SevaSetu</span>
            <ArrowDown size={18} />
          </a>
        </section>

        {/* 2. Project Description Section */}
        <section id="about" className="landing-section section-about">
          <div className="section-container">
            <div className="about-grid">
              <div className="about-text-panel">
                <div className="badge-small">WHAT WE DO</div>
                <h2>A Unified Gateway to <span className="highlight-text">Social Welfare</span></h2>
                <p>
                  SevaSetu solves fragmentation in civic work. Instead of separate apps for food donations, 
                  education, cleanup drives, and emergency assistance, we bring 12 complete civic modules 
                  under one gamified roof.
                </p>
                <p className="secondary-text">
                  Volunteers and NGOs earn Seva points for validated contributions, which can be exchanged 
                  in our Voucher Store for real partner discount codes.
                </p>
                <div className="about-highlights">
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>Real-time surplus food matching and pickup routing</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>12 integrated civic welfare modules & NGO rosters</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>Instant emergency SOS alerts and reward vouchers</span>
                  </div>
                </div>
              </div>

              <div className="about-stats-panel glass-card">
                <div className="stat-row">
                  <div className="stat-box">
                    <h3>1,420+</h3>
                    <p>Active Volunteers</p>
                  </div>
                  <div className="stat-box">
                    <h3>8,700+</h3>
                    <p>Meals Served</p>
                  </div>
                </div>
                <div className="stat-row">
                  <div className="stat-box">
                    <h3>12.4T</h3>
                    <p>Waste Staged</p>
                  </div>
                  <div className="stat-box">
                    <h3>100%</h3>
                    <p>Verified Transparency</p>
                  </div>
                </div>
                <div className="rewards-pitch">
                  <Award size={20} className="pitch-icon" />
                  <div>
                    <h5>Point Rewards System</h5>
                    <p>Earn discount vouchers from top partner restaurants and stores for your civic contributions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Stacked Scroll Initiatives Section (All 12 Modules) */}
        <section id="modules" className="landing-section section-modules">
          <div className="section-container">
            <div className="section-title">
              <div className="badge-small">ALL 12 PLATFORM INITIATIVES</div>
              <h2>Complete Civic Ecosystem</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                Scroll down to explore all 12 modules integrated into SevaSetu.
              </p>
            </div>
            
            <div className="stack-container">

              {/* Module 1: Ahaar Setu */}
              <div className="stack-card card-ahaar">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Utensils size={32} />
                  </div>
                  <h3>Ahaar Setu</h3>
                  <h4>Food Waste Surplus Redistribution</h4>
                  <p>
                    Connects restaurants, wedding venues, and caterers with local volunteer squads and shelter homes. 
                    Restaurants broadcast excess food alerts, volunteers lock transit routes, and shelter feedings 
                    are verified in real-time.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("food-waste")}>Launch Ahaar Setu</button>
                </div>
              </div>

              {/* Module 2: Swachh Setu */}
              <div className="stack-card card-swachh">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Trash2 size={32} />
                  </div>
                  <h3>Swachh Setu</h3>
                  <h4>Sanitation & Cleanup Campaigns</h4>
                  <p>
                    Organizes local community cleanup drives. Volunteers enlist for sanitation events, upload before-and-after 
                    photographic proof, and earn validated Seva points upon NGO approval.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("cleanup-drives")}>Launch Swachh Setu</button>
                </div>
              </div>

              {/* Module 3: Sahaayak Setu */}
              <div className="stack-card card-sahaayak">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Building size={32} />
                  </div>
                  <h3>Sahaayak Setu</h3>
                  <h4>NGO Resource & Micro-Task Management</h4>
                  <p>
                    Empowers verified NGOs to recruit volunteers, roster skilled talent (design, logistics, legal), 
                    and publish micro-tasks to streamline grassroots operations.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("ngo-admin")}>Launch Sahaayak Setu</button>
                </div>
              </div>

              {/* Module 4: Shiksha Setu */}
              <div className="stack-card card-shiksha">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <GraduationCap size={32} />
                  </div>
                  <h3>Shiksha Setu</h3>
                  <h4>Academic Mentoring & Tutoring</h4>
                  <p>
                    Matches volunteer tutors with underprivileged children who lack academic support. 
                    Tutors submit subjects and locations, parents request sessions, and direct 1-on-1 learning is scheduled.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("shiksha")}>Launch Shiksha Setu</button>
                </div>
              </div>

              {/* Module 5: Swasthya Setu */}
              <div className="stack-card card-swasthya">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Stethoscope size={32} />
                  </div>
                  <h3>Swasthya Setu</h3>
                  <h4>Free Medical Checkup Camps & Surplus Medicine</h4>
                  <p>
                    Coordinates free health screening camps with volunteer doctors, generates digital patient tokens, 
                    and facilitates surplus unexpired medicine donations to needy clinics.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("swasthya")}>Launch Swasthya Setu</button>
                </div>
              </div>

              {/* Module 6: Vastra Setu */}
              <div className="stack-card card-vastra">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Shirt size={32} />
                  </div>
                  <h3>Vastra Setu</h3>
                  <h4>Clothing, Blanket & Book Donations</h4>
                  <p>
                    Facilitates neighborhood donation drives for gently-used clothing, winter blankets, and children's books, 
                    enabling volunteer pickup and shelter distribution.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("vastra")}>Launch Vastra Setu</button>
                </div>
              </div>

              {/* Module 7: Punya Setu */}
              <div className="stack-card card-punya">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Heart size={32} />
                  </div>
                  <h3>Punya Setu</h3>
                  <h4>Elderly Care & Companionship</h4>
                  <p>
                    Pairs volunteer companions with local senior citizens needing grocery pickup assistance, home check-ins, 
                    or friendly conversations.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("punya")}>Launch Punya Setu</button>
                </div>
              </div>

              {/* Module 8: Vriksha Setu */}
              <div className="stack-card card-vriksha">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Sprout size={32} />
                  </div>
                  <h3>Vriksha Setu</h3>
                  <h4>Tree Reforestation & Growth Tracking</h4>
                  <p>
                    Organizes urban tree planting drives where citizens plant virtual name-labeled trees, log physical 
                    sapling growth checks, and earn points as trees mature.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("vriksha")}>Launch Vriksha Setu</button>
                </div>
              </div>

              {/* Module 9: Pashu Setu */}
              <div className="stack-card card-pashu">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <PawPrint size={32} />
                  </div>
                  <h3>Pashu Setu</h3>
                  <h4>Stray Animal Rescue & Adoption</h4>
                  <p>
                    Allows citizens to report injured stray animals with location photos, dispatches nearby rescuers, 
                    provides a vet clinic directory, and lists pets for adoption.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("pashu")}>Launch Pashu Setu</button>
                </div>
              </div>

              {/* Module 10: Punya Crowdfund */}
              <div className="stack-card card-crowd">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Coins size={32} />
                  </div>
                  <h3>Punya Crowdfund</h3>
                  <h4>100% Transparent NGO Crowdfunding</h4>
                  <p>
                    Enables verified NGOs to create emergency funding campaigns. Donors track exact fund allocations 
                    and receive photographic receipt proof for total transparency.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("crowd")}>Launch Crowdfund</button>
                </div>
              </div>

              {/* Module 11: Emergency SOS */}
              <div className="stack-card card-sos">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <ShieldAlert size={32} />
                  </div>
                  <h3>Emergency SOS</h3>
                  <h4>Real-Time Emergency Relief Broadcasts</h4>
                  <p>
                    Instant geo-targeted SOS alert system for disaster relief, blood shortage emergencies, or rapid volunteer 
                    mobilization in crisis zones.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("sos")}>Launch Emergency SOS</button>
                </div>
              </div>

              {/* Module 12: Voucher Store Rewards */}
              <div className="stack-card card-rewards">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Gift size={32} />
                  </div>
                  <h3>Rewards Marketplace</h3>
                  <h4>Seva Points & Partner Vouchers</h4>
                  <p>
                    The gamified heart of SevaSetu. Convert points earned from civic work into exclusive discount promo codes 
                    sponsored by partner restaurants and corporate sponsors.
                  </p>
                  <button className="btn-card-action hover-active" onClick={() => onEnterApp("rewards-store")}>Launch Rewards Store</button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Interactive 3D Gesture Dome Gallery Section */}
        <section id="gallery" className="landing-section section-gallery">
          <div className="section-container" style={{ position: "relative", zIndex: 5 }}>
            <div className="section-title text-center">
              <div className="badge-small">INTERACTIVE 3D DOME SPHERE</div>
              <h2>Impact In Action</h2>
              <p>Drag to rotate the 3D sphere gallery. Click any image tile to expand into full view.</p>
            </div>

            {/* Gesture 3D Dome Gallery Container */}
            <div style={{ width: "100%", height: "650px", position: "relative", borderRadius: "32px", overflow: "hidden" }}>
              <DomeGallery 
                fit={0.65}
                minRadius={480}
                maxVerticalRotationDeg={10}
                segments={34}
                dragDampening={2}
                grayscale={false}
              />
            </div>
          </div>
        </section>

        {/* 5. Contact Section */}
        <section id="contact" className="landing-section section-contact">
          <div className="section-container">
            <div className="contact-grid">
              <div className="contact-info-panel">
                <div className="badge-small">GET IN TOUCH</div>
                <h2>Become a Partner in <span className="highlight-text">Change</span></h2>
                <p>
                  Are you a restaurant owner, NGO representative, or corporate sponsor looking to make a 
                  social impact? Send us a message and our coordination team will help you integrate.
                </p>
                
                <div className="contact-details">
                  <div className="detail-row">
                    <Mail size={16} />
                    <span>support@sevasetu.org</span>
                  </div>
                  <div className="detail-row">
                    <Phone size={16} />
                    <span>+91 80 5557 2026</span>
                  </div>
                  <div className="detail-row">
                    <MapPin size={16} />
                    <span>Christ University, Bengaluru, India</span>
                  </div>
                </div>

                <div className="social-links-row">
                  <span className="social-label">Follow our updates</span>
                  <div className="social-icons">
                    <span className="social-dot hover-active"><i className="fab fa-twitter"></i></span>
                    <span className="social-dot hover-active"><i className="fab fa-facebook"></i></span>
                    <span className="social-dot hover-active"><i className="fab fa-instagram"></i></span>
                    <span className="social-dot hover-active"><i className="fab fa-linkedin"></i></span>
                  </div>
                </div>
              </div>

              <div className="contact-form-panel glass-card">
                {submitted ? (
                  <div className="success-panel animate-fade-in">
                    <CheckCircle size={48} className="success-icon" />
                    <h3>Message Received!</h3>
                    <p>Thank you for reaching out. A SevaSetu coordinator will contact you at your email address within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="contact-form">
                    <div className="form-row">
                      <div className="form-group-half">
                        <label>Your Name</label>
                        <input 
                          type="text" 
                          placeholder="Name" 
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="form-group-half">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          placeholder="email@example.com" 
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Subject</label>
                      <input 
                        type="text" 
                        placeholder="Inquiry Topic" 
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Your Message</label>
                      <textarea 
                        rows="4" 
                        placeholder="Detail your request or partnership proposal here..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="landing-btn-primary-large hover-active" style={{ width: "100%", marginTop: "12px" }}>
                      <MessageSquare size={16} />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <img src={logoPng} alt="SevaSetu" className="footer-logo" />
              <span>SevaSetu</span>
            </div>
            <p className="copyright">© 2026 SevaSetu Civic Collaboration Portal. Built for Community Impact.</p>
            <div className="footer-links">
              <a href="#about">About</a>
              <a href="#modules">Initiatives</a>
              <a href="#gallery">Gallery</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
