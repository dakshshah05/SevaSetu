import { useState } from "react";
import { User, ShieldAlert, Key, Trash2, ArrowRight } from "lucide-react";
import { DB } from "../db";

export default function Settings({ user, triggerToast, onDeleteAccountSuccess }) {
  const [name, setName] = useState(user ? user.name : "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) return null;

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast("Name cannot be empty!", true);
      return;
    }
    try {
      await DB.updateUserProfile(name.trim());
      triggerToast("Profile name updated successfully!");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await DB.forgotPassword(user.email);
      triggerToast("Password reset link sent to your email!");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await DB.deleteUserAccount();
      triggerToast("Your account has been permanently deleted.");
      onDeleteAccountSuccess();
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  return (
    <div className="module-panel reveal-on-scroll reveal-visible" style={{ gap: "32px" }}>
      <div className="dashboard-columns" style={{ gridTemplateColumns: "1.5fr 1.5fr" }}>
        {/* Left Column: Edit Profile */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} /> Edit Profile Info
            </h3>

            <form onSubmit={handleNameUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label htmlFor="settings-name">Display Name</label>
                <input
                  id="settings-name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Account Email (Non-editable)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="form-control"
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "max-content" }}>
                Update Profile Name
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security & Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Change Password */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} /> Password Credentials
            </h3>
            <p style={{ fontSize: "13px", lineHeight: "1.4", color: "var(--text-secondary)" }}>
              Need to change your credentials? Request a password reset link to be sent to your verified email.
            </p>
            <button className="btn btn-secondary" onClick={handlePasswordReset} style={{ width: "max-content", gap: "6px" }}>
              Send Reset Email <ArrowRight size={12} />
            </button>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "6px solid #ef4444", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }}>
            <h3 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} /> Danger Zone
            </h3>
            <p style={{ fontSize: "13px", lineHeight: "1.4", color: "var(--text-secondary)" }}>
              Permanently delete your account and all associated civic logs. This action is irreversible.
            </p>
            <button 
              className="btn" 
              onClick={() => setShowDeleteModal(true)} 
              style={{ 
                width: "max-content", 
                background: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)", 
                color: "#ffffff",
                gap: "6px",
                boxShadow: "3px 3px 8px rgba(239, 68, 68, 0.25), -3px -3px 8px #ffffff"
              }}
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <div className="modal-header" style={{ borderBottom: "none" }}>
              <h3 style={{ color: "#ef4444", margin: 0 }}>Confirm Account Deletion</h3>
            </div>
            
            <div className="modal-body" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--color-green-dark)" }}>
                Are you absolutely sure you want to delete your SevaSetu account? All of your Seva points, volunteer logs, and active claims will be **permanently wiped**.
              </p>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#ef4444" }}>
                Warning: This action cannot be undone!
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px", padding: "16px 24px", background: "rgba(239, 68, 68, 0.05)", borderBottomLeftRadius: "32px", borderBottomRightRadius: "32px", justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} style={{ padding: "8px 16px", fontSize: "12px" }}>
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={handleDeleteAccount}
                style={{ 
                  background: "#ef4444", 
                  color: "#ffffff", 
                  padding: "8px 16px", 
                  fontSize: "12px" 
                }}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
