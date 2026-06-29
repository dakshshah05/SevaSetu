import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";

export default function Chatbot({
  foods = [],
  drives = [],
  skills = [],
  crowd = [],
  sosList = [],
  meds = [],
  tutors = [],
  tutorRequests = [],
  camps = [],
  clothes = [],
  elderly = [],
  trees = [],
  rescues = [],
  user = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 Hi! I am SevaBuddy, your cute 3D civic assistant. I can help you search live database listings, upcoming cleanup drives, food alerts, or emergency SOS coordinates. Ask me anything!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [botMood, setBotMood] = useState("normal"); // normal, happy, thinking
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const generateResponse = (message) => {
    const msg = message.toLowerCase();
    
    // Check SOS
    if (msg.includes("sos") || msg.includes("emergency") || msg.includes("urgent") || msg.includes("flood")) {
      const active = sosList.filter(s => s.status === "active");
      if (active.length > 0) {
        return `🚨 There are ${active.length} active emergency SOS alert(s):\n` + 
          active.map(s => `- **${s.title}** at ${s.location} (${s.severity} severity): ${s.description}`).join("\n");
      }
      return "🟢 All clear! There are currently no active emergency SOS alerts in the neighborhood.";
    }
    
    // Check Food/Ahaar
    if (msg.includes("food") || msg.includes("eat") || msg.includes("meal") || msg.includes("surplus") || msg.includes("restaurant") || msg.includes("ahaar")) {
      const pending = foods.filter(f => f.status === "pending");
      if (pending.length > 0) {
        return `🍲 We have ${pending.length} pending surplus food pickup(s):\n` +
          pending.map(f => `- **${f.foodType}** (${f.quantity}) posted by ${f.restaurantName} at ${f.location}.`).join("\n") +
          "\nVolunteers, please claim these routes in Ahaar Setu!";
      }
      return "🍲 There are no pending surplus food alerts right now. Restaurants can list food in the Ahaar Setu tab!";
    }
    
    // Check Cleanup Drives/Swachh
    if (msg.includes("clean") || msg.includes("drive") || msg.includes("swachh") || msg.includes("trash") || msg.includes("sanitation") || msg.includes("garbage")) {
      const active = drives.filter(d => d.date >= new Date().toISOString().split("T")[0]);
      if (active.length > 0) {
        return `🧹 Active Swachh Bharat Drives:\n` +
          active.map(d => `- **${d.title}** at **${d.location}** on ${d.date} (+${d.pointsReward} Pts)`).join("\n") +
          "\nJoin a drive in the Swachh Setu tab!";
      }
      return "🧹 No upcoming sanitation drives scheduled. NGOs can schedule a drive under the Swachh Setu tab!";
    }
    
    // Check NGO tasks/Sahaayak
    if (msg.includes("ngo") || msg.includes("task") || msg.includes("skills") || msg.includes("graphic") || msg.includes("design") || msg.includes("work") || msg.includes("sahaayak")) {
      const openTasks = skills.filter(s => s.status === "open");
      if (openTasks.length > 0) {
        return `💼 Open Skill-based NGO micro-tasks:\n` +
          openTasks.map(t => `- **${t.title}** (${t.requiredSkill}) by NGO **${t.organizerName}** (+${t.pointsReward} Points, ${t.hoursReward}h impact)`).join("\n") +
          "\nClaim work in the Sahaayak Setu tab!";
      }
      return "💼 No open skill tasks. NGOs can post tasks like design, bookkeeping, etc., in the Sahaayak Setu tab.";
    }

    // Check Tutor/Shiksha
    if (msg.includes("teach") || msg.includes("tutor") || msg.includes("education") || msg.includes("study") || msg.includes("math") || msg.includes("child") || msg.includes("shiksha")) {
      const activeReqs = tutorRequests.filter(r => r.status === "pending");
      if (activeReqs.length > 0) {
        return `📚 Active tutoring requests for children:\n` +
          activeReqs.map(r => `- **${r.subject}** tutoring for **${r.childName}** in **${r.location}**`).join("\n") +
          "\nVolunteer tutors can claim slots in the Shiksha Setu tab!";
      }
      return "📚 All children are currently matched with tutors. You can request new tutoring support or register as a tutor in Shiksha Setu!";
    }

    // Check Health/Swasthya/Meds
    if (msg.includes("camp") || msg.includes("medical") || msg.includes("doctor") || msg.includes("health") || msg.includes("medicine") || msg.includes("pill") || msg.includes("swasthya")) {
      const activeCamps = camps.filter(c => c.status === "scheduled");
      const activeMeds = meds.filter(m => m.status === "available");
      let resp = "";
      if (activeCamps.length > 0) {
        resp += `🏥 Scheduled Free Medical Camps:\n` +
          activeCamps.map(c => `- **${c.title}** at ${c.location} on ${c.date}`).join("\n") + "\n";
      }
      if (activeMeds.length > 0) {
        resp += `💊 Available Surplus Medicines in Pool:\n` +
          activeMeds.map(m => `- **${m.medicineName}** (Qty: ${m.quantity}, Exp: ${m.expiryDate})`).join("\n") + "\n";
      }
      if (!resp) {
        return "🏥 There are no active medical camps or surplus medicines at the moment. Donate meds or schedule camps in Swasthya Setu!";
      }
      return resp;
    }

    // Check Clothes/Vastra
    if (msg.includes("clothes") || msg.includes("donation") || msg.includes("blanket") || msg.includes("toy") || msg.includes("book") || msg.includes("shirt") || msg.includes("pants") || msg.includes("vastra")) {
      const pending = clothes.filter(c => c.status === "pending");
      if (pending.length > 0) {
        return `🎁 Items listed for donation (pending pickup):\n` +
          pending.map(c => `- **${c.category}** (${c.quantity}): "${c.details}" by ${c.donorName}`).join("\n") +
          "\nVolunteers can claim pickup routes in the Vastra Setu tab!";
      }
      return "🎁 No pending clothes/essentials donations listed. You can list items to donate in the Vastra Setu tab!";
    }

    // Check Elderly/Punya
    if (msg.includes("elder") || msg.includes("senior") || msg.includes("groceries") || msg.includes("companionship") || msg.includes("visit") || msg.includes("punya")) {
      const pending = elderly.filter(e => e.status === "pending");
      if (pending.length > 0) {
        return `❤️ Elderly support requests pending helper:\n` +
          pending.map(e => `- **${e.helperType}** for **${e.elderlyName}** (Age: ${e.age}) in ${e.location}`).join("\n") +
          "\nEnlist as a helper in the Punya Setu tab!";
      }
      return "❤️ All senior citizen requests have active helpers. Request assistance for a senior in the Punya Setu tab!";
    }

    // Check Trees/Vriksha
    if (msg.includes("tree") || msg.includes("plant") || msg.includes("sapling") || msg.includes("canopy") || msg.includes("forest") || msg.includes("vriksha")) {
      const count = trees.length;
      return `🌳 We have planted ${count} virtual name-labeled trees in our canopy grid!\n` +
        (count > 0 ? trees.slice(0, 5).map(t => `- **${t.treeName}** (Planted by ${t.volunteerName})`).join("\n") : "Be the first to plant a virtual tree!") +
        "\nExplore upcoming schedules and plant saplings in the Vriksha Setu tab.";
    }

    // Check Animal Rescue/Pashu
    if (msg.includes("animal") || msg.includes("dog") || msg.includes("cat") || msg.includes("rescue") || msg.includes("vet") || msg.includes("stray") || msg.includes("pashu")) {
      const reported = rescues.filter(r => r.status === "reported");
      if (reported.length > 0) {
        return `🐾 Injured stray animals reported (pending rescue):\n` +
          reported.map(r => `- **${r.animalType}** with "${r.injuryDetails}" at ${r.location}`).join("\n") +
          "\nVolunteers can dispatch to rescue locations in the Pashu Setu tab!";
      }
      return "🐾 No stray animal injuries reported. Report strays, adopt pets, or view vet clinics in the Pashu Setu tab!";
    }

    // Check Crowdfund/Campaigns
    if (msg.includes("fund") || msg.includes("money") || msg.includes("crowdfund") || msg.includes("campaign") || msg.includes("donate") || msg.includes("rs") || msg.includes("rupees")) {
      if (crowd.length > 0) {
        return `🪙 Active Crowdfunding Campaigns (100% transparent):\n` +
          crowd.map(c => `- **${c.title}**: Raised ₹${c.currentAmount} of ₹${c.targetAmount} (${Math.round((c.currentAmount/c.targetAmount)*100)}%)`).join("\n") +
          "\nDonate to verified campaigns and download 80G tax receipts in the Crowdfund tab!";
      }
      return "🪙 No active crowdfunding campaigns at the moment. NGOs can launch campaigns in the Crowdfund tab.";
    }

    // Check Points & Rewards
    if (msg.includes("reward") || msg.includes("point") || msg.includes("store") || msg.includes("voucher") || msg.includes("discount") || msg.includes("swiggy") || msg.includes("zepto")) {
      return "🎁 Earning & Redeeming Points on SevaSetu:\n" +
        "- **Earn Points**: By claiming food pickups (+30 Pts), participating in cleanup drives (+50 Pts), teaching (+40 Pts), assisting seniors (+50 Pts), rescuing animals (+40 Pts), or donating money (+10 Pts per ₹100).\n" +
        "- **Redeem Vouchers**: Visit the *Rewards* tab to redeem points for Zepto, Swiggy, or BookMyShow discounts!";
    }

    // User context
    if (msg.includes("who am i") || msg.includes("my account") || msg.includes("role") || msg.includes("profile") || msg.includes("points")) {
      if (user) {
        return `👤 Profile Details:\n` +
          `- **Name**: ${user.name}\n` +
          `- **Email**: ${user.email}\n` +
          `- **Role**: ${user.role.toUpperCase()}\n` +
          (user.role === "volunteer" ? `- **Seva Points**: ${user.rewardPoints || 0} Pts\n- **Impact Hours**: ${user.impactHours || 0}h\n` : "") +
          (user.role === "restaurant" ? `- **Seva Points**: ${user.sevaPoints || 0} Pts\n` : "") +
          `- **Actions Completed**: ${user.completedCount || 0} tasks`;
      }
      return "👤 You are currently a Guest. Click the *Login* button in the top-right taskbar to sign in or register!";
    }

    // General fallback
    return "🤖 Hello! I am SevaBuddy, your cute 3D civic assistant. I search live database listings and website content to answer your questions.\n\n" +
      "Try asking me things like:\n" +
      "👉 *Is there any surplus food?*\n" +
      "👉 *Are there cleanup drives scheduled?*\n" +
      "👉 *Are there any active SOS alerts?*\n" +
      "👉 *How many trees did we plant?*\n" +
      "👉 *How do I earn reward points?*\n" +
      "👉 *Show my profile*";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    setBotMood("thinking");

    setTimeout(() => {
      const responseText = generateResponse(userMsg.text);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      setBotMood("happy");
      setTimeout(() => setBotMood("normal"), 2000);
    }, 1000);
  };

  return (
    <div id="sevasetu-chatbot">
      {/* 3D Floating Avatar */}
      {!isOpen && (
        <button 
          className="chatbot-avatar-btn" 
          onClick={() => setIsOpen(true)}
          title="Chat with SevaBuddy"
        >
          <div className="chatbot-avatar-3d">
            {/* Specular Highlight Gloss Layer */}
            <div className="specular-highlight"></div>
            {/* Blinking eyes */}
            <div className={`digital-eyes ${botMood}`}>
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
            {/* Smile / Glow status */}
            <div className={`digital-mouth ${botMood}`}></div>
          </div>
          <div className="chatbot-avatar-shadow"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="chatbot-header-3d-head">
                <div className="specular-highlight-small"></div>
                <div className="digital-eyes-small">
                  <div className="eye-small"></div>
                  <div className="eye-small"></div>
                </div>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>SevaBuddy</h4>
                <span style={{ fontSize: "10px", opacity: 0.8 }}>Live Civic Assistant</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages body */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-container ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="chat-bubble-icon">🤖</div>
                )}
                <div className={`chat-bubble ${msg.sender}`}>
                  <p style={{ whiteSpace: "pre-line", margin: 0 }}>{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-container bot">
                <div className="chat-bubble-icon">🤖</div>
                <div className="chat-bubble bot typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer input form */}
          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Ask about food, drives, SOS, points..." 
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                if (botMood === "normal") setBotMood("thinking");
              }}
              onBlur={() => {
                if (botMood === "thinking") setBotMood("normal");
              }}
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-btn">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
