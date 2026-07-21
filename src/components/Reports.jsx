import { useState } from "react";
import { Download, BarChart3, TrendingUp, DollarSign, Users, Award, Calendar } from "lucide-react";

// Timeframe datasets for all SevaSetu Modules
const reportData = {
  "Ahaar Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [15, 30, 25, 45, 60, 80, 50],
      total: 305,
      unit: "meals saved",
      yMax: 100
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [180, 220, 240, 260],
      total: 900,
      unit: "meals saved",
      yMax: 300
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [680, 720, 800, 850, 900, 950, 1020, 1100, 1050, 1150, 1200, 1350],
      total: 11770,
      unit: "meals saved",
      yMax: 1500
    }
  },
  "Swachh Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [10, 20, 50, 10, 120, 300, 180],
      total: 690,
      unit: "kg garbage collected",
      yMax: 400
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [450, 600, 550, 800],
      total: 2400,
      unit: "kg garbage collected",
      yMax: 1000
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [1800, 2000, 2200, 2100, 2300, 2500, 2400, 2600, 2500, 2700, 2800, 3000],
      total: 28900,
      unit: "kg garbage collected",
      yMax: 3500
    }
  },
  "Sahaayak Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [4, 6, 8, 5, 10, 15, 12],
      total: 60,
      unit: "tasks completed",
      yMax: 20
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [42, 50, 55, 63],
      total: 210,
      unit: "tasks completed",
      yMax: 80
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [150, 170, 185, 200, 210, 225, 240, 230, 220, 250, 260, 280],
      total: 2620,
      unit: "tasks completed",
      yMax: 350
    }
  },
  "Shiksha Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [10, 12, 15, 12, 18, 25, 20],
      total: 102,
      unit: "hours taught",
      yMax: 30
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [80, 95, 110, 120],
      total: 405,
      unit: "hours taught",
      yMax: 150
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [300, 320, 350, 370, 390, 400, 420, 380, 390, 440, 450, 480],
      total: 4890,
      unit: "hours taught",
      yMax: 600
    }
  },
  "Swasthya Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [2, 1, 5, 2, 12, 35, 18],
      total: 75,
      unit: "medicines matched",
      yMax: 50
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [45, 60, 50, 85],
      total: 240,
      unit: "medicines matched",
      yMax: 100
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [180, 200, 220, 215, 230, 250, 240, 260, 245, 270, 280, 310],
      total: 2900,
      unit: "medicines matched",
      yMax: 350
    }
  },
  "Vastra Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [5, 8, 12, 10, 15, 30, 25],
      total: 105,
      unit: "items donated",
      yMax: 40
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [85, 110, 95, 130],
      total: 420,
      unit: "items donated",
      yMax: 150
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [350, 380, 420, 410, 450, 480, 460, 490, 480, 510, 530, 580],
      total: 5590,
      unit: "items donated",
      yMax: 700
    }
  },
  "Punya Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [2, 4, 3, 5, 8, 12, 10],
      total: 44,
      unit: "elderly visits",
      yMax: 15
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [30, 45, 38, 55],
      total: 168,
      unit: "elderly visits",
      yMax: 70
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [120, 130, 145, 140, 160, 175, 165, 180, 175, 190, 195, 210],
      total: 2005,
      unit: "elderly visits",
      yMax: 250
    }
  },
  "Vriksha Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [0, 2, 4, 5, 12, 35, 15],
      total: 73,
      unit: "saplings planted",
      yMax: 50
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [40, 55, 48, 80],
      total: 223,
      unit: "saplings planted",
      yMax: 100
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [150, 180, 210, 200, 220, 250, 240, 260, 245, 280, 290, 320],
      total: 2845,
      unit: "saplings planted",
      yMax: 350
    }
  },
  "Pashu Setu": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [1, 3, 2, 4, 3, 6, 5],
      total: 24,
      unit: "animals rescued",
      yMax: 10
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [15, 20, 18, 25],
      total: 78,
      unit: "animals rescued",
      yMax: 30
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [80, 95, 110, 105, 120, 130, 125, 135, 130, 140, 145, 160],
      total: 1475,
      unit: "animals rescued",
      yMax: 200
    }
  },
  "Crowdfund": {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [2000, 5000, 3000, 8000, 12000, 25000, 15000],
      total: 70000,
      unit: "INR raised",
      yMax: 30000
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [45000, 60000, 55000, 85000],
      total: 245000,
      unit: "INR raised",
      yMax: 100000
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [180000, 200000, 220000, 215000, 230000, 250000, 240000, 260000, 245000, 270000, 280000, 310000],
      total: 2900000,
      unit: "INR raised",
      yMax: 400000
    }
  }
};

const moduleList = [
  "Ahaar Setu",
  "Swachh Setu",
  "Sahaayak Setu",
  "Shiksha Setu",
  "Swasthya Setu",
  "Vastra Setu",
  "Punya Setu",
  "Vriksha Setu",
  "Pashu Setu",
  "Crowdfund"
];

export default function Reports({ triggerToast }) {
  const [selectedModule, setSelectedModule] = useState("Ahaar Setu");
  const [timeframe, setTimeframe] = useState("weekly");

  // Summary audit list
  const metrics = [
    { module: "Ahaar Setu", desc: "Surplus Meals Saved", value: 2450, unit: "meals", saving: "₹1,22,500 equivalent", co2: "980 kg offset" },
    { module: "Swachh Setu", desc: "Sanitation Drives Organized", value: 42, unit: "drives", saving: "1,250 kg garbage collected", co2: "N/A" },
    { module: "Shiksha Setu", desc: "Tutoring Roster Hours", value: 340, unit: "hours", saving: "64 kids supported", co2: "N/A" },
    { module: "Swasthya Setu", desc: "Surplus Medicines Distributed", value: 120, unit: "donations", saving: "₹45,000 saved", co2: "N/A" },
    { module: "Vriksha Setu", desc: "Trees Planted & Labelled", value: 320, unit: "saplings", saving: "Green cover expansion", co2: "7,680 kg/yr absorption" },
    { module: "Punya Setu", desc: "Elder Care Visits Completed", value: 180, unit: "visits", saving: "Companionship support", co2: "N/A" },
    { module: "Crowdfund", desc: "Transparent Funds Raised", value: 184500, unit: "INR", saving: "100% direct relief", co2: "N/A" }
  ];

  const currentDataset = reportData[selectedModule][timeframe];

  const handleDownloadCSV = () => {
    try {
      const csvRows = [
        ["SevaSetu Community Impact & Resource Savings Report", ""],
        ["Generated on:", new Date().toLocaleString()],
        [],
        ["Module Name", "Selected Timeframe", "Total Recorded Output", "Unit"],
        [selectedModule, timeframe.toUpperCase(), currentDataset.total.toString(), currentDataset.unit],
        [],
        ["Time Interval", "Recorded Metric Value"],
        ...currentDataset.labels.map((lbl, idx) => [lbl, currentDataset.values[idx].toString()])
      ];

      // Convert to CSV format safely
      const csvString = csvRows.map(row => 
        row.map(val => `"${val.replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SevaSetu_${selectedModule.replace(/\s+/g, "_")}_${timeframe}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`Spreadsheet for ${selectedModule} (${timeframe}) downloaded successfully!`);
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
        {/* Left Column: Visual Timeframe Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="info-header" style={{ marginBottom: "20px", flexDirection: "column", alignItems: "stretch", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BarChart3 size={20} />
                  <h3>Interactive Module Charts</h3>
                </div>
                
                {/* Select Module dropdown */}
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="form-control"
                  style={{ width: "160px", padding: "6px 12px", fontSize: "12px", border: "none" }}
                >
                  {moduleList.map(mod => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>

              {/* Timeframe tab switch group */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div className="tab-group" style={{ margin: 0 }}>
                  <button
                    className={`tab-btn ${timeframe === "weekly" ? "active" : ""}`}
                    onClick={() => setTimeframe("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    className={`tab-btn ${timeframe === "monthly" ? "active" : ""}`}
                    onClick={() => setTimeframe("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`tab-btn ${timeframe === "yearly" ? "active" : ""}`}
                    onClick={() => setTimeframe("yearly")}
                  >
                    Yearly
                  </button>
                </div>

                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-green-dark)" }}>
                  Total: {currentDataset.total.toLocaleString()} {currentDataset.unit}
                </span>
              </div>
            </div>

            {/* Custom Claymorphism Dynamic SVG Bar Chart */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ position: "relative", height: "220px", width: "100%", padding: "10px 0 20px 0" }}>
                <svg width="100%" height="100%" style={{ overflow: "visible" }}>
                  {/* Grid Lines */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const yPos = 20 + i * 40;
                    const gridValue = Math.round(currentDataset.yMax - (i * currentDataset.yMax) / 4);
                    return (
                      <g key={i}>
                        <line x1="40" y1={yPos} x2="100%" y2={yPos} stroke="rgba(48, 109, 41, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
                        <text x="32" y={yPos + 4} textAnchor="end" fontSize="10" fill="var(--color-green-dark)" fontWeight="700">
                          {gridValue >= 1000 ? `${(gridValue / 1000).toFixed(1)}k` : gridValue}
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw the Vertical Bars */}
                  {currentDataset.values.map((val, idx) => {
                    const colCount = currentDataset.values.length;
                    const startX = 50;
                    const barWidth = timeframe === "yearly" ? 18 : 28;
                    const spacing = (100 / colCount); // percentage-based spacing
                    
                    const xPercent = `${startX + idx * (88 / (colCount - 1 || 1))}%`;
                    const percentHeight = Math.min((val / currentDataset.yMax) * 160, 160);
                    const yPos = 180 - percentHeight;

                    return (
                      <g key={idx}>
                        {/* Outset 3D Clay Bar (simulated by stacking rectangles with gradients) */}
                        <rect
                          x={xPercent}
                          y={yPos}
                          width={barWidth}
                          height={percentHeight}
                          rx={barWidth / 2}
                          fill="url(#clayBarGradient)"
                          filter="url(#clayShadowFilter)"
                          transform={`translate(${-barWidth/2}, 0)`}
                        />
                        {/* Grid labels */}
                        <text
                          x={xPercent}
                          y="198"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="var(--color-green-dark)"
                        >
                          {currentDataset.labels[idx]}
                        </text>
                        {/* Hover values */}
                        <text
                          x={xPercent}
                          y={yPos - 6}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="800"
                          fill="var(--color-green-medium)"
                        >
                          {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* SVG Filters and Gradients for Claymorphism */}
                  <defs>
                    <linearGradient id="clayBarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#86efac" />
                      <stop offset="40%" stopColor="#306d29" />
                      <stop offset="100%" stopColor="#0d530e" />
                    </linearGradient>
                    <filter id="clayShadowFilter" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
                      <feDropShadow dx="-2" dy="-2" stdDeviation="2" floodColor="#fff" floodOpacity="0.5" />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
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
            
            {/* Direct download selector */}
            <button className="btn btn-primary" onClick={handleDownloadCSV} style={{ width: "100%", gap: "10px" }}>
              <Download size={16} /> Export Selected Ledger (.csv)
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
                <Calendar size={14} /> Timeframe Range
              </h4>
              <ul style={{ paddingLeft: "16px", fontSize: "11px", color: "var(--color-green-dark)", margin: "8px 0 0 0", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li><strong>Weekly:</strong> Aggregated daily data for the past 7 days</li>
                <li><strong>Monthly:</strong> Aggregated weekly data for the current month</li>
                <li><strong>Yearly:</strong> Monthly distributions covering the current calendar year</li>
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
