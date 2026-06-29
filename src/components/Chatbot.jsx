import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Send, X } from "lucide-react";

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
      text: "👋 Hi! I am SevaBuddy, your cute 3D civic assistant. I can search live database listings (food packages, cleanup drives, active SOS coordinates, trees planted, stray animal rescues) and answer questions about the SevaSetu platform. How can I help you today?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const canvasRef = useRef(null);

  // 3D Three.js Interactive Robot Setup (runs once on mount)
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = 80;
    const height = 90;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const greenBounceLight = new THREE.DirectionalLight(0x22c55e, 0.5);
    greenBounceLight.position.set(-2, -4, -1);
    scene.add(greenBounceLight);

    const chestLight = new THREE.PointLight(0xa3e635, 2.5, 4);
    chestLight.position.set(0, -0.2, 0.5);
    scene.add(chestLight);

    // 4. Materials
    const whitePlastic = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.15,
      metalness: 0.05
    });

    const darkScreen = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.08,
      metalness: 0.7
    });

    const greenTrim = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.2,
      metalness: 0.2
    });

    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0f172a
    });

    const eyeHighlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xa3e635
    });

    // 5. Robot Group Assembly
    const robot = new THREE.Group();

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const body = new THREE.Mesh(bodyGeo, whitePlastic);
    body.scale.set(1, 1.15, 0.95);
    body.position.y = -0.45;
    robot.add(body);

    // Chest Ring & Glowing Core
    const chestGeo = new THREE.TorusGeometry(0.14, 0.035, 16, 64);
    const chestRing = new THREE.Mesh(chestGeo, greenTrim);
    chestRing.position.set(0, -0.38, 0.5);
    chestRing.rotation.x = 0.1;
    robot.add(chestRing);

    const coreGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const core = new THREE.Mesh(coreGeo, glowMaterial);
    core.position.set(0, -0.38, 0.51);
    robot.add(core);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.35;

    const headGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const head = new THREE.Mesh(headGeo, whitePlastic);
    head.scale.set(1.15, 0.96, 1.0);
    headGroup.add(head);

    // Face Screen
    const screenGeo = new THREE.SphereGeometry(0.66, 32, 32);
    const screen = new THREE.Mesh(screenGeo, darkScreen);
    screen.scale.set(1.04, 0.76, 0.72);
    screen.position.set(0, -0.02, 0.16);
    headGroup.add(screen);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.11, 32, 32);
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMaterial);
    eyeLeft.position.set(-0.24, 0.02, 0.72);
    headGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMaterial);
    eyeRight.position.set(0.24, 0.02, 0.72);
    headGroup.add(eyeRight);

    // Specular eye highlights
    const specGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const specLeft = new THREE.Mesh(specGeo, eyeHighlightMaterial);
    specLeft.position.set(-0.21, 0.06, 0.81);
    headGroup.add(specLeft);

    const specRight = new THREE.Mesh(specGeo, eyeHighlightMaterial);
    specRight.position.set(0.27, 0.06, 0.81);
    headGroup.add(specRight);

    // Ears / Headsets
    const earGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 32);
    const earLeft = new THREE.Mesh(earGeo, greenTrim);
    earLeft.rotation.z = Math.PI / 2;
    earLeft.position.set(-0.84, 0, 0);
    headGroup.add(earLeft);

    const earRight = new THREE.Mesh(earGeo, greenTrim);
    earRight.rotation.z = Math.PI / 2;
    earRight.position.set(0.84, 0, 0);
    headGroup.add(earRight);

    robot.add(headGroup);

    // Arms
    const armGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const armLeft = new THREE.Mesh(armGeo, whitePlastic);
    armLeft.scale.set(1.0, 1.4, 1.0);
    armLeft.position.set(-0.7, -0.4, 0.05);
    robot.add(armLeft);

    const armRight = new THREE.Mesh(armGeo, whitePlastic);
    armRight.scale.set(1.0, 1.4, 1.0);
    armRight.position.set(0.7, -0.4, 0.05);
    robot.add(armRight);

    // Legs / Feet
    const legGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
    const legLeft = new THREE.Mesh(legGeo, whitePlastic);
    legLeft.position.set(-0.24, -1.05, 0.05);
    robot.add(legLeft);

    const legRight = new THREE.Mesh(legGeo, whitePlastic);
    legRight.position.set(0.24, -1.05, 0.05);
    robot.add(legRight);

    const footGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const footLeft = new THREE.Mesh(footGeo, greenTrim);
    footLeft.scale.set(1, 0.6, 1.3);
    footLeft.position.set(-0.24, -1.16, 0.1);
    robot.add(footLeft);

    const footRight = new THREE.Mesh(footGeo, greenTrim);
    footRight.scale.set(1, 0.6, 1.3);
    footRight.position.set(0.24, -1.16, 0.1);
    robot.add(footRight);

    robot.position.y = 0.15;
    scene.add(robot);

    // Mouse Tracking Coordinates
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = x * 0.35;
      targetY = y * 0.25;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId = null;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Bobbing floating motion
      robot.position.y = 0.15 + Math.sin(elapsedTime * 2.2) * 0.07;
      
      // Interpolate rotations smoothly
      headGroup.rotation.y += (targetX - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (-targetY - headGroup.rotation.x) * 0.1;
      robot.rotation.y += (targetX * 0.4 - robot.rotation.y) * 0.08;

      core.material.color.setHSL(0.25, 0.8, 0.5 + Math.sin(elapsedTime * 4) * 0.15);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // AI Gemini API RAG Query Call
  const fetchGeminiResponse = async (userMessage) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
      const systemInstruction = `You are SevaBuddy, a cute 3D chatbot helper for SevaSetu.
Your mission is to answer questions using ONLY the live database context and website information below.
If the user asks about anything unrelated to SevaSetu (e.g., general knowledge, math, coding, jokes, non-SevaSetu weather, politics, other apps), you MUST decline politely and tell them you can only assist with SevaSetu community queries.

WEBSITE MODULES DESCRIPTION:
- Ahaar Setu: Surplus food redistribution from restaurants to volunteer networks.
- Swachh Setu: Sanitation drives with photo verification.
- Sahaayak Setu: Volunteer rosters, NGO administrative Consoles, and skill-based micro-tasks.
- Seva Rewards Store: Exchange volunteer points for discounts (Zepto, Swiggy, BookMyShow).
- Punya Setu: Elder companionship requests and transparent Crowdfunding campaigns.
- Swasthya Setu: Free medical camps and surplus medicine donation pool.
- Shiksha Setu: Volunteer tutoring for children.
- Vastra Setu: Clothes/essentials donation drives.
- Vriksha Setu: Virtual forest sapling planting and labeling grid.
- SOS: Emergency neighborhood disaster/flood broadcasts.

LIVE COMMUNITY DATABASE STATE (JSON FORMAT):
- User Session Profile: ${JSON.stringify(user)}
- Emergency SOS Alerts: ${JSON.stringify(sosList.filter(s => s.status === 'active'))}
- Surplus Food Alerts: ${JSON.stringify(foods.filter(f => f.status === 'pending'))}
- Cleanup Drives: ${JSON.stringify(drives.filter(d => d.date >= new Date().toISOString().split('T')[0]))}
- NGO Admin Tasks: ${JSON.stringify(skills.filter(s => s.status === 'open'))}
- Children Tutoring Requests: ${JSON.stringify(tutorRequests.filter(r => r.status === 'pending'))}
- Medical Camps Scheduled: ${JSON.stringify(camps.filter(c => c.status === 'scheduled'))}
- Medicine Pool Stock: ${JSON.stringify(meds.filter(m => m.status === 'available'))}
- Clothes Donations: ${JSON.stringify(clothes.filter(c => c.status === 'pending'))}
- Seniors Help Requests: ${JSON.stringify(elderly.filter(e => e.status === 'pending'))}
- Virtual Trees Planted: ${JSON.stringify(trees)}
- Stray Animal Rescues: ${JSON.stringify(rescues.filter(r => r.status === 'reported'))}
- Crowdfunding Campaigns: ${JSON.stringify(crowd)}

CRITICAL RESPONSE INSTRUCTIONS:
1. If the user query is off-topic, say: "🤖 I am SevaBuddy, a dedicated chatbot helper for SevaSetu. I am programmed to only answer questions regarding the SevaSetu platform, its civic modules, and our live database. Please ask a question related to SevaSetu community activities!"
2. Format lists with clean Markdown bullet points.
3. Be friendly, encouraging, and brief.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: userMessage }]
            }],
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
      return null;
    } catch (err) {
      console.error("Gemini API Error, falling back to local engine:", err);
      return null;
    }
  };

  // Local Regex matching engine (fallback)
  const generateLocalResponse = (message) => {
    const msg = message.toLowerCase();

    // Whitelist check using strict word boundaries \b to avoid substring false matches (e.g. weather/eat)
    const whitelist = [
      /\b(hi|hello|hey|help|buddy)\b/i,
      /\b(sevasetu|seva|setu)\b/i,
      /\b(food|eat|meal|surplus|restaurant|ahaar|package|pick)\b/i,
      /\b(clean|drive|swachh|trash|sanitation|garbage|rubbish)\b/i,
      /\b(ngo|task|skills|graphic|design|work|sahaayak|job)\b/i,
      /\b(teach|tutor|education|study|math|child|shiksha|learn)\b/i,
      /\b(camp|medical|doctor|health|medicine|pill|swasthya|clinic)\b/i,
      /\b(clothes|donation|blanket|toy|book|shirt|pants|vastra)\b/i,
      /\b(elder|senior|groceries|companionship|visit|punya|grandparent)\b/i,
      /\b(tree|plant|sapling|canopy|forest|vriksha)\b/i,
      /\b(animal|dog|cat|rescue|vet|stray|pashu|pet|adopt)\b/i,
      /\b(fund|money|crowdfund|campaign|donate|rs|rupees|contribute)\b/i,
      /\b(sos|emergency|flood|disaster|danger|urgent)\b/i,
      /\b(reward|point|store|voucher|discount|swiggy|zepto|ticket|coupon)\b/i,
      /\b(who am i|my account|role|profile|points|dashboard)\b/i
    ];

    const hasMatch = whitelist.some(rx => rx.test(msg));

    if (!hasMatch) {
      return "🤖 I am SevaBuddy, a dedicated chatbot helper for SevaSetu. I am programmed to only answer questions regarding the SevaSetu platform, its civic modules, and our live database.\n\n" +
        "Please ask a question related to SevaSetu (e.g. food listings, cleanup drives, tutoring slots, animal rescues, or emergency SOS alerts)!";
    }

    if (/\b(hello|hi|hey|help|who are you|what are you)\b/i.test(msg)) {
      return "🤖 Hello! I am SevaBuddy, your interactive 3D chatbot helper. I can search live database entries (food packages, cleanup drives, active SOS coordinates, trees planted, stray animal rescues) and guide you on how to contribute to SevaSetu.\n\n" +
        "Try asking me things like:\n" +
        "👉 *Is there any surplus food?*\n" +
        "👉 *Are there cleanup drives scheduled?*\n" +
        "👉 *Are there any active SOS alerts?*\n" +
        "👉 *How many trees did we plant?*\n" +
        "👉 *How do I earn reward points?*";
    }

    if (/\b(sos|emergency|urgent|flood|disaster|danger)\b/i.test(msg)) {
      const active = sosList.filter(s => s.status === "active");
      if (active.length > 0) {
        return `🚨 There are ${active.length} active emergency SOS alert(s):\n` + 
          active.map(s => `- **${s.title}** at ${s.location} (${s.severity} severity): ${s.description}`).join("\n");
      }
      return "🟢 All clear! There are currently no active emergency SOS alerts in the neighborhood.";
    }
    
    if (/\b(food|eat|meal|surplus|restaurant|ahaar|package|pick)\b/i.test(msg)) {
      const pending = foods.filter(f => f.status === "pending");
      if (pending.length > 0) {
        return `🍲 We have ${pending.length} pending surplus food pickup(s):\n` +
          pending.map(f => `- **${f.foodType}** (${f.quantity}) posted by ${f.restaurantName} at ${f.location}.`).join("\n") +
          "\nVolunteers, please claim these routes in Ahaar Setu!";
      }
      return "🍲 There are no pending surplus food alerts right now. Restaurants can list food in the Ahaar Setu tab!";
    }
    
    if (/\b(clean|drive|swachh|trash|sanitation|garbage|rubbish)\b/i.test(msg)) {
      const active = drives.filter(d => d.date >= new Date().toISOString().split("T")[0]);
      if (active.length > 0) {
        return `🧹 Active Swachh Bharat Drives:\n` +
          active.map(d => `- **${d.title}** at **${d.location}** on ${d.date} (+${d.pointsReward} Pts)`).join("\n") +
          "\nJoin a drive in the Swachh Setu tab!";
      }
      return "🧹 No upcoming sanitation drives scheduled. NGOs can schedule a drive under the Swachh Setu tab!";
    }
    
    if (/\b(ngo|task|skills|graphic|design|work|sahaayak|job)\b/i.test(msg)) {
      const openTasks = skills.filter(s => s.status === "open");
      if (openTasks.length > 0) {
        return `💼 Open Skill-based NGO micro-tasks:\n` +
          openTasks.map(t => `- **${t.title}** (${t.requiredSkill}) by NGO **${t.organizerName}** (+${t.pointsReward} Points, ${t.hoursReward}h impact)`).join("\n") +
          "\nClaim work in the Sahaayak Setu tab!";
      }
      return "💼 No open skill tasks. NGOs can post tasks like design, bookkeeping, etc., in the Sahaayak Setu tab.";
    }

    if (/\b(teach|tutor|education|study|math|child|shiksha|learn)\b/i.test(msg)) {
      const activeReqs = tutorRequests.filter(r => r.status === "pending");
      if (activeReqs.length > 0) {
        return `📚 Active tutoring requests for children:\n` +
          activeReqs.map(r => `- **${r.subject}** tutoring for **${r.childName}** in **${r.location}**`).join("\n") +
          "\nVolunteer tutors can claim slots in the Shiksha Setu tab!";
      }
      return "📚 All children are currently matched with tutors. You can request new tutoring support or register as a tutor in Shiksha Setu!";
    }

    if (/\b(camp|medical|doctor|health|medicine|pill|swasthya|clinic)\b/i.test(msg)) {
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

    if (/\b(clothes|donation|blanket|toy|book|shirt|pants|vastra)\b/i.test(msg)) {
      const pending = clothes.filter(c => c.status === "pending");
      if (pending.length > 0) {
        return `🎁 Items listed for donation (pending pickup):\n` +
          pending.map(c => `- **${c.category}** (${c.quantity}): "${c.details}" by ${c.donorName}`).join("\n") +
          "\nVolunteers can claim pickup routes in the Vastra Setu tab!";
      }
      return "🎁 No pending clothes/essentials donations listed. You can list items to donate in the Vastra Setu tab!";
    }

    if (/\b(elder|senior|groceries|companionship|visit|punya|grandparent)\b/i.test(msg)) {
      const pending = elderly.filter(e => e.status === "pending");
      if (pending.length > 0) {
        return `❤️ Elderly support requests pending helper:\n` +
          pending.map(e => `- **${e.helperType}** for **${e.elderlyName}** (Age: ${e.age}) in ${e.location}`).join("\n") +
          "\nEnlist as a helper in the Punya Setu tab!";
      }
      return "❤️ All senior citizen requests have active helpers. Request assistance for a senior in the Punya Setu tab!";
    }

    if (/\b(tree|plant|sapling|canopy|forest|vriksha)\b/i.test(msg)) {
      const count = trees.length;
      return `🌳 We have planted ${count} virtual name-labeled trees in our canopy grid!\n` +
        (count > 0 ? trees.slice(0, 5).map(t => `- **${t.treeName}** (Planted by ${t.volunteerName})`).join("\n") : "Be the first to plant a virtual tree!") +
        "\nExplore upcoming schedules and plant saplings in the Vriksha Setu tab.";
    }

    if (/\b(animal|dog|cat|rescue|vet|stray|pashu|pet|adopt)\b/i.test(msg)) {
      const reported = rescues.filter(r => r.status === "reported");
      if (reported.length > 0) {
        return `🐾 Injured stray animals reported (pending rescue):\n` +
          reported.map(r => `- **${r.animalType}** with "${r.injuryDetails}" at ${r.location}`).join("\n") +
          "\nVolunteers can dispatch to rescue locations in the Pashu Setu tab!";
      }
      return "🐾 No stray animal injuries reported. Report strays, adopt pets, or view vet clinics in the Pashu Setu tab!";
    }

    if (/\b(fund|money|crowdfund|campaign|donate|rs|rupees|contribute)\b/i.test(msg)) {
      if (crowd.length > 0) {
        return `🪙 Active Crowdfunding Campaigns (100% transparent):\n` +
          crowd.map(c => `- **${c.title}**: Raised ₹${c.currentAmount} of ₹${c.targetAmount} (${Math.round((c.currentAmount/c.targetAmount)*100)}%)`).join("\n") +
          "\nDonate to verified campaigns and download 80G tax receipts in the Crowdfund tab!";
      }
      return "🪙 No active crowdfunding campaigns at the moment. NGOs can launch campaigns in the Crowdfund tab.";
    }

    if (/\b(reward|point|store|voucher|discount|swiggy|zepto|ticket|coupon)\b/i.test(msg)) {
      return "🎁 Earning & Redeeming Points on SevaSetu:\n" +
        "- **Earn Points**: By claiming food pickups (+30 Pts), participating in cleanup drives (+50 Pts), teaching (+40 Pts), assisting seniors (+50 Pts), rescuing animals (+40 Pts), or donating money (+10 Pts per ₹100).\n" +
        "- **Redeem Vouchers**: Visit the *Rewards* tab to redeem points for Zepto, Swiggy, or BookMyShow discounts!";
    }

    if (/\b(who am i|my account|role|profile|points)\b/i.test(msg)) {
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

    return "🤖 Please ask a question related to SevaSetu civic modules or our community database!";
  };

  const handleSendMessage = async (e) => {
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

    // 1. Try Gemini API first (RAG)
    let replyText = await fetchGeminiResponse(userMsg.text);

    // 2. Fall back to local regex matching engine if no API Key or fetch error
    if (!replyText) {
      replyText = generateLocalResponse(userMsg.text);
    }

    const botMsg = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: replyText
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div id="sevasetu-chatbot" className={isOpen ? "open" : ""}>
      {/* 3D WebGL Floating/Transitioning Robot Canvas Container */}
      <div 
        className={`chatbot-avatar-canvas-container ${isOpen ? "in-window" : ""}`}
        onClick={() => { if (!isOpen) setIsOpen(true); }}
        title="Chat with SevaBuddy"
      >
        <canvas ref={canvasRef} className="chatbot-avatar-canvas" />
      </div>
      {!isOpen && <div className="chatbot-avatar-shadow"></div>}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>SevaBuddy</h4>
              <span style={{ fontSize: "10px", opacity: 0.8 }}>Live Civic Assistant</span>
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
              onChange={e => setInputText(e.target.value)}
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
