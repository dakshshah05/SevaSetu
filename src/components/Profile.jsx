import { useState } from "react";
import { User, Award, Clock, CheckCircle2, Shield, Calendar, ArrowRight } from "lucide-react";

export default function Profile({ user, onUpgradeToVolunteer }) {
  if (!user) return null;

  const isVolunteer = user.role === "volunteer";
  const isNGO = user.role === "ngo";
  const isRestaurant = user.role === "restaurant";
  const isCitizen = user.role === "user";

  return (
    <div className="module-panel reveal-on-scroll reveal-visible" style={{ gap: "32px" }}>
      {/* Profile Overview Card */}
      <div className="card" style={{ display: "flex", gap: "24px", alignItems: "center", padding: "32px" }}>
        <div 
          style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--color-green-medium), var(--color-green-dark))", 
            color: "var(--color-beige-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: "800",
            boxShadow: "3px 3px 12px rgba(13, 83, 14, 0.25), -3px -3px 12px #ffffff"
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "24px", color: "var(--color-green-dark)", margin: 0 }}>{user.name}</h2>
            <span className="badge badge-pending" style={{ textTransform: "uppercase", fontSize: "9px" }}>
              {user.role}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>{user.email}</p>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
            <Calendar size={12} /> Joined SevaSetu Network
          </span>
        </div>

        {/* Milestone Badges based on role */}
        <div style={{ display: "flex", gap: "12px" }}>
          {isVolunteer && (
            <>
              <div className="card stat-card" style={{ padding: "16px", minWidth: "120px" }}>
                <Award size={18} style={{ color: "#f59e0b" }} />
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "8px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "800" }}>{user.rewardPoints || 0}</span>
                  <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>Seva Points</span>
                </div>
              </div>
              <div className="card stat-card" style={{ padding: "16px", minWidth: "120px" }}>
                <Clock size={18} style={{ color: "var(--color-green-medium)" }} />
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "8px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "800" }}>{user.impactHours || 0}h</span>
                  <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>Impact Hours</span>
                </div>
              </div>
            </>
          )}

          {isRestaurant && (
            <div className="card stat-card" style={{ padding: "16px", minWidth: "140px" }}>
              <Award size={18} style={{ color: "#f59e0b" }} />
              <div style={{ display: "flex", flexDirection: "column", marginLeft: "8px" }}>
                <span style={{ fontSize: "18px", fontWeight: "800" }}>{user.sevaPoints || 0}</span>
                <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>Donation Points</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-columns" style={{ gridTemplateColumns: "1.6fr 1.4fr" }}>
        {/* Left Column: Account Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <h3 style={{ marginBottom: "18px" }}>Account Credentials</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-beige-dark)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Security Identifier (UID)</span>
                <span style={{ fontFamily: "monospace", color: "var(--color-green-dark)" }}>{user.uid}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-beige-dark)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Access Role Type</span>
                <span style={{ fontWeight: "700", color: "var(--color-green-dark)" }}>{user.role.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-beige-dark)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Status</span>
                <span style={{ color: "#16a34a", fontWeight: "700" }}>Active Verified</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Total Completed Milestones</span>
                <span style={{ fontWeight: "700" }}>{user.completedCount || 0} actions</span>
              </div>
            </div>

            {isCitizen && (
              <div 
                className="card" 
                style={{ 
                  marginTop: "24px", 
                  padding: "20px", 
                  background: "rgba(48, 109, 41, 0.08)", 
                  border: "none", 
                  borderRadius: "18px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "12px" 
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-green-dark)" }}>Become a Volunteer!</h4>
                <p style={{ fontSize: "12px", lineHeight: "1.4", color: "var(--text-secondary)" }}>
                  Upgrade your guest account to claim food routes, join cleanup drives, match medicine pool stocks, and coordinate elder care check-ins.
                </p>
                <button className="btn btn-primary" onClick={onUpgradeToVolunteer} style={{ width: "max-content", gap: "6px", fontSize: "12px", padding: "8px 16px" }}>
                  Register as Volunteer <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Achievements & Ranks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <h3 style={{ marginBottom: "18px" }}>Roster Badges</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  padding: "12px", 
                  background: "var(--color-beige-light)", 
                  boxShadow: "inset 2px 2px 4px rgba(180, 172, 130, 0.3), inset -2px -2px 4px #ffffff",
                  borderRadius: "16px" 
                }}
              >
                <div className="stat-icon teal" style={{ width: "36px", height: "36px" }}>
                  <Shield size={16} />
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>Verified Account Status</span>
                  <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Email & security keys active</span>
                </div>
              </div>

              {isVolunteer && (
                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "12px", 
                    background: "var(--color-beige-light)", 
                    boxShadow: "inset 2px 2px 4px rgba(180, 172, 130, 0.3), inset -2px -2px 4px #ffffff",
                    borderRadius: "16px" 
                  }}
                >
                  <div className="stat-icon violet" style={{ width: "36px", height: "36px" }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>
                      {user.completedCount > 5 ? "Roster Champion" : "Active Volunteer"}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                      {user.completedCount} civic actions logged
                    </span>
                  </div>
                </div>
              )}

              {isRestaurant && (
                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "12px", 
                    background: "var(--color-beige-light)", 
                    boxShadow: "inset 2px 2px 4px rgba(180, 172, 130, 0.3), inset -2px -2px 4px #ffffff",
                    borderRadius: "16px" 
                  }}
                >
                  <div className="stat-icon orange" style={{ width: "36px", height: "36px" }}>
                    <Award size={16} />
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "12px", fontWeight: "700" }}>Community Donor</span>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Surplus food redistribution partner</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
