import { useState } from "react";
import { Award, Zap, Building, Trophy, Heart, Sparkles, Star } from "lucide-react";

export default function Dashboard({ 
  user, 
  foods, 
  drives, 
  leaderboard, 
  trees, 
  camps, 
  clothes, 
  rescues,
  tutors,
  triggerToast,
  onUpgradeToVolunteer
}) {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState("volunteers");
  const [csrClaimed, setCsrClaimed] = useState(false);

  // Stats calculation
  const completedMeals = foods.filter(f => f.status === "completed").length * 15;
  const activeCleanupCount = drives.length;
  const totalTrees = trees.length;
  const totalCamps = camps.filter(c => c.status === "completed").length;
  const totalClothes = clothes.filter(c => c.status === "completed").length;
  const totalRescues = rescues.filter(r => r.status === "rescued").length;
  const totalTutors = tutors.length;

  // Streak & badge status
  const volunteerStreak = user ? (user.completedCount > 15 ? 12 : user.completedCount > 5 ? 5 : 2) : 0;
  const volunteerTier = user ? (user.rewardPoints > 400 ? "Platinum" : user.rewardPoints > 200 ? "Gold" : user.rewardPoints > 80 ? "Silver" : "Bronze") : "Bronze";

  const getTierColor = (tier) => {
    if (tier === "Platinum") return "#306D29";
    if (tier === "Gold") return "#A78B00";
    if (tier === "Silver") return "#7F8C8D";
    return "#8D6E63";
  };

  const handleCsrDownload = () => {
    setCsrClaimed(true);
    triggerToast("CSR Impact Report Generated! Ready for Tax compliance audit.");
  };

  return (
    <div className="stats-panel gsap-reveal">
      {/* 1. Analytics Impact Grid */}
      <div className="stats-grid reveal-on-scroll">
        <div className="card stat-card card-teal">
          <div className="stat-icon teal"><Heart /></div>
          <div className="stat-info">
            <span className="stat-number">{completedMeals.toLocaleString()}</span>
            <span className="stat-label">Meals Shared</span>
          </div>
        </div>
        <div className="card stat-card card-violet">
          <div className="stat-icon violet"><Building /></div>
          <div className="stat-info">
            <span className="stat-number">{activeCleanupCount}</span>
            <span className="stat-label">Civic Campaigns</span>
          </div>
        </div>
        <div className="card stat-card card-orange">
          <div className="stat-icon orange"><Trophy /></div>
          <div className="stat-info">
            <span className="stat-number">{totalTrees}</span>
            <span className="stat-label">Trees Growing</span>
          </div>
        </div>
        <div className="card stat-card card-teal">
          <div className="stat-icon teal"><Star /></div>
          <div className="stat-info">
            <span className="stat-number">{totalCamps + totalRescues + totalClothes + totalTutors}</span>
            <span className="stat-label">Civic Actions</span>
          </div>
        </div>
      </div>

      <div className="dashboard-columns reveal-on-scroll" style={{ marginTop: "28px" }}>
        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Gamification Panel */}
          {user && user.role !== "user" && (
            <div className="card card-teal">
              <div className="info-header">
                <h3><Trophy size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Volunteer Gamification Tier</h3>
                <span className="badge badge-pending" style={{ backgroundColor: getTierColor(volunteerTier), color: "#fff", borderColor: "transparent" }}>
                  {volunteerTier} Tier
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Participate in cleanups, food distribution, tutoring, or tree plantations to climb volunteer tiers and unlock exclusive vouchers.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                <div style={{ background: "rgba(231, 225, 177, 0.2)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                  <h4 style={{ color: "var(--color-green-dark)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Zap size={16} /> Active Streak</h4>
                  <p style={{ fontSize: "20px", fontWeight: "800" }}>{volunteerStreak} Actions Streak</p>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Consecutive actions completed</p>
                </div>
                <div style={{ background: "rgba(231, 225, 177, 0.2)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                  <h4 style={{ color: "var(--color-green-dark)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Award size={16} /> Badges Unlocked</h4>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <span title="Silver Badge" style={{ opacity: user.rewardPoints > 80 ? 1 : 0.2 }}>🥈</span>
                    <span title="Gold Badge" style={{ opacity: user.rewardPoints > 200 ? 1 : 0.2 }}>🥇</span>
                    <span title="Platinum Badge" style={{ opacity: user.rewardPoints > 400 ? 1 : 0.2 }}>🏆</span>
                    <span title="Community Star" style={{ opacity: user.completedCount > 10 ? 1 : 0.2 }}>⭐</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Become a Volunteer Upgrade Panel for Citizens */}
          {user && user.role === "user" && (
            <div className="card card-teal">
              <div className="info-header">
                <h3><Award size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Become an Active Volunteer</h3>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                You are currently registered as a Citizen (Normal User). Join our active civic network to claim food pickups, participate in cleaning drives, help senior citizens, and earn Seva Reward points!
              </p>
              <button className="btn btn-primary" onClick={onUpgradeToVolunteer} style={{ width: "fit-content" }}>
                Register as Volunteer
              </button>
            </div>
          )}

          {/* CSR matching panel */}
          <div className="card card-violet">
            <div className="info-header">
              <h3><Building size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Corporate CSR Integration</h3>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Companies partner with platform NGOs to fulfill mandatory corporate social responsibility (CSR) budgets. Employees participate as volunteer groups in cleanups and tree plantations.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <div style={{ padding: "10px 16px", background: "rgba(231, 225, 177, 0.5)", borderRadius: "var(--radius-md)", fontSize: "12px", border: "1px dashed var(--color-green-medium)" }}>
                <strong>Active Partners:</strong> Tata Trusts, Infosys Foundation, Wipro Cares
              </div>
              <button className="btn btn-primary" onClick={handleCsrDownload}>
                <Sparkles size={14} /> {csrClaimed ? "Report Ready" : "Generate CSR Impact Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Leaderboards */}
        <div className="card card-orange" style={{ height: "fit-content" }}>
          <div className="info-header">
            <h3>Leaderboard</h3>
          </div>
          <div className="tab-group" style={{ marginBottom: "16px" }}>
            <button 
              className={`tab-btn ${activeLeaderboardTab === "volunteers" ? "active" : ""}`} 
              onClick={() => setActiveLeaderboardTab("volunteers")}
            >
              Volunteers
            </button>
            <button 
              className={`tab-btn ${activeLeaderboardTab === "restaurants" ? "active" : ""}`} 
              onClick={() => setActiveLeaderboardTab("restaurants")}
            >
              Restaurants
            </button>
          </div>

          <div className="leaderboard-list">
            {activeLeaderboardTab === "volunteers" ? (
              (leaderboard?.volunteers || []).map((vol, idx) => (
                <div key={vol.uid} className={`leaderboard-item rank-${idx + 1}`}>
                  <div className="leaderboard-item-info">
                    <span className="leaderboard-rank">#{idx + 1}</span>
                    <span>{vol.name}</span>
                  </div>
                  <span className="leaderboard-points">{vol.rewardPoints || 0} Pts</span>
                </div>
              ))
            ) : (
              (leaderboard?.restaurants || []).map((rest, idx) => (
                <div key={rest.uid} className={`leaderboard-item rank-${idx + 1}`}>
                  <div className="leaderboard-item-info">
                    <span className="leaderboard-rank">#{idx + 1}</span>
                    <span>{rest.name}</span>
                  </div>
                  <span className="leaderboard-points orange">{rest.sevaPoints || 0} Seva Pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
