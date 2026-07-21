import { useState } from "react";
import { Download, BarChart3, TrendingUp, DollarSign, Users, Award } from "lucide-react";

export default function Reports({ triggerToast }) {
  const [activeChartTab, setActiveChartTab] = useState("overview");

  // Metrics database
  const metrics = [
    { module: "Ahaar Setu", desc: "Surplus Meals Saved", value: 2450, unit: "meals", saving: "₹1,22,500 equivalent", co2: "980 kg offset" },
    { module: "Swachh Setu", desc: "Sanitation Drives Organized", value: 42, unit: "drives", saving: "1,250 kg garbage collected", co2: "N/A" },
    { module: "Shiksha Setu", desc: "Tutoring Roster Hours", value: 340, unit: "hours", saving: "64 kids supported", co2: "N/A" },
    { module: "Swasthya Setu", desc: "Surplus Medicines Distributed", value: 120, unit: "donations", saving: "₹45,000 saved", co2: "N/A" },
    { module: "Vriksha Setu", desc: "Trees Planted & Labelled", value: 320, unit: "saplings", saving: "Green cover expansion", co2: "7,680 kg/yr absorption" },
    { module: "Punya Setu", desc: "Elder Care Visits Completed", value: 180, unit: "visits", saving: "Companionship support", co2: "N/A" },
    { module: "Crowdfund", desc: "Transparent Funds Raised", value: 184500, unit: "INR", saving: "100% direct relief", co2: "N/A" }
  ];

  const handleDownloadCSV = () => {
    try {
      const csvRows = [
        ["SevaSetu Community Impact & Resource Savings Report", ""],
        ["Generated on:", new Date().toLocaleString()],
        [],
        ["Module", "Metric Description", "Value", "Unit", "Financial Savings / Social Value", "Environmental Benefit"],
        ...metrics.map(m => [m.module, m.desc, m.value.toString(), m.unit, m.saving, m.co2])
      ];

      // Convert to CSV string safely
      const csvString = csvRows.map(row => 
        row.map(val => `"${val.replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "SevaSetu_Community_Impact_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("Impact report downloaded successfully in CSV/Excel format!");
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  return (
    <div className="module-panel reveal-on-scroll reveal-visible" style={{ gap: "36px" }}>
      {/* Overview Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="card stat-card">
          <div className="stat-icon teal">
            <DollarSign size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">₹1,67,500</span>
            <span className="stat-label">Estimated Social Savings</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon violet">
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">8,660 kg</span>
            <span className="stat-label">Greenhouse CO2 Prevented</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon orange">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-number">1,420+</span>
            <span className="stat-label">Total Roster Volunteers</span>
          </div>
        </div>
      </div>

      <div className="dashboard-columns" style={{ gridTemplateColumns: "1.7fr 1.3fr" }}>
        {/* Left Column: Visual Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="info-header" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BarChart3 size={20} />
                <h3>Savings & Performance Visuals</h3>
              </div>
              <div className="tab-group">
                <button
                  className={`tab-btn ${activeChartTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveChartTab("overview")}
                >
                  Resource Impact
                </button>
                <button
                  className={`tab-btn ${activeChartTab === "volunteers" ? "active" : ""}`}
                  onClick={() => setActiveChartTab("volunteers")}
                >
                  Volunteer Share
                </button>
              </div>
            </div>

            {activeChartTab === "overview" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* SVG/CSS Clay Bar Graph */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                      <span>Ahaar Setu (Meals Donated)</span>
                      <span>2,450 / 3,000 Goal</span>
                    </div>
                    <div style={{ 
                      height: "18px", 
                      width: "100%", 
                      background: "var(--color-beige-light)", 
                      borderRadius: "9px",
                      boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.45), inset -3px -3px 6px #ffffff",
                      overflow: "hidden",
                      padding: "2px"
                    }}>
                      <div style={{ 
                        height: "100%", 
                        width: "81%", 
                        background: "linear-gradient(90deg, #3bb632, var(--color-green-medium))", 
                        borderRadius: "7px",
                        boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.15)"
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                      <span>Vriksha Setu (Reforestation Trees)</span>
                      <span>320 / 500 Goal</span>
                    </div>
                    <div style={{ 
                      height: "18px", 
                      width: "100%", 
                      background: "var(--color-beige-light)", 
                      borderRadius: "9px",
                      boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.45), inset -3px -3px 6px #ffffff",
                      overflow: "hidden",
                      padding: "2px"
                    }}>
                      <div style={{ 
                        height: "100%", 
                        width: "64%", 
                        background: "linear-gradient(90deg, #22c55e, #15803d)", 
                        borderRadius: "7px",
                        boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.15)"
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                      <span>Swachh Setu (Trash Diverted kg)</span>
                      <span>1,250 / 2,000 Goal</span>
                    </div>
                    <div style={{ 
                      height: "18px", 
                      width: "100%", 
                      background: "var(--color-beige-light)", 
                      borderRadius: "9px",
                      boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.45), inset -3px -3px 6px #ffffff",
                      overflow: "hidden",
                      padding: "2px"
                    }}>
                      <div style={{ 
                        height: "100%", 
                        width: "62.5%", 
                        background: "linear-gradient(90deg, #f59e0b, #b45309)", 
                        borderRadius: "7px",
                        boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.15)"
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                      <span>Shiksha Setu (Academic Roster Hours)</span>
                      <span>340 / 400 Goal</span>
                    </div>
                    <div style={{ 
                      height: "18px", 
                      width: "100%", 
                      background: "var(--color-beige-light)", 
                      borderRadius: "9px",
                      boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.45), inset -3px -3px 6px #ffffff",
                      overflow: "hidden",
                      padding: "2px"
                    }}>
                      <div style={{ 
                        height: "100%", 
                        width: "85%", 
                        background: "linear-gradient(90deg, #a855f7, #701a75)", 
                        borderRadius: "7px",
                        boxShadow: "inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.15)"
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "32px", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
                {/* Visual SVG Pie Chart for Volunteer Ratios */}
                <svg width="150" height="150" viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)", filter: "drop-shadow(3px 3px 6px rgba(180, 172, 130, 0.4))" }}>
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--color-beige-light)" strokeWidth="6" />
                  
                  {/* Swachh Setu: 35% (Green Dark) */}
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--color-green-dark)" strokeWidth="6.5" 
                    strokeDasharray="35 65" strokeDashoffset="0" strokeLinecap="round" />
                  
                  {/* Ahaar Setu: 45% (Green Medium) */}
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--color-green-medium)" strokeWidth="6.5" 
                    strokeDasharray="45 55" strokeDashoffset="-35" strokeLinecap="round" />

                  {/* Others: 20% (Light Beige) */}
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--color-beige-dark)" strokeWidth="6.5" 
                    strokeDasharray="20 80" strokeDashoffset="-80" strokeLinecap="round" />
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", fontWeight: "700" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "var(--color-green-medium)" }} />
                    <span>Ahaar Setu (Food) — 45%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "var(--color-green-dark)" }} />
                    <span>Swachh Setu (Cleanups) — 35%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: "var(--color-beige-dark)" }} />
                    <span>Other Modules — 20%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Excel Export Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="info-header" style={{ marginBottom: 0 }}>
              <h3>Generate Documents</h3>
            </div>
            <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-secondary)" }}>
              Compile live SevaSetu database summaries, resource-waste savings audits, and volunteer rosters into a spreadsheet file compatible with Microsoft Excel and Google Sheets.
            </p>
            <button className="btn btn-primary" onClick={handleDownloadCSV} style={{ width: "100%", gap: "10px" }}>
              <Download size={16} /> Download Excel Report (.csv)
            </button>

            <div 
              className="card" 
              style={{ 
                padding: "16px", 
                background: "var(--color-beige-light)", 
                border: "none", 
                boxShadow: "inset 3px 3px 6px rgba(180, 172, 130, 0.3), inset -3px -3px 6px #ffffff",
                borderRadius: "18px"
              }}
            >
              <h4 style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-green-dark)" }}>
                <Award size={14} /> Ledger Audit Details
              </h4>
              <ul style={{ paddingLeft: "16px", fontSize: "11px", color: "var(--color-green-dark)", margin: "8px 0 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>CSV Delimiter:</strong> Comma (,) compatible with standard spreadsheet tools</li>
                <li><strong>Format Version:</strong> 1.0.4</li>
                <li><strong>Security hash:</strong> SHA-256 Verified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Full Reports Table */}
      <div className="card">
        <div className="info-header" style={{ marginBottom: "18px" }}>
          <h3>Module Ledger Audit Summary</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-beige-dark)" }}>
                <th style={{ padding: "12px 16px", color: "var(--color-green-dark)", fontWeight: "700" }}>Module Name</th>
                <th style={{ padding: "12px 16px", color: "var(--color-green-dark)", fontWeight: "700" }}>Indicator Parameter</th>
                <th style={{ padding: "12px 16px", color: "var(--color-green-dark)", fontWeight: "700" }}>Value</th>
                <th style={{ padding: "12px 16px", color: "var(--color-green-dark)", fontWeight: "700" }}>Financial Equivalent / Benefit</th>
                <th style={{ padding: "12px 16px", color: "var(--color-green-dark)", fontWeight: "700" }}>Greenhouse / Carbon Savings</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, idx) => (
                <tr 
                  key={idx} 
                  style={{ 
                    borderBottom: "1px solid var(--color-beige-dark)",
                    background: idx % 2 === 0 ? "rgba(231, 225, 177, 0.15)" : "transparent"
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: "700" }}>{m.module}</td>
                  <td style={{ padding: "12px 16px" }}>{m.desc}</td>
                  <td style={{ padding: "12px 16px", fontWeight: "700" }}>{m.value.toLocaleString()} {m.unit}</td>
                  <td style={{ padding: "12px 16px" }}>{m.saving}</td>
                  <td style={{ padding: "12px 16px" }}>{m.co2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
