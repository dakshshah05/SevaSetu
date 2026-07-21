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
  GraduationCap
} from "lucide-react";
import { gsap } from "gsap";
import logoPng from "../assets/logo.png";

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
          // Trigger GSAP entrance animation for the page
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
      // Smooth interpolation (lerp)
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      if (follower) {
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      requestAnimationFrame(updateFollower);
    };

    window.addEventListener("mousemove", onMouseMove);
    const animationFrame = requestAnimationFrame(updateFollower);

    // Hover detection for scaling the cursor
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
              A premium, rewards-driven platform bridge that coordinates surplus food redistribution, 
              organizes cleanup drives, schedules medical camps, and recruits mentors.
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
                  SevaSetu was built to solve fragmentation in civic work. Instead of separate channels 
                  for donating food, tutoring, and requesting emergency help, we unify these efforts 
                  into a single cohesive system.
                </p>
                <p className="secondary-text">
                  Our system leverages gamified Seva points to motivate community actions. Volunteers earn 
                  points and certificates validation by partner NGOs, which they can redeem at our Voucher Store.
                </p>
                <div className="about-highlights">
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>Real-time surplus food matching</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>Volunteer rosters & NGO validations</span>
                  </div>
                  <div className="highlight-item">
                    <CheckCircle size={16} />
                    <span>Emergency SOS broadcasts</span>
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

        {/* 3. Stacked Scroll Initiatives Section */}
        <section id="modules" className="landing-section section-modules">
          <div className="section-container">
            <div className="section-title">
              <div className="badge-small">CORE MODULES</div>
              <h2>Our Dedicated Pillars</h2>
            </div>
            
            <div className="stack-container">
              {/* Card 1: Ahaar Setu */}
              <div className="stack-card card-ahaar">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Utensils size={32} />
                  </div>
                  <h3>Ahaar Setu</h3>
                  <h4>Surplus Food Redistribution</h4>
                  <p>
                    Connecting restaurants and catering services directly with local volunteer squads and 
                    underprivileged shelter homes. Restaurants register surplus food, routes are dynamically locked 
                    by volunteer claims, and deliveries are validated to prevent waste and solve hunger.
                  </p>
                  <button className="btn-card-action" onClick={onEnterApp}>Launch Ahaar Setu</button>
                </div>
              </div>

              {/* Card 2: Swachh Setu */}
              <div className="stack-card card-swachh">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <Trash2 size={32} />
                  </div>
                  <h3>Swachh Setu</h3>
                  <h4>Sanitation & Cleanup Campaigns</h4>
                  <p>
                    Empowering volunteers to organize or sign up for sanitation campaigns in their neighborhoods. 
                    Volunteers submit before-and-after photo evidence via local sandbox uploads, which are reviewed 
                    by local NGOs to award verified points to the cleanup squad.
                  </p>
                  <button className="btn-card-action" onClick={onEnterApp}>Launch Swachh Setu</button>
                </div>
              </div>

              {/* Card 3: Shiksha Setu */}
              <div className="stack-card card-shiksha">
                <div className="card-bg-glow"></div>
                <div className="stack-card-content">
                  <div className="stack-icon-box">
                    <GraduationCap size={32} />
                  </div>
                  <h3>Shiksha Setu</h3>
                  <h4>Academic Mentoring Network</h4>
                  <p>
                    Connecting volunteer tutors with underprivileged children who lack academic resources or support. 
                    Tutors submit subjects and locations, parents file help requests, and matched sessions deliver 
                    one-on-one education to foster high-impact learning.
                  </p>
                  <button className="btn-card-action" onClick={onEnterApp}>Launch Shiksha Setu</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Dome Gallery Section */}
        <section id="gallery" className="landing-section section-gallery">
          <div className="section-container">
            <div className="section-title text-center">
              <div className="badge-small">VISUAL GALLERY</div>
              <h2>Impact In Action</h2>
              <p>Real-world moments of our community volunteers and partner initiatives.</p>
            </div>

            {/* The Dome/Perspective Curved Wall Gallery */}
            <div className="dome-gallery-wrapper">
              <div className="dome-gallery">
                <div className="dome-item item-left">
                  <img src="/gallery_food.png" alt="Volunteers serving food" />
                  <div className="dome-info">
                    <h5>Ahaar Setu Feedings</h5>
                    <p>Community dinner distributions</p>
                  </div>
                </div>
                <div className="dome-item item-center">
                  <img src="/gallery_cleanup.png" alt="Volunteers cleaning streets" />
                  <div className="dome-info">
                    <h5>Swachh Bharat Cleanups</h5>
                    <p>Weekly sanitation campaigns</p>
                  </div>
                </div>
                <div className="dome-item item-right">
                  <img src="/gallery_education.png" alt="Volunteer teaching children" />
                  <div className="dome-info">
                    <h5>Shiksha Setu Mentorship</h5>
                    <p>Outdoor tutoring sessions</p>
                  </div>
                </div>
              </div>
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
