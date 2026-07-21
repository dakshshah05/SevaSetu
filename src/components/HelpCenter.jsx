import { useState } from "react";
import { Search, HelpCircle, Mail, Phone, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export default function HelpCenter({ triggerToast }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeManual, setActiveManual] = useState("volunteer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const faqs = [
    {
      q: "How does Ahaar Setu ensure food safety?",
      a: "Restaurants must provide packaging details, allergen tags, and maximum recommended consumption times when listing food. Volunteers must transport the food in sealed, insulated containers and deliver it directly to verified shelters within 45 minutes of pickup."
    },
    {
      q: "How are Seva Points earned and what can I redeem them for?",
      a: "Seva Points are dynamically rewarded for participating in civic tasks (Cleanups: +50, Tutoring: +40, Elder care visits: +50, Food route completion: +30). You can redeem your points in the 'Rewards' store for verified partner discounts (Zepto groceries, Swiggy meals, BookMyShow movie vouchers)."
    },
    {
      q: "I am an NGO Administrator. How do I publish cleanup drives or micro-tasks?",
      a: "Once logged in as an NGO Administrator, navigate to Swachh Setu (for drives) or Sahaayak Setu (for micro-tasks) and click the respective 'Schedule' or 'Post' buttons. All registered volunteers will immediately see your campaigns on their dashboard boards."
    },
    {
      q: "Is crowdfunding on SevaSetu transparent?",
      a: "Yes! 100% of the funds donated go directly to the verified campaign's node. NGOs must upload invoice scans and photographic proof of execution for every rupee spent, which are visible directly on the Crowdfund transparency ledger."
    },
    {
      q: "How does the virtual tree grid work in Vriksha Setu?",
      a: "When you join a local reforestation campaign, a virtual node is allocated to you. You can label the tree with your name, track its growth checks, upload photos of the sapling check-in, and monitor your estimated carbon absorption credits in real-time."
    }
  ];

  const filteredFaqs = faqs.filter(
    faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
           faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      triggerToast("Please fill in all required fields.", true);
      return;
    }
    triggerToast("Your support ticket has been logged! Our team will contact you within 24 hours.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="module-panel reveal-on-scroll reveal-visible" style={{ gap: "36px" }}>
      {/* Help Search Banner */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ fontSize: "28px", color: "var(--color-green-dark)" }}>How can we support you today?</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "500px", margin: "0 auto 10px auto" }}>
          Search our database of guides, browse frequently asked questions, or connect with our support agents.
        </p>
        
        <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
          <input
            type="text"
            placeholder="Type your question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: "44px", borderRadius: "24px" }}
          />
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
        </div>
      </div>

      <div className="dashboard-columns" style={{ gridTemplateColumns: "1.7fr 1.3fr" }}>
        {/* Left Column: FAQs & Role Guides */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Accordion FAQ Panel */}
          <div className="card">
            <div className="info-header" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <HelpCircle size={20} />
                <h3>Frequently Asked Questions</h3>
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px" }}>
                No FAQs match your search. Try typing keywords like 'points', 'food', or 'NGO'.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "16px 20px",
                        background: "linear-gradient(135deg, var(--color-beige-light) 0%, #f4edd0 100%)",
                        border: "none",
                        borderRadius: "16px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "var(--color-green-dark)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: expandedFaq === idx 
                          ? "inset 3px 3px 6px rgba(180, 172, 130, 0.35), inset -3px -3px 6px #ffffff"
                          : "4px 4px 10px rgba(180, 172, 130, 0.3), -4px -4px 10px #ffffff, inset 2px 2px 4px #ffffff, inset -2px -2px 4px rgba(180, 172, 130, 0.15)",
                        transition: "var(--transition)"
                      }}
                    >
                      <span>{faq.q}</span>
                      {expandedFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {expandedFaq === idx && (
                      <div 
                        style={{
                          padding: "16px 20px",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          color: "var(--color-green-dark)",
                          background: "rgba(231, 225, 177, 0.25)",
                          borderRadius: "16px",
                          marginTop: "2px",
                          boxShadow: "inset 2px 2px 4px rgba(180, 172, 130, 0.15)"
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Guides */}
          <div className="card">
            <div className="info-header" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={20} />
                <h3>Manuals & Roster Handbooks</h3>
              </div>
              <div className="tab-group">
                <button
                  className={`tab-btn ${activeManual === "volunteer" ? "active" : ""}`}
                  onClick={() => setActiveManual("volunteer")}
                >
                  Volunteer
                </button>
                <button
                  className={`tab-btn ${activeManual === "restaurant" ? "active" : ""}`}
                  onClick={() => setActiveManual("restaurant")}
                >
                  Restaurant
                </button>
                <button
                  className={`tab-btn ${activeManual === "ngo" ? "active" : ""}`}
                  onClick={() => setActiveManual("ngo")}
                >
                  NGO Admin
                </button>
              </div>
            </div>

            {activeManual === "volunteer" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", lineHeight: "1.5" }}>
                <h4 style={{ color: "var(--color-green-medium)" }}>Volunteer Code of Conduct</h4>
                <p>1. <strong>Claims Lock:</strong> When you claim a food route, you lock it for other volunteers. Pick it up and deliver it within the designated expiry time.</p>
                <p>2. <strong>Verification uploads:</strong> Take clean, recognizable photos when check-in actions ask for verification (sanitation drives, medicine deliveries, tree growth check-ins).</p>
                <p>3. <strong>Points Credit:</strong> Check-in validations credit your Seva Points immediately. Abuse or uploading fake photos will result in account review.</p>
              </div>
            )}

            {activeManual === "restaurant" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", lineHeight: "1.5" }}>
                <h4 style={{ color: "var(--color-green-medium)" }}>Restaurant Portal Guide</h4>
                <p>1. <strong>Clear Packaging Labels:</strong> Label surplus food items with packaging timestamps and primary ingredients.</p>
                <p>2. <strong>Roster Scheduling:</strong> Post listings when surplus is identified. If you have recurring weekly leftover stocks, coordinate bulk schedules with a partner NGO.</p>
                <p>3. <strong>Seva Badges:</strong> Earned Seva Points rank your restaurant on the civic leaderboard, promoting your brand as a zero-waste advocate.</p>
              </div>
            )}

            {activeManual === "ngo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", lineHeight: "1.5" }}>
                <h4 style={{ color: "var(--color-green-medium)" }}>NGO Campaign Guidelines</h4>
                <p>1. <strong>Roster Coordination:</strong> Manage emergency SOS coordinates with clear instructions regarding needed supply quantities.</p>
                <p>2. <strong>Financial Transparency:</strong> Verify crowdfund spending invoices. Upload receipt images promptly to keep the campaign timeline active.</p>
                <p>3. <strong>Task Verification:</strong> Review volunteer proof submissions in the Sahaayak Setu admin portal before approving points rewards.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact Support Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card">
            <h3>Contact Support</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Can't find what you need? Send a message to our support desk.
            </p>

            <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label htmlFor="support-name">Name *</label>
                <input
                  id="support-name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="support-email">Email *</label>
                <input
                  id="support-email"
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="support-subject">Subject</label>
                <input
                  id="support-subject"
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="support-message">Message *</label>
                <textarea
                  id="support-message"
                  placeholder="Describe your issue or query..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                Send Message
              </button>
            </form>
          </div>

          {/* Quick Contacts */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3>Direct Channels</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px" }}>
              <div className="stat-icon teal" style={{ width: "32px", height: "32px" }}>
                <Mail size={14} />
              </div>
              <div>
                <span style={{ display: "block", fontWeight: "700" }}>Support Email</span>
                <a href="mailto:support@sevasetu.org" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>support@sevasetu.org</a>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px" }}>
              <div className="stat-icon violet" style={{ width: "32px", height: "32px" }}>
                <Phone size={14} />
              </div>
              <div>
                <span style={{ display: "block", fontWeight: "700" }}>Helpline Hotline</span>
                <span style={{ color: "var(--text-secondary)" }}>+91 80 4910 2800</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
