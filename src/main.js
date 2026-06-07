import './css/style.css';
import { DBService } from './js/db-service.js';
import { isConfigValid } from './js/firebase-config.js';

// --- Toast Notifications ---
function showToast(message, isError = false) {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "toast-error" : ""}`;
  
  const icon = document.createElement("i");
  icon.className = isError ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check";
  icon.style.color = isError ? "var(--color-danger)" : "var(--color-emerald-light)";
  
  const text = document.createElement("span");
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);
  root.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.style.animation = "slideInToast 0.3s ease-out reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Global DOM Cache ---
const DOM = {
  // Navigation
  navDashboard: document.getElementById("nav-dashboard"),
  navFoodWaste: document.getElementById("nav-food-waste"),
  navCleanupDrives: document.getElementById("nav-cleanup-drives"),
  navNgoAdmin: document.getElementById("nav-ngo-admin"),
  navRewardsStore: document.getElementById("nav-rewards-store"),

  // Panels
  panelDashboard: document.getElementById("panel-dashboard"),
  panelFoodWaste: document.getElementById("panel-food-waste"),
  panelCleanupDrives: document.getElementById("panel-cleanup-drives"),
  panelNgoAdmin: document.getElementById("panel-ngo-admin"),
  panelRewardsStore: document.getElementById("panel-rewards-store"),

  // Header Titles
  mainTitle: document.getElementById("main-view-title"),
  mainSubtitle: document.getElementById("main-view-subtitle"),

  // Auth Elements
  authLoggedOut: document.getElementById("auth-logged-out-actions"),
  authLoggedIn: document.getElementById("auth-logged-in-actions"),
  sidebarProfile: document.getElementById("sidebar-profile-box"),
  sidebarUserName: document.getElementById("sidebar-user-name"),
  sidebarUserRole: document.getElementById("sidebar-user-role"),
  sidebarUserPoints: document.getElementById("sidebar-user-points"),
  sidebarUserAvatar: document.getElementById("sidebar-user-avatar"),

  // Modals
  modalAuth: document.getElementById("modal-auth"),
  modalDriveCreate: document.getElementById("modal-drive-create"),
  modalProofSubmit: document.getElementById("modal-proof-submit"),
  modalFoodComplete: document.getElementById("modal-food-complete"),

  // Indicators
  demoIndicatorText: document.getElementById("demo-indicator-text")
};

// --- Page / Route Router ---
function switchView(viewName) {
  // 1. Remove active state from nav buttons
  const navItems = [DOM.navDashboard, DOM.navFoodWaste, DOM.navCleanupDrives, DOM.navNgoAdmin, DOM.navRewardsStore];
  navItems.forEach(item => item.classList.remove("active"));

  // 2. Hide all panels
  const panels = [DOM.panelDashboard, DOM.panelFoodWaste, DOM.panelCleanupDrives, DOM.panelNgoAdmin, DOM.panelRewardsStore];
  panels.forEach(panel => panel.classList.remove("active"));

  // 3. Show target view and make nav button active
  let currentTitle = "Welcome to SevaSetu";
  let currentSubtitle = "Connecting hands. Feeding souls. Cleaning streets.";

  switch (viewName) {
    case "dashboard":
      DOM.navDashboard.classList.add("active");
      DOM.panelDashboard.classList.add("active");
      currentTitle = "SevaSetu Dashboard";
      currentSubtitle = "Overview of community impact, top volunteers, and local contributions.";
      renderDashboard();
      break;
    case "food-waste":
      DOM.navFoodWaste.classList.add("active");
      DOM.panelFoodWaste.classList.add("active");
      currentTitle = "Ahaar Setu";
      currentSubtitle = "Surplus food redistribution from restaurants to volunteer networks.";
      renderFoodWaste();
      break;
    case "cleanup-drives":
      DOM.navCleanupDrives.classList.add("active");
      DOM.panelCleanupDrives.classList.add("active");
      currentTitle = "Swachh Setu";
      currentSubtitle = "Cleanliness drives, street sweeps, and public hygiene community projects.";
      renderCleanupDrives();
      break;
    case "ngo-admin":
      DOM.navNgoAdmin.classList.add("active");
      DOM.panelNgoAdmin.classList.add("active");
      const user = DBService.getCurrentUser();
      if (user && user.role === "ngo") {
        currentTitle = "Sahaayak Setu — NGO Dashboard";
        currentSubtitle = "Approve volunteer work submissions, manage drives, and view roster.";
      } else {
        currentTitle = "Sahaayak Setu";
        currentSubtitle = "Explore registered NGOs, review profiles, and join their volunteer networks.";
      }
      renderNGOAdmin();
      break;
    case "rewards-store":
      DOM.navRewardsStore.classList.add("active");
      DOM.panelRewardsStore.classList.add("active");
      currentTitle = "Seva Rewards Store";
      currentSubtitle = "Redeem volunteer points for gift coupons and delivery codes.";
      renderRewardsStore();
      break;
  }

  DOM.mainTitle.textContent = currentTitle;
  DOM.mainSubtitle.textContent = currentSubtitle;
}

// Set up Navigation Event Handlers
function initNavigation() {
  DOM.navDashboard.addEventListener("click", () => switchView("dashboard"));
  DOM.navFoodWaste.addEventListener("click", () => switchView("food-waste"));
  DOM.navCleanupDrives.addEventListener("click", () => switchView("cleanup-drives"));
  DOM.navNgoAdmin.addEventListener("click", () => switchView("ngo-admin"));
  DOM.navRewardsStore.addEventListener("click", () => switchView("rewards-store"));
}

// --- Auth UI Management ---
function updateAuthUI(user) {
  if (user) {
    // Logged In State
    DOM.authLoggedOut.style.display = "none";
    DOM.authLoggedIn.style.display = "flex";
    DOM.sidebarProfile.classList.remove("hidden");

    DOM.sidebarUserName.textContent = user.name;
    DOM.sidebarUserRole.textContent = user.role;
    DOM.sidebarUserAvatar.textContent = user.name.charAt(0).toUpperCase();

    // Show points if Volunteer or Restaurant
    if (user.role === "volunteer") {
      DOM.sidebarUserPoints.textContent = `${user.rewardPoints || 0} Points`;
      document.getElementById("sidebar-points-container").style.backgroundColor = "rgba(249, 115, 22, 0.15)";
      document.getElementById("sidebar-points-container").style.color = "var(--color-orange-light)";
      document.getElementById("sidebar-points-container").style.display = "flex";
    } else if (user.role === "restaurant") {
      DOM.sidebarUserPoints.textContent = `${user.sevaPoints || 0} Seva Points`;
      document.getElementById("sidebar-points-container").style.backgroundColor = "rgba(13, 148, 136, 0.15)";
      document.getElementById("sidebar-points-container").style.color = "var(--color-emerald-light)";
      document.getElementById("sidebar-points-container").style.display = "flex";
    } else {
      // NGOs don't have points
      document.getElementById("sidebar-points-container").style.display = "none";
    }

    // Module-specific visibility triggers
    if (user.role === "ngo") {
      document.getElementById("btn-drive-create-open").style.display = "inline-flex";
    } else {
      document.getElementById("btn-drive-create-open").style.display = "none";
    }

    if (user.role === "restaurant") {
      document.getElementById("form-food-post").style.display = "block";
      document.getElementById("food-post-guest-warning").style.display = "none";
    } else {
      document.getElementById("form-food-post").style.display = "none";
      document.getElementById("food-post-guest-warning").style.display = "block";
    }

    if (user.role === "volunteer") {
      document.getElementById("tab-food-mine").style.display = "block";
    } else {
      document.getElementById("tab-food-mine").style.display = "none";
    }
  } else {
    // Logged Out State
    DOM.authLoggedOut.style.display = "flex";
    DOM.authLoggedIn.style.display = "none";
    DOM.sidebarProfile.classList.add("hidden");
    document.getElementById("btn-drive-create-open").style.display = "none";
    document.getElementById("form-food-post").style.display = "none";
    document.getElementById("food-post-guest-warning").style.display = "block";
    document.getElementById("tab-food-mine").style.display = "none";
  }

  // Refresh whatever panel is active to update role buttons
  const activePanel = document.querySelector(".module-panel.active");
  if (activePanel) {
    const id = activePanel.id;
    if (id === "panel-dashboard") renderDashboard();
    else if (id === "panel-food-waste") renderFoodWaste();
    else if (id === "panel-cleanup-drives") renderCleanupDrives();
    else if (id === "panel-ngo-admin") renderNGOAdmin();
    else if (id === "panel-rewards-store") renderRewardsStore();
  }
}

function initAuthHandlers() {
  const btnLoginOpen = document.getElementById("btn-login-open");
  const btnRegisterOpen = document.getElementById("btn-register-open");
  const btnAuthClose = document.getElementById("btn-auth-close");
  const btnLogout = document.getElementById("btn-logout");

  const tabLogin = document.getElementById("auth-tab-login");
  const tabRegister = document.getElementById("auth-tab-register");
  
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const selectRole = document.getElementById("register-role");

  // Open / Close Auth Modal
  btnLoginOpen.addEventListener("click", () => {
    DOM.modalAuth.classList.add("active");
    tabLogin.click();
  });
  btnRegisterOpen.addEventListener("click", () => {
    DOM.modalAuth.classList.add("active");
    tabRegister.click();
  });
  btnAuthClose.addEventListener("click", () => DOM.modalAuth.classList.remove("active"));

  // Modal tab toggle
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    formLogin.style.display = "block";
    formRegister.style.display = "none";
    document.getElementById("auth-modal-title").textContent = "Sign In";
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    formRegister.style.display = "block";
    formLogin.style.display = "none";
    document.getElementById("auth-modal-title").textContent = "Create Account";
  });

  // Handle role specific dropdown views
  selectRole.addEventListener("change", () => {
    const role = selectRole.value;
    document.getElementById("register-restaurant-fields").style.display = role === "restaurant" ? "block" : "none";
    document.getElementById("register-ngo-fields").style.display = role === "ngo" ? "block" : "none";
  });

  // Login Submit
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;
    try {
      const user = await DBService.login(email, pass);
      showToast(`Welcome back, ${user.name}!`);
      DOM.modalAuth.classList.remove("active");
      formLogin.reset();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Register Submit
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const pass = document.getElementById("register-password").value;
    const role = selectRole.value;

    let extraInfo = {};
    if (role === "restaurant") {
      extraInfo.address = document.getElementById("register-address").value;
    } else if (role === "ngo") {
      extraInfo.description = document.getElementById("register-description").value;
    }

    try {
      const user = await DBService.register(name, email, pass, role, extraInfo);
      showToast(`Account created successfully! Welcome ${user.name}`);
      DOM.modalAuth.classList.remove("active");
      formRegister.reset();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Logout Submit
  btnLogout.addEventListener("click", async () => {
    await DBService.logout();
    showToast("Logged out successfully.");
    switchView("dashboard");
  });
}

// --- MODULE 1: Food Waste (Ahaar Setu) Logic ---
let activeFoodTab = "all";

async function renderFoodWaste() {
  const user = DBService.getCurrentUser();
  const form = document.getElementById("form-food-post");
  const container = document.getElementById("food-list-container");
  
  if (!container) return;
  container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px;"></i><p>Loading food listings...</p></div>`;

  try {
    const allPickups = await DBService.getFoodPickups();
    container.innerHTML = "";

    let filtered = allPickups;
    if (activeFoodTab === "mine" && user) {
      filtered = allPickups.filter(p => p.claimedBy === user.uid);
    } else {
      // Filter out non-pending for general view unless claimed by user
      filtered = allPickups.filter(p => p.status === "pending" || (user && p.claimedBy === user.uid));
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);"><i class="fa-solid fa-bowl-food" style="font-size: 40px; margin-bottom: 16px;"></i><p>No active food pickups found.</p></div>`;
      return;
    }

    filtered.forEach(p => {
      const isExpired = new Date(p.expiryTime) < new Date();
      const card = document.createElement("div");
      card.className = `card pickup-card ${p.status === 'completed' ? 'card-emerald' : p.status === 'claimed' ? 'card-purple' : 'card-orange'}`;

      let actionBtn = "";
      if (p.status === "pending") {
        if (!user) {
          actionBtn = `<button class="btn btn-outline btn-login-trigger" style="margin-top: auto;">Log in to Claim</button>`;
        } else if (user.role === "volunteer") {
          actionBtn = `<button class="btn btn-primary btn-claim-pickup" data-id="${p.id}" style="margin-top: auto;"><i class="fa-solid fa-handshake"></i> Claim Pickup</button>`;
        }
      } else if (p.status === "claimed" && user && p.claimedBy === user.uid) {
        actionBtn = `<button class="btn btn-orange btn-complete-pickup" data-id="${p.id}" style="margin-top: auto;"><i class="fa-solid fa-circle-check"></i> Complete Distribution</button>`;
      }

      const statusBadge = `<span class="badge ${p.status === 'completed' ? 'badge-completed' : p.status === 'claimed' ? 'badge-claimed' : 'badge-pending'}">${p.status}</span>`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
          <h4 style="font-size: 16px; font-weight: 700;">${p.foodType}</h4>
          ${statusBadge}
        </div>
        <div class="pickup-details">
          <div class="pickup-details-row">
            <i class="fa-solid fa-shop"></i>
            <span><strong>Restaurant:</strong> ${p.restaurantName}</span>
          </div>
          <div class="pickup-details-row">
            <i class="fa-solid fa-weight-hanging"></i>
            <span><strong>Quantity:</strong> ${p.quantity}</span>
          </div>
          <div class="pickup-details-row">
            <i class="fa-solid fa-clock"></i>
            <span style="${isExpired && p.status === 'pending' ? 'color: var(--color-danger); font-weight: 600;' : ''}">
              <strong>Expiry:</strong> ${new Date(p.expiryTime).toLocaleString()} ${isExpired && p.status === 'pending' ? '(Expired)' : ''}
            </span>
          </div>
          <div class="pickup-details-row">
            <i class="fa-solid fa-location-dot"></i>
            <span><strong>Location:</strong> ${p.location}</span>
          </div>
          ${p.feedback ? `
            <div class="pickup-details-row" style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: var(--border-radius-sm); border: 1px dashed var(--border-color);">
              <span><i class="fa-solid fa-comment" style="color: var(--color-emerald-light);"></i> <em>"${p.feedback}"</em></span>
            </div>
          ` : ""}
        </div>
        ${actionBtn}
      `;

      container.appendChild(card);
    });

    // Attach card event listeners
    container.querySelectorAll(".btn-login-trigger").forEach(btn => {
      btn.addEventListener("click", () => DOM.modalAuth.classList.add("active"));
    });

    container.querySelectorAll(".btn-claim-pickup").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("button").dataset.id;
        try {
          await DBService.claimFoodPickup(id);
          showToast("Pickup claimed! Proceed to coordinates.");
          renderFoodWaste();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });

    container.querySelectorAll(".btn-complete-pickup").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("button").dataset.id;
        document.getElementById("complete-pickup-id").value = id;
        DOM.modalFoodComplete.classList.add("active");
      });
    });

  } catch (err) {
    showToast("Failed to fetch food details.", true);
  }
}

function initFoodWasteHandlers() {
  const formFoodPost = document.getElementById("form-food-post");
  const tabFoodAll = document.getElementById("tab-food-all");
  const tabFoodMine = document.getElementById("tab-food-mine");
  const formFoodComplete = document.getElementById("form-food-complete");
  const btnFoodCompleteClose = document.getElementById("btn-food-complete-close");

  formFoodPost.addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("input-food-type").value;
    const qty = document.getElementById("input-food-quantity").value;
    const expiry = document.getElementById("input-food-expiry").value;
    const addr = document.getElementById("input-food-address").value;

    try {
      await DBService.createFoodPickup(type, qty, new Date(expiry).toISOString(), addr);
      showToast("Surplus food posted successfully. Notification sent to local volunteers!");
      formFoodPost.reset();
      renderFoodWaste();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  tabFoodAll.addEventListener("click", () => {
    tabFoodAll.classList.add("active");
    tabFoodMine.classList.remove("active");
    activeFoodTab = "all";
    renderFoodWaste();
  });

  tabFoodMine.addEventListener("click", () => {
    tabFoodMine.classList.add("active");
    tabFoodAll.classList.remove("active");
    activeFoodTab = "mine";
    renderFoodWaste();
  });

  btnFoodCompleteClose.addEventListener("click", () => DOM.modalFoodComplete.classList.remove("active"));

  formFoodComplete.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("complete-pickup-id").value;
    const feedback = document.getElementById("complete-feedback").value;

    try {
      await DBService.completeFoodPickup(id, feedback);
      showToast("Distribution recorded. Points added to your profile!");
      DOM.modalFoodComplete.classList.remove("active");
      formFoodComplete.reset();
      // Sync auth sidebar numbers
      updateAuthUI(DBService.getCurrentUser());
      renderFoodWaste();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

// --- MODULE 2: Swachh Drives (Swachh Setu) Logic ---
async function renderCleanupDrives() {
  const user = DBService.getCurrentUser();
  const container = document.getElementById("drives-list-container");
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px;"></i><p>Loading cleanup events...</p></div>`;

  try {
    const drives = await DBService.getCleanupDrives();
    container.innerHTML = "";

    if (drives.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);"><i class="fa-solid fa-broom" style="font-size: 40px; margin-bottom: 16px;"></i><p>No active cleanup campaigns scheduled.</p></div>`;
      return;
    }

    drives.forEach(d => {
      const hasJoined = user && d.participants.includes(user.uid);
      const isOrganizer = user && d.organizerId === user.uid;
      const hasSubmittedProof = user && d.proofs.some(p => p.volunteerId === user.uid);
      const isApproved = user && d.proofs.some(p => p.volunteerId === user.uid && p.approved);

      const card = document.createElement("div");
      card.className = "card drive-card card-purple";

      let actionBtn = "";
      if (!user) {
        actionBtn = `<button class="btn btn-outline btn-login-trigger" style="width: 100%; margin-top: 15px;">Log in to Join</button>`;
      } else if (user.role === "volunteer") {
        if (!hasJoined) {
          actionBtn = `<button class="btn btn-primary btn-join-drive" data-id="${d.id}" style="width: 100%; margin-top: 15px;"><i class="fa-solid fa-hand-fist"></i> Join Drive</button>`;
        } else {
          if (isApproved) {
            actionBtn = `<button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" disabled><i class="fa-solid fa-award"></i> Verification Approved (+${d.pointsReward} Pts)</button>`;
          } else if (hasSubmittedProof) {
            actionBtn = `<button class="btn btn-secondary" style="width: 100%; margin-top: 15px;" disabled><i class="fa-solid fa-clock"></i> Proof Awaiting NGO Review</button>`;
          } else {
            actionBtn = `<button class="btn btn-orange btn-submit-proof-trigger" data-id="${d.id}" style="width: 100%; margin-top: 15px;"><i class="fa-solid fa-camera"></i> Upload Completion Proof</button>`;
          }
        }
      } else if (isOrganizer) {
        actionBtn = `<button class="btn btn-outline" style="width: 100%; margin-top: 15px;" onclick="document.getElementById('nav-ngo-admin').click()"><i class="fa-solid fa-sliders"></i> Go to Admin Console</button>`;
      }

      // Draw random participant avatars
      let avatarsHTML = "";
      const count = d.participants.length;
      if (count > 0) {
        avatarsHTML = `
          <div class="drive-participants-row">
            <div class="participant-dots">
              ${d.participants.slice(0, 3).map((p, idx) => `<div class="participant-dot">${idx + 1}</div>`).join("")}
              ${count > 3 ? `<div class="participant-dot">+${count - 3}</div>` : ""}
            </div>
            <span style="font-size: 12px; color: var(--color-text-secondary);">${count} volunteers registered</span>
          </div>
        `;
      } else {
        avatarsHTML = `
          <div class="drive-participants-row">
            <span style="font-size: 12px; color: var(--color-text-muted);">No volunteers registered yet</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="drive-banner">
          <i class="fa-solid fa-broom"></i>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
          <h4 style="font-size: 18px; font-weight: 700;">${d.title}</h4>
          <span class="user-points-badge" style="background: rgba(139, 92, 246, 0.15); color: var(--color-purple-light); border-color: rgba(139, 92, 246, 0.3); font-size: 11px;">
            +${d.pointsReward} Points
          </span>
        </div>
        <p style="color: var(--color-text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.5; flex-grow: 1;">${d.description}</p>
        <div class="pickup-details" style="margin-bottom: 15px;">
          <div class="pickup-details-row">
            <i class="fa-solid fa-calendar-day"></i>
            <span><strong>Date:</strong> ${d.date} at ${d.time}</span>
          </div>
          <div class="pickup-details-row">
            <i class="fa-solid fa-map-location-dot"></i>
            <span><strong>Location:</strong> ${d.location}</span>
          </div>
          <div class="pickup-details-row">
            <i class="fa-solid fa-hands-holding-child"></i>
            <span><strong>Organizer:</strong> ${d.organizerName}</span>
          </div>
        </div>
        ${avatarsHTML}
        ${actionBtn}
      `;

      container.appendChild(card);
    });

    // Bind event listeners
    container.querySelectorAll(".btn-login-trigger").forEach(btn => {
      btn.addEventListener("click", () => DOM.modalAuth.classList.add("active"));
    });

    container.querySelectorAll(".btn-join-drive").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("button").dataset.id;
        try {
          await DBService.joinCleanupDrive(id);
          showToast("Joined campaign roster successfully!");
          renderCleanupDrives();
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });

    container.querySelectorAll(".btn-submit-proof-trigger").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("button").dataset.id;
        document.getElementById("proof-drive-id").value = id;
        DOM.modalProofSubmit.classList.add("active");
      });
    });

  } catch (err) {
    showToast("Failed to fetch cleanups roster.", true);
  }
}

function initCleanupHandlers() {
  const btnDriveCreateOpen = document.getElementById("btn-drive-create-open");
  const btnDriveClose = document.getElementById("btn-drive-close");
  const formDriveCreate = document.getElementById("form-drive-create");
  
  const btnProofClose = document.getElementById("btn-proof-close");
  const formProofSubmit = document.getElementById("form-proof-submit");

  // Create modal triggers
  btnDriveCreateOpen.addEventListener("click", () => DOM.modalDriveCreate.classList.add("active"));
  btnDriveClose.addEventListener("click", () => DOM.modalDriveCreate.classList.remove("active"));

  formDriveCreate.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("drive-title").value;
    const desc = document.getElementById("drive-description").value;
    const date = document.getElementById("drive-date").value;
    const time = document.getElementById("drive-time").value;
    const loc = document.getElementById("drive-location").value;
    const points = document.getElementById("drive-points").value;

    try {
      await DBService.createCleanupDrive(title, desc, date, time, loc, points);
      showToast("Cleanup campaign announced! Live in public feed.");
      DOM.modalDriveCreate.classList.remove("active");
      formDriveCreate.reset();
      renderCleanupDrives();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Proof modal triggers
  btnProofClose.addEventListener("click", () => DOM.modalProofSubmit.classList.remove("active"));

  formProofSubmit.addEventListener("submit", async (e) => {
    e.preventDefault();
    const driveId = document.getElementById("proof-drive-id").value;
    const imgUrl = document.getElementById("proof-image-url").value;

    try {
      await DBService.submitDriveProof(driveId, imgUrl);
      showToast("Proof submission registered. Points will update upon NGO coordinator verification!");
      DOM.modalProofSubmit.classList.remove("active");
      formProofSubmit.reset();
      renderCleanupDrives();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

// --- MODULE 3: NGO & Volunteer Admin (Sahaayak Setu) Logic ---
async function renderNGOAdmin() {
  const user = DBService.getCurrentUser();
  const citizenView = document.getElementById("ngo-citizen-view");
  const dashboardView = document.getElementById("ngo-dashboard-view");

  if (!citizenView || !dashboardView) return;

  if (user && user.role === "ngo") {
    // NGO Coordinator View
    citizenView.style.display = "none";
    dashboardView.style.display = "block";
    DOM.sidebarUserRole.textContent = "NGO Administrator";
    document.getElementById("ngo-dashboard-title").textContent = `Managing ${user.name}`;
    
    // Load roster and proofs
    renderNGORoster(user.uid);
    renderNGOPendingProofs(user.uid);
  } else {
    // Citizen View (Lists all NGOs so volunteer can register/join)
    citizenView.style.display = "block";
    dashboardView.style.display = "none";
    
    const container = document.getElementById("ngo-directory-container");
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px;"></i><p>Loading partner directory...</p></div>`;

    try {
      const ngos = await DBService.getNGOs();
      container.innerHTML = "";

      if (ngos.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);"><p>No active NGOs registered currently.</p></div>`;
        return;
      }

      ngos.forEach(n => {
        const isMember = user && user.ngoId === n.uid;
        const card = document.createElement("div");
        card.className = `card ngo-card ${isMember ? 'card-purple' : ''}`;
        
        let joinBtn = "";
        if (!user) {
          joinBtn = `<button class="btn btn-outline btn-login-trigger" style="width: 100%;">Login to Register</button>`;
        } else if (user.role === "volunteer") {
          if (isMember) {
            joinBtn = `<button class="btn btn-secondary" style="width: 100%;" disabled><i class="fa-solid fa-circle-check"></i> Registered Member</button>`;
          } else {
            joinBtn = `<button class="btn btn-primary btn-join-ngo" data-id="${n.uid}" style="width: 100%;"><i class="fa-solid fa-user-plus"></i> Join NGO Network</button>`;
          }
        }

        card.innerHTML = `
          <div class="ngo-card-body">
            <div style="display: flex; gap: 16px; align-items: center;">
              <div class="user-avatar" style="border-color: var(--color-purple); color: var(--color-purple-light); font-size: 18px; width: 44px; height: 44px;">${n.name.charAt(0).toUpperCase()}</div>
              <div>
                <h4 style="font-size: 16px; font-weight: 700;">${n.name}</h4>
                <span style="font-size: 11px; color: var(--color-text-muted);"><i class="fa-solid fa-users"></i> ${n.volunteers ? n.volunteers.length : 0} members</span>
              </div>
            </div>
            <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; flex-grow: 1;">${n.description || "Dedicated to social works and community improvement programs."}</p>
            ${joinBtn}
          </div>
        `;
        container.appendChild(card);
      });

      // Bind buttons
      container.querySelectorAll(".btn-login-trigger").forEach(btn => {
        btn.addEventListener("click", () => DOM.modalAuth.classList.add("active"));
      });
      container.querySelectorAll(".btn-join-ngo").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const ngoId = e.target.closest("button").dataset.id;
          try {
            await DBService.joinNGO(ngoId);
            showToast("Successfully registered with NGO! You can now join their drives.");
            // Sync UI
            updateAuthUI(DBService.getCurrentUser());
            renderNGOAdmin();
          } catch (err) {
            showToast(err.message, true);
          }
        });
      });

    } catch (err) {
      showToast("NGO Directory load error.", true);
    }
  }
}

async function renderNGORoster(ngoId) {
  const container = document.getElementById("ngo-volunteers-list");
  if (!container) return;

  container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px;">Fetching volunteer roster...</p>`;

  try {
    // We can fetch all users and filter locally for simplicity in mock
    let allUsers = [];
    if (isConfigValid) {
      // In live Firebase, query users matching volunteer role and this ngoId
      const q = query(collection(db, "users"), where("role", "==", "volunteer"), where("ngoId", "==", ngoId));
      const snap = await getDocs(q);
      allUsers = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      allUsers = users.filter(u => u.role === "volunteer" && u.ngoId === ngoId);
    }

    container.innerHTML = "";
    if (allUsers.length === 0) {
      container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px; font-style: italic;">No volunteers registered to your NGO yet.</p>`;
      return;
    }

    allUsers.forEach((u, idx) => {
      const item = document.createElement("div");
      item.className = "leaderboard-item";
      item.innerHTML = `
        <div class="leaderboard-item-info">
          <span class="leaderboard-rank">${idx + 1}</span>
          <div class="user-avatar" style="width: 30px; height: 30px; font-size: 12px; border-color: var(--color-purple); color: var(--color-purple-light);">${u.name.charAt(0).toUpperCase()}</div>
          <div>
            <h5 style="font-size: 13px; font-weight: 600;">${u.name}</h5>
            <span style="font-size: 10px; color: var(--color-text-muted);">${u.impactHours || 0} hrs • ${u.completedCount || 0} tasks completed</span>
          </div>
        </div>
        <span class="leaderboard-points" style="font-size: 12px; font-weight: 600;">${u.rewardPoints || 0} Pts</span>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `<p style="color: var(--color-danger); text-align: center;">Failed to load roster.</p>`;
  }
}

async function renderNGOPendingProofs(ngoId) {
  const container = document.getElementById("ngo-proofs-list");
  if (!container) return;

  container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px;">Fetching proof approvals...</p>`;

  try {
    const drives = await DBService.getCleanupDrives();
    // Filter drives organized by this NGO that have pending proofs
    const ngoDrives = drives.filter(d => d.organizerId === ngoId);
    
    container.innerHTML = "";
    let hasProofs = false;

    ngoDrives.forEach(d => {
      const pending = d.proofs.filter(p => !p.approved);
      if (pending.length > 0) {
        hasProofs = true;
        pending.forEach(p => {
          const item = document.createElement("div");
          item.className = "leaderboard-item";
          item.style.flexDirection = "column";
          item.style.alignItems = "stretch";
          item.style.gap = "10px";

          item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="user-avatar" style="width:28px; height:28px; font-size:11px;">${p.volunteerName.charAt(0)}</div>
                <div>
                  <h5 style="font-size:13px; font-weight:600;">${p.volunteerName}</h5>
                  <span style="font-size:10px; color:var(--color-text-secondary);">Campaign: <strong>${d.title}</strong></span>
                </div>
              </div>
              <span class="badge badge-pending">+${d.pointsReward} Pts</span>
            </div>
            
            <div style="width:100%; border-radius: var(--border-radius-sm); overflow:hidden; border: 1px solid var(--border-color); height:120px; position:relative;">
              <img src="${p.imageUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300'" />
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-outline btn-approve-proof" data-drive="${d.id}" data-volunteer="${p.volunteerId}" style="padding: 6px 12px; font-size: 12px;">
                <i class="fa-solid fa-check"></i> Approve & Award
              </button>
            </div>
          `;
          container.appendChild(item);
        });
      }
    });

    if (!hasProofs) {
      container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px; font-style: italic;">No pending completion proofs to review.</p>`;
      return;
    }

    // Bind Approve buttons
    container.querySelectorAll(".btn-approve-proof").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const trigger = e.target.closest("button");
        const driveId = trigger.dataset.drive;
        const volId = trigger.dataset.volunteer;
        try {
          await DBService.approveDriveProof(driveId, volId);
          showToast("Proof approved and points credited to volunteer!");
          renderNGOPendingProofs(ngoId);
          renderNGORoster(ngoId);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<p style="color: var(--color-danger); text-align: center;">Failed to load proofs.</p>`;
  }
}

// --- MODULE 4: Rewards Store Logic ---
async function renderRewardsStore() {
  const user = DBService.getCurrentUser();
  const container = document.getElementById("vouchers-list-container");
  const balanceText = document.getElementById("rewards-points-text");
  
  if (!container) return;
  
  // Set User Balance Header
  if (user && user.role === "volunteer") {
    balanceText.textContent = `${user.rewardPoints || 0} Points Available`;
  } else {
    balanceText.textContent = `Login as Volunteer to Claim`;
  }

  container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary); padding: 40px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px;"></i><p>Loading rewards shelf...</p></div>`;

  try {
    const vouchers = await DBService.getVouchers();
    container.innerHTML = "";

    vouchers.forEach(v => {
      const card = document.createElement("div");
      card.className = "card voucher-card card-orange";

      let redeemBtn = "";
      if (!user) {
        redeemBtn = `<button class="btn btn-outline btn-login-trigger" style="width: 100%;">Log in to Claim</button>`;
      } else if (user.role === "volunteer") {
        const hasPoints = (user.rewardPoints || 0) >= v.pointsCost;
        redeemBtn = `<button class="btn btn-orange btn-redeem-voucher" data-id="${v.id}" style="width: 100%;" ${!hasPoints ? 'disabled' : ''}>
          ${hasPoints ? '<i class="fa-solid fa-basket-shopping"></i> Claim Voucher' : 'Insufficient Points'}
        </button>`;
      } else {
        redeemBtn = `<button class="btn btn-secondary" style="width: 100%;" disabled>Volunteers Only</button>`;
      }

      card.innerHTML = `
        <img src="${v.image}" class="voucher-logo" alt="${v.partner} logo" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'" />
        <h4 style="font-size: 16px; font-weight: 700; color: white; margin-top: 4px;">${v.partner}</h4>
        <span style="font-size: 13px; color: var(--color-text-secondary); font-weight: 500; height: 36px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${v.title}</span>
        <span class="voucher-cost">${v.pointsCost} Points</span>
        <p style="font-size: 11px; color: var(--color-text-muted); line-height: 1.4;">${v.description}</p>
        ${redeemBtn}
      `;

      container.appendChild(card);
    });

    // Bind triggers
    container.querySelectorAll(".btn-login-trigger").forEach(btn => {
      btn.addEventListener("click", () => DOM.modalAuth.classList.add("active"));
    });

    container.querySelectorAll(".btn-redeem-voucher").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("button").dataset.id;
        if (confirm("Are you sure you want to redeem your points for this voucher?")) {
          try {
            const code = await DBService.redeemVoucher(id);
            alert(`SUCCESS!\nYou claimed the coupon code:\n\n👉  ${code}  👈\n\nSave this code and enter it on the partner app at checkout. This code is also saved in your claimed history below.`);
            // Sync user points
            updateAuthUI(DBService.getCurrentUser());
            renderRewardsStore();
          } catch (err) {
            showToast(err.message, true);
          }
        }
      });
    });

    // Render Claimed History
    renderClaimedVouchersHistory();

  } catch (err) {
    showToast("Failed to fetch vouchers.", true);
  }
}

async function renderClaimedVouchersHistory() {
  const container = document.getElementById("claimed-vouchers-container");
  if (!container) return;

  const user = DBService.getCurrentUser();
  if (!user || user.role !== "volunteer") {
    container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px; font-style: italic;">Log in to view your claiming history.</p>`;
    return;
  }

  container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 10px;">Loading history...</p>`;

  try {
    const claims = await DBService.getClaimedVouchers();
    container.innerHTML = "";

    if (claims.length === 0) {
      container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px; font-style: italic;">You haven't claimed any vouchers yet. Do volunteering work to earn points!</p>`;
      return;
    }

    claims.forEach(c => {
      const item = document.createElement("div");
      item.className = "leaderboard-item";
      item.innerHTML = `
        <div class="leaderboard-item-info">
          <div class="user-avatar" style="width:34px; height:34px; border-color: var(--color-orange); color: var(--color-orange-light); font-size:12px; font-weight:700;">
            ${c.partner.charAt(0)}
          </div>
          <div>
            <h5 style="font-size:13px; font-weight:600; color:white;">${c.partner} - ${c.voucherTitle}</h5>
            <span style="font-size:10px; color:var(--color-text-secondary);">Redeemed on ${new Date(c.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display:block; font-family:var(--font-heading); font-size: 14px; font-weight: 700; color: var(--color-orange-light); border: 1px dashed rgba(249, 115, 22, 0.4); padding: 4px 10px; border-radius: var(--border-radius-sm); background: rgba(249, 115, 22, 0.05); user-select: all; cursor: copy;">
            ${c.code}
          </span>
        </div>
      `;
      container.appendChild(item);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: var(--color-danger); text-align: center;">Failed to load history.</p>`;
  }
}

// --- MODULE 5: Dashboard Overview & Leaderboard Logic ---
let activeLeaderboardTab = "volunteers";

async function renderDashboard() {
  const statMeals = document.getElementById("stat-meals");
  const statDrives = document.getElementById("stat-drives");
  const statVolunteers = document.getElementById("stat-volunteers");
  const leaderboardContainer = document.getElementById("leaderboard-list-container");

  try {
    // 1. Calculate and render active stats totals
    const pickups = await DBService.getFoodPickups();
    const completedMeals = pickups
      .filter(p => p.status === "completed")
      .length * 15; // Assume 15 meals average per package

    const drives = await DBService.getCleanupDrives();
    const totalDrives = drives.length;

    let totalVolsCount = 50; // Base seeded volunteers count
    if (isConfigValid) {
      const snap = await getDocs(collection(db, "users"));
      const vols = snap.docs.filter(d => d.data().role === "volunteer");
      totalVolsCount = vols.length;
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      totalVolsCount = users.filter(u => u.role === "volunteer").length;
    }

    if (statMeals) statMeals.textContent = completedMeals.toLocaleString();
    if (statDrives) statDrives.textContent = totalDrives.toString();
    if (statVolunteers) statVolunteers.textContent = totalVolsCount.toString();

    // 2. Render Leaderboard rankings
    if (leaderboardContainer) {
      leaderboardContainer.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px;">Updating leaderboard...</p>`;
      
      const { volunteers, restaurants } = await DBService.getLeaderboard();
      leaderboardContainer.innerHTML = "";

      if (activeLeaderboardTab === "volunteers") {
        if (volunteers.length === 0) {
          leaderboardContainer.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px; font-style: italic;">No active volunteers recorded.</p>`;
          return;
        }
        volunteers.slice(0, 5).forEach((v, idx) => {
          const item = document.createElement("div");
          item.className = `leaderboard-item rank-${idx + 1}`;
          item.innerHTML = `
            <div class="leaderboard-item-info">
              <span class="leaderboard-rank">${idx + 1}</span>
              <div class="user-avatar" style="width:30px; height:30px; font-size:12px;">${v.name.charAt(0).toUpperCase()}</div>
              <div>
                <h5 style="font-size:13px; font-weight:600;">${v.name}</h5>
                <span style="font-size: 10px; color: var(--color-text-muted);">${v.completedCount || 0} donations/drives completed</span>
              </div>
            </div>
            <span class="leaderboard-points">${v.rewardPoints || 0} Pts</span>
          `;
          leaderboardContainer.appendChild(item);
        });
      } else {
        if (restaurants.length === 0) {
          leaderboardContainer.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 20px; font-style: italic;">No active restaurants recorded.</p>`;
          return;
        }
        restaurants.slice(0, 5).forEach((r, idx) => {
          const item = document.createElement("div");
          item.className = `leaderboard-item rank-${idx + 1}`;
          item.innerHTML = `
            <div class="leaderboard-item-info">
              <span class="leaderboard-rank">${idx + 1}</span>
              <div class="user-avatar" style="width:30px; height:30px; font-size:12px; border-color: var(--color-orange); color: var(--color-orange-light);">${r.name.charAt(0).toUpperCase()}</div>
              <div>
                <h5 style="font-size:13px; font-weight:600;">${r.name}</h5>
                <span style="font-size: 10px; color: var(--color-text-muted);">${r.address ? r.address.split(',')[0] : 'Local Branch'}</span>
              </div>
            </div>
            <span class="leaderboard-points orange">${r.sevaPoints || 0} Seva Pts</span>
          `;
          leaderboardContainer.appendChild(item);
        });
      }
    }

  } catch (err) {
    if (leaderboardContainer) leaderboardContainer.innerHTML = `<p style="color: var(--color-danger); text-align: center;">Unable to refresh scores.</p>`;
  }
}

function initDashboardHandlers() {
  const tabVols = document.getElementById("leaderboard-tab-volunteers");
  const tabRests = document.getElementById("leaderboard-tab-restaurants");

  tabVols.addEventListener("click", () => {
    tabVols.classList.add("active");
    tabRests.classList.remove("active");
    activeLeaderboardTab = "volunteers";
    renderDashboard();
  });

  tabRests.addEventListener("click", () => {
    tabRests.classList.add("active");
    tabVols.classList.remove("active");
    activeLeaderboardTab = "restaurants";
    renderDashboard();
  });
}

// --- App Initialization & Auth Listener Setup ---
function initApp() {
  // Config state indicator in bottom-left
  if (isConfigValid) {
    DOM.demoIndicatorText.textContent = "Live Firebase Mode";
    document.getElementById("demo-indicator").style.backgroundColor = "rgba(139, 92, 246, 0.15)";
    document.getElementById("demo-indicator").style.borderColor = "rgba(139, 92, 246, 0.3)";
    document.getElementById("demo-indicator").querySelector(".demo-mode-dot").style.backgroundColor = "var(--color-purple-light)";
  }

  initNavigation();
  initAuthHandlers();
  initFoodWasteHandlers();
  initCleanupHandlers();
  initDashboardHandlers();

  // Establish state subscription
  DBService.onAuthChange((user) => {
    updateAuthUI(user);
  });

  // Default view is dashboard
  switchView("dashboard");
}

document.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("load", () => {
  // If Vite loads but DOMContentLoaded fired early
  if (!document.getElementById("nav-dashboard").classList.contains("active") && !document.querySelector(".module-panel.active")) {
    initApp();
  }
});
