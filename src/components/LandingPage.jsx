import { LogIn, UserPlus, Compass, ShieldAlert, Award, Star, Activity, Sparkles } from "lucide-react";
import logoPng from "../assets/logo.png";

export default function LandingPage({ onEnterApp, onOpenAuth }) {
  return (
    <div className="landing-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="landing-video">
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark tint and subtle blur overlay to preserve contrast */}
      <div className="landing-overlay"></div>

      {/* Glassmorphic Navigation Header */}
      <header className="landing-header">
        <div className="landing-logo" onClick={onEnterApp}>
          <div className="landing-logo-box">
            <img src={logoPng} alt="SevaSetu Logo" className="landing-logo-img" />
          </div>
          <span className="landing-logo-text">SevaSetu</span>
        </div>

        <nav className="landing-nav">
          <a href="#features" className="landing-nav-link" onClick={(e) => { e.preventDefault(); onEnterApp(); }}>Features</a>
          <a href="#impact" className="landing-nav-link" onClick={(e) => { e.preventDefault(); onEnterApp(); }}>Impact</a>
          <a href="#about" className="landing-nav-link" onClick={(e) => { e.preventDefault(); onEnterApp(); }}>About</a>
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

      {/* Central Hero Section */}
      <div className="landing-hero">
        <div className="landing-badge animate-fade-in">
          <Sparkles size={12} className="text-accent" />
          <span>Bridging Hands, Empowering Lives</span>
        </div>
        
        <h1 className="landing-title animate-title-in">
          <span className="gradient-span">SevaSetu</span>
        </h1>
        
        <p className="landing-subtitle animate-fade-in-delayed">
          A unified, rewards-driven platform connecting restaurants with excess food, 
          volunteers with local cleanup drives, and NGOs with real-world impact.
        </p>

        <div className="landing-hero-actions animate-fade-in-delayed">
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

      {/* Bottom Right Info Card */}
      <div className="landing-info-card animate-slide-up">
        <div className="landing-info-header">
          <div className="landing-info-icon">
            <Activity size={18} />
          </div>
          <h4>Our Unified Impact</h4>
        </div>
        <p>
          SevaSetu integrates Ahaar (food surplus distribution), Swachh (cleanup drives), 
          Shiksha (education mentoring), Swasthya (medical assistance), and emergency SOS broadcasts 
          into a single collaborative web application.
        </p>
        <div className="landing-stats">
          <div className="stat-item">
            <span className="stat-number">1.4K+</span>
            <span className="stat-label">Volunteers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">8.7K+</span>
            <span className="stat-label">Meals Served</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Transparency</span>
          </div>
        </div>
      </div>

      {/* Floating Badge for Demo Mode Indicator at bottom-left */}
      <div className="landing-demo-badge">
        <span className="demo-dot"></span>
        <span>Secure Local Sandbox</span>
      </div>
    </div>
  );
}
