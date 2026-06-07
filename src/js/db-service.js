import { db, auth, isConfigValid } from "./firebase-config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  query, 
  where,
  orderBy
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// Initial mock data to seed localStorage if empty
const MOCK_DATA = {
  users: [
    {
      uid: "ngo_1",
      name: "Robin Hood Army",
      email: "rha@seva.org",
      role: "ngo",
      description: "A zero-funds volunteer organization that redistributes surplus food to the needy.",
      volunteers: ["vol_1", "vol_2"],
      completedCount: 42
    },
    {
      uid: "ngo_2",
      name: "Clean Earth Foundation",
      email: "clean@seva.org",
      role: "ngo",
      description: "Dedicated to driving local sanitation drives and public area cleaning projects.",
      volunteers: ["vol_3"],
      completedCount: 19
    },
    {
      uid: "rest_1",
      name: "Green Garden Cafe",
      email: "greengarden@food.com",
      role: "restaurant",
      address: "123, Park Lane, Indiranagar",
      sevaPoints: 250,
      completedCount: 15
    },
    {
      uid: "rest_2",
      name: "Pizza Corner",
      email: "pizzacorner@food.com",
      role: "restaurant",
      address: "45, Ring Road, Koramangala",
      sevaPoints: 120,
      completedCount: 8
    },
    {
      uid: "vol_1",
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      role: "volunteer",
      rewardPoints: 340,
      impactHours: 18,
      completedCount: 12,
      ngoId: "ngo_1"
    },
    {
      uid: "vol_2",
      name: "Priya Sharma",
      email: "priya@gmail.com",
      role: "volunteer",
      rewardPoints: 500,
      impactHours: 25,
      completedCount: 18,
      ngoId: "ngo_1"
    },
    {
      uid: "vol_3",
      name: "Amit Patel",
      email: "amit@gmail.com",
      role: "volunteer",
      rewardPoints: 80,
      impactHours: 6,
      completedCount: 3,
      ngoId: "ngo_2"
    }
  ],
  foodPickups: [
    {
      id: "food_1",
      restaurantId: "rest_1",
      restaurantName: "Green Garden Cafe",
      foodType: "Cooked Rice, Dal and Veggies",
      quantity: "For 15 people",
      expiryTime: new Date(Date.now() + 4 * 3600000).toISOString(), // 4 hours from now
      location: "Indiranagar Branch, near Metro",
      status: "pending", // pending, claimed, completed
      claimedBy: null,
      claimedByName: null,
      feedback: ""
    },
    {
      id: "food_2",
      restaurantId: "rest_2",
      restaurantName: "Pizza Corner",
      foodType: "Surplus Cheese Pizzas (Unsold)",
      quantity: "8 Large Pizzas",
      expiryTime: new Date(Date.now() - 2 * 3600000).toISOString(), // expired
      location: "Koramangala 5th Block",
      status: "completed",
      claimedBy: "vol_1",
      claimedByName: "Rahul Kumar",
      feedback: "Distributed to kids near flyover. Appreciated!"
    }
  ],
  cleanupDrives: [
    {
      id: "drive_1",
      title: "Indiranagar Park Clean-Up",
      description: "Join us in cleaning the public children's park after the weekend festival dump.",
      date: new Date(Date.now() + 2 * 24 * 3600000).toISOString().split('T')[0], // 2 days later
      time: "07:30 AM",
      location: "Indiranagar Public Park, 2nd Main",
      organizerId: "ngo_2",
      organizerName: "Clean Earth Foundation",
      pointsReward: 50,
      participants: ["vol_3", "vol_1"],
      proofs: [] // { volunteerId, volunteerName, imageUrl, approved: boolean }
    },
    {
      id: "drive_2",
      title: "Koramangala Lake Side Sweep",
      description: "Plastics and trash cleanup along the lakeside walking path.",
      date: new Date(Date.now() - 3 * 24 * 3600000).toISOString().split('T')[0], // 3 days ago
      time: "08:00 AM",
      location: "Koramangala Lake Walkway",
      organizerId: "ngo_2",
      organizerName: "Clean Earth Foundation",
      pointsReward: 80,
      participants: ["vol_3", "vol_2"],
      proofs: [
        {
          volunteerId: "vol_2",
          volunteerName: "Priya Sharma",
          imageUrl: "https://images.unsplash.com/photo-1595275313093-f112e077189d?w=500&auto=format&fit=crop&q=60",
          approved: true
        }
      ]
    }
  ],
  vouchers: [
    {
      id: "vouch_1",
      partner: "Zepto",
      title: "₹150 Flat Discount on Groceries",
      pointsCost: 150,
      description: "Get flat ₹150 off on order value above ₹499.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60"
    },
    {
      id: "vouch_2",
      partner: "Swiggy",
      title: "Free Delivery + ₹50 Off on Food Delivery",
      pointsCost: 100,
      description: "Redeemable on any restaurant food order above ₹299.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop&q=60"
    },
    {
      id: "vouch_3",
      partner: "BookMyShow",
      title: "₹100 Off Movie Voucher",
      pointsCost: 120,
      description: "Enjoy movie ticket discounts across any cinemas in town.",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=60"
    }
  ],
  claimedVouchers: [] // { volunteerId, voucherId, code, date }
};

// Seed LocalStorage
function seedLocalStorage() {
  if (!localStorage.getItem("sevasetu_seeded")) {
    localStorage.setItem("sevasetu_users", JSON.stringify(MOCK_DATA.users));
    localStorage.setItem("sevasetu_foodPickups", JSON.stringify(MOCK_DATA.foodPickups));
    localStorage.setItem("sevasetu_cleanupDrives", JSON.stringify(MOCK_DATA.cleanupDrives));
    localStorage.setItem("sevasetu_vouchers", JSON.stringify(MOCK_DATA.vouchers));
    localStorage.setItem("sevasetu_claimedVouchers", JSON.stringify(MOCK_DATA.claimedVouchers));
    localStorage.setItem("sevasetu_seeded", "true");
    console.info("SevaSetu Mock DB: LocalStorage seeded successfully.");
  }
}
seedLocalStorage();

// Get active user session from local state / auth
let currentLoggedInUser = JSON.parse(localStorage.getItem("sevasetu_current_user") || "null");

export const DBService = {
  // Listen to Auth State Changes
  onAuthChange(callback) {
    if (isConfigValid) {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          // Fetch additional user info from firestore
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const userData = { uid: fbUser.uid, ...userDoc.data() };
            currentLoggedInUser = userData;
            localStorage.setItem("sevasetu_current_user", JSON.stringify(userData));
            callback(userData);
          } else {
            callback(null);
          }
        } else {
          currentLoggedInUser = null;
          localStorage.removeItem("sevasetu_current_user");
          callback(null);
        }
      });
    } else {
      // Mock Auth State Check
      callback(currentLoggedInUser);
    }
  },

  getCurrentUser() {
    return currentLoggedInUser;
  },

  // 1. Authentication Services
  async login(email, password) {
    if (isConfigValid) {
      const creds = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", creds.user.uid));
      const userData = { uid: creds.user.uid, ...userDoc.data() };
      currentLoggedInUser = userData;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(userData));
      return userData;
    } else {
      // Mock Login
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const found = users.find(u => u.email === email);
      if (found) {
        currentLoggedInUser = found;
        localStorage.setItem("sevasetu_current_user", JSON.stringify(found));
        return found;
      }
      throw new Error("Invalid credentials or user not found.");
    }
  },

  async register(name, email, password, role, extraInfo = {}) {
    if (isConfigValid) {
      const creds = await createUserWithEmailAndPassword(auth, email, password);
      const userPayload = {
        name,
        email,
        role,
        completedCount: 0,
        ...extraInfo
      };
      if (role === "volunteer") {
        userPayload.rewardPoints = 0;
        userPayload.impactHours = 0;
        userPayload.ngoId = "";
      } else if (role === "restaurant") {
        userPayload.sevaPoints = 0;
        userPayload.address = extraInfo.address || "";
      }
      
      await setDoc(doc(db, "users", creds.user.uid), userPayload);
      const createdUser = { uid: creds.user.uid, ...userPayload };
      currentLoggedInUser = createdUser;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(createdUser));
      return createdUser;
    } else {
      // Mock Registration
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      if (users.some(u => u.email === email)) {
        throw new Error("Email already registered.");
      }
      const newUid = "mock_uid_" + Math.random().toString(36).substr(2, 9);
      const userPayload = {
        uid: newUid,
        name,
        email,
        role,
        completedCount: 0,
        ...extraInfo
      };
      if (role === "volunteer") {
        userPayload.rewardPoints = 0;
        userPayload.impactHours = 0;
        userPayload.ngoId = "";
      } else if (role === "restaurant") {
        userPayload.sevaPoints = 0;
        userPayload.address = extraInfo.address || "";
      }
      users.push(userPayload);
      localStorage.setItem("sevasetu_users", JSON.stringify(users));
      currentLoggedInUser = userPayload;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(userPayload));
      return userPayload;
    }
  },

  async logout() {
    if (isConfigValid) {
      await signOut(auth);
    }
    currentLoggedInUser = null;
    localStorage.removeItem("sevasetu_current_user");
    return true;
  },

  // 2. Food Waste Redistribution (Ahaar Setu)
  async getFoodPickups() {
    if (isConfigValid) {
      const snap = await getDocs(collection(db, "foodPickups"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return JSON.parse(localStorage.getItem("sevasetu_foodPickups") || "[]");
    }
  },

  async createFoodPickup(foodType, quantity, expiryTime, location) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "restaurant") {
      throw new Error("Only restaurants can post surplus food.");
    }
    const payload = {
      restaurantId: currentLoggedInUser.uid,
      restaurantName: currentLoggedInUser.name,
      foodType,
      quantity,
      expiryTime,
      location,
      status: "pending",
      claimedBy: null,
      claimedByName: null,
      feedback: ""
    };

    if (isConfigValid) {
      const docRef = await addDoc(collection(db, "foodPickups"), payload);
      return { id: docRef.id, ...payload };
    } else {
      const pickups = JSON.parse(localStorage.getItem("sevasetu_foodPickups") || "[]");
      const newPickup = { id: "food_" + Date.now(), ...payload };
      pickups.unshift(newPickup);
      localStorage.setItem("sevasetu_foodPickups", JSON.stringify(pickups));
      return newPickup;
    }
  },

  async claimFoodPickup(pickupId) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "volunteer") {
      throw new Error("Only volunteers can claim food pickups.");
    }

    if (isConfigValid) {
      const ref = doc(db, "foodPickups", pickupId);
      await updateDoc(ref, {
        status: "claimed",
        claimedBy: currentLoggedInUser.uid,
        claimedByName: currentLoggedInUser.name
      });
      return true;
    } else {
      const pickups = JSON.parse(localStorage.getItem("sevasetu_foodPickups") || "[]");
      const index = pickups.findIndex(p => p.id === pickupId);
      if (index !== -1 && pickups[index].status === "pending") {
        pickups[index].status = "claimed";
        pickups[index].claimedBy = currentLoggedInUser.uid;
        pickups[index].claimedByName = currentLoggedInUser.name;
        localStorage.setItem("sevasetu_foodPickups", JSON.stringify(pickups));
        return true;
      }
      throw new Error("Food pickup is no longer available.");
    }
  },

  async completeFoodPickup(pickupId, feedback) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "volunteer") {
      throw new Error("Only the assigned volunteer can complete the pickup.");
    }

    if (isConfigValid) {
      const ref = doc(db, "foodPickups", pickupId);
      const snap = await getDoc(ref);
      const pickupData = snap.data();
      
      await updateDoc(ref, {
        status: "completed",
        feedback: feedback
      });

      // Update volunteer points (+30 points per distribution)
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 30,
        completedCount: (currentLoggedInUser.completedCount || 0) + 1,
        impactHours: (currentLoggedInUser.impactHours || 0) + 2
      });

      // Update restaurant Seva points (+50 points for donating)
      const restRef = doc(db, "users", pickupData.restaurantId);
      const restSnap = await getDoc(restRef);
      if (restSnap.exists()) {
        await updateDoc(restRef, {
          sevaPoints: (restSnap.data().sevaPoints || 0) + 50,
          completedCount: (restSnap.data().completedCount || 0) + 1
        });
      }

      // Sync local state profile
      currentLoggedInUser.rewardPoints = (currentLoggedInUser.rewardPoints || 0) + 30;
      currentLoggedInUser.completedCount = (currentLoggedInUser.completedCount || 0) + 1;
      currentLoggedInUser.impactHours = (currentLoggedInUser.impactHours || 0) + 2;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
      return true;
    } else {
      // Mock Completion
      const pickups = JSON.parse(localStorage.getItem("sevasetu_foodPickups") || "[]");
      const index = pickups.findIndex(p => p.id === pickupId);
      if (index !== -1 && pickups[index].claimedBy === currentLoggedInUser.uid) {
        pickups[index].status = "completed";
        pickups[index].feedback = feedback;
        localStorage.setItem("sevasetu_foodPickups", JSON.stringify(pickups));

        // Update volunteer stats
        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints = (users[vIdx].rewardPoints || 0) + 30;
          users[vIdx].completedCount = (users[vIdx].completedCount || 0) + 1;
          users[vIdx].impactHours = (users[vIdx].impactHours || 0) + 2;
          currentLoggedInUser = users[vIdx];
          localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
        }

        // Update restaurant stats
        const rIdx = users.findIndex(u => u.uid === pickups[index].restaurantId);
        if (rIdx !== -1) {
          users[rIdx].sevaPoints = (users[rIdx].sevaPoints || 0) + 50;
          users[rIdx].completedCount = (users[rIdx].completedCount || 0) + 1;
        }

        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        return true;
      }
      throw new Error("Verification failed. Pickup not assigned to you.");
    }
  },

  // 3. Swachh Bharat Drives (Swachh Setu)
  async getCleanupDrives() {
    if (isConfigValid) {
      const snap = await getDocs(collection(db, "cleanupDrives"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return JSON.parse(localStorage.getItem("sevasetu_cleanupDrives") || "[]");
    }
  },

  async createCleanupDrive(title, description, date, time, location, pointsReward) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "ngo") {
      throw new Error("Only NGOs can organize cleanup drives.");
    }

    const payload = {
      title,
      description,
      date,
      time,
      location,
      organizerId: currentLoggedInUser.uid,
      organizerName: currentLoggedInUser.name,
      pointsReward: parseInt(pointsReward) || 50,
      participants: [],
      proofs: []
    };

    if (isConfigValid) {
      const ref = await addDoc(collection(db, "cleanupDrives"), payload);
      return { id: ref.id, ...payload };
    } else {
      const drives = JSON.parse(localStorage.getItem("sevasetu_cleanupDrives") || "[]");
      const newDrive = { id: "drive_" + Date.now(), ...payload };
      drives.unshift(newDrive);
      localStorage.setItem("sevasetu_cleanupDrives", JSON.stringify(drives));
      return newDrive;
    }
  },

  async joinCleanupDrive(driveId) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "volunteer") {
      throw new Error("Only volunteers can participate in drives.");
    }

    if (isConfigValid) {
      const ref = doc(db, "cleanupDrives", driveId);
      const snap = await getDoc(ref);
      const currentParticipants = snap.data().participants || [];
      if (!currentParticipants.includes(currentLoggedInUser.uid)) {
        currentParticipants.push(currentLoggedInUser.uid);
        await updateDoc(ref, { participants: currentParticipants });
      }
      return true;
    } else {
      const drives = JSON.parse(localStorage.getItem("sevasetu_cleanupDrives") || "[]");
      const index = drives.findIndex(d => d.id === driveId);
      if (index !== -1) {
        if (!drives[index].participants.includes(currentLoggedInUser.uid)) {
          drives[index].participants.push(currentLoggedInUser.uid);
          localStorage.setItem("sevasetu_cleanupDrives", JSON.stringify(drives));
        }
        return true;
      }
      throw new Error("Drive not found.");
    }
  },

  async submitDriveProof(driveId, imageUrl) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "volunteer") {
      throw new Error("Only participants can upload drive completion proof.");
    }

    const proof = {
      volunteerId: currentLoggedInUser.uid,
      volunteerName: currentLoggedInUser.name,
      imageUrl,
      approved: false
    };

    if (isConfigValid) {
      const ref = doc(db, "cleanupDrives", driveId);
      const snap = await getDoc(ref);
      const currentProofs = snap.data().proofs || [];
      // Remove any previous submission from this volunteer
      const filtered = currentProofs.filter(p => p.volunteerId !== currentLoggedInUser.uid);
      filtered.push(proof);
      await updateDoc(ref, { proofs: filtered });
      return true;
    } else {
      const drives = JSON.parse(localStorage.getItem("sevasetu_cleanupDrives") || "[]");
      const index = drives.findIndex(d => d.id === driveId);
      if (index !== -1) {
        const filtered = drives[index].proofs.filter(p => p.volunteerId !== currentLoggedInUser.uid);
        filtered.push(proof);
        drives[index].proofs = filtered;
        localStorage.setItem("sevasetu_cleanupDrives", JSON.stringify(drives));
        return true;
      }
      throw new Error("Drive not found.");
    }
  },

  async approveDriveProof(driveId, volunteerId) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "ngo") {
      throw new Error("Only NGOs can verify and approve submissions.");
    }

    if (isConfigValid) {
      const ref = doc(db, "cleanupDrives", driveId);
      const snap = await getDoc(ref);
      const driveData = snap.data();
      const pointsReward = driveData.pointsReward || 50;

      // Update proof approved flag
      const updatedProofs = (driveData.proofs || []).map(p => {
        if (p.volunteerId === volunteerId) {
          return { ...p, approved: true };
        }
        return p;
      });
      await updateDoc(ref, { proofs: updatedProofs });

      // Add points to volunteer account
      const volRef = doc(db, "users", volunteerId);
      const volSnap = await getDoc(volRef);
      if (volSnap.exists()) {
        const volData = volSnap.data();
        await updateDoc(volRef, {
          rewardPoints: (volData.rewardPoints || 0) + pointsReward,
          completedCount: (volData.completedCount || 0) + 1,
          impactHours: (volData.impactHours || 0) + 3 // Assume 3 hours average per cleanup drive
        });
      }
      return true;
    } else {
      // Mock Approval
      const drives = JSON.parse(localStorage.getItem("sevasetu_cleanupDrives") || "[]");
      const index = drives.findIndex(d => d.id === driveId);
      if (index !== -1) {
        const pointsReward = drives[index].pointsReward || 50;
        let foundProof = false;
        drives[index].proofs = drives[index].proofs.map(p => {
          if (p.volunteerId === volunteerId) {
            p.approved = true;
            foundProof = true;
          }
          return p;
        });

        if (foundProof) {
          localStorage.setItem("sevasetu_cleanupDrives", JSON.stringify(drives));

          // Award points to volunteer
          const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
          const vIdx = users.findIndex(u => u.uid === volunteerId);
          if (vIdx !== -1) {
            users[vIdx].rewardPoints = (users[vIdx].rewardPoints || 0) + pointsReward;
            users[vIdx].completedCount = (users[vIdx].completedCount || 0) + 1;
            users[vIdx].impactHours = (users[vIdx].impactHours || 0) + 3;
            localStorage.setItem("sevasetu_users", JSON.stringify(users));

            // Sync current logged in user if they are the volunteer (just in case)
            if (currentLoggedInUser.uid === volunteerId) {
              currentLoggedInUser = users[vIdx];
              localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
            }
          }
          return true;
        }
      }
      throw new Error("Submission not found.");
    }
  },

  // 4. NGO Directory & Management Services
  async getNGOs() {
    if (isConfigValid) {
      const q = query(collection(db, "users"), where("role", "==", "ngo"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      return users.filter(u => u.role === "ngo");
    }
  },

  async joinNGO(ngoId) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "volunteer") {
      throw new Error("Only volunteers can register with NGOs.");
    }

    if (isConfigValid) {
      const ref = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(ref, { ngoId: ngoId });

      // Add to NGO volunteer list
      const ngoRef = doc(db, "users", ngoId);
      const ngoSnap = await getDoc(ngoRef);
      if (ngoSnap.exists()) {
        const vols = ngoSnap.data().volunteers || [];
        if (!vols.includes(currentLoggedInUser.uid)) {
          vols.push(currentLoggedInUser.uid);
          await updateDoc(ngoRef, { volunteers: vols });
        }
      }

      currentLoggedInUser.ngoId = ngoId;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
      return true;
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
      const nIdx = users.findIndex(u => u.uid === ngoId);

      if (vIdx !== -1 && nIdx !== -1) {
        users[vIdx].ngoId = ngoId;
        
        if (!users[nIdx].volunteers) users[nIdx].volunteers = [];
        if (!users[nIdx].volunteers.includes(currentLoggedInUser.uid)) {
          users[nIdx].volunteers.push(currentLoggedInUser.uid);
        }

        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        currentLoggedInUser = users[vIdx];
        localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
        return true;
      }
      throw new Error("NGO or Volunteer record invalid.");
    }
  },

  // 5. Rewards & Vouchers Marketplace
  async getVouchers() {
    if (isConfigValid) {
      const snap = await getDocs(collection(db, "vouchers"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return JSON.parse(localStorage.getItem("sevasetu_vouchers") || "[]");
    }
  },

  async redeemVoucher(voucherId) {
    if (!currentLoggedInUser || currentLoggedInUser.role !== "volunteer") {
      throw new Error("Only volunteers can redeem vouchers.");
    }

    if (isConfigValid) {
      const vouchRef = doc(db, "vouchers", voucherId);
      const vouchSnap = await getDoc(vouchRef);
      if (!vouchSnap.exists()) throw new Error("Voucher not found.");
      const voucher = vouchSnap.data();

      if ((currentLoggedInUser.rewardPoints || 0) < voucher.pointsCost) {
        throw new Error("Insufficient reward points.");
      }

      // Generate random coupon code
      const generatedCode = voucher.partner.toUpperCase() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();

      // Deduct points
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: currentLoggedInUser.rewardPoints - voucher.pointsCost
      });

      // Log Claim
      await addDoc(collection(db, "claimedVouchers"), {
        volunteerId: currentLoggedInUser.uid,
        voucherId: voucherId,
        voucherTitle: voucher.title,
        partner: voucher.partner,
        code: generatedCode,
        date: new Date().toISOString()
      });

      currentLoggedInUser.rewardPoints -= voucher.pointsCost;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
      return generatedCode;
    } else {
      const vouchers = JSON.parse(localStorage.getItem("sevasetu_vouchers") || "[]");
      const voucher = vouchers.find(v => v.id === voucherId);
      if (!voucher) throw new Error("Voucher not found.");

      if ((currentLoggedInUser.rewardPoints || 0) < voucher.pointsCost) {
        throw new Error("Insufficient reward points.");
      }

      const generatedCode = voucher.partner.toUpperCase() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();

      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
      if (vIdx !== -1) {
        users[vIdx].rewardPoints -= voucher.pointsCost;
        localStorage.setItem("sevasetu_users", JSON.stringify(users));

        const claims = JSON.parse(localStorage.getItem("sevasetu_claimedVouchers") || "[]");
        claims.push({
          volunteerId: currentLoggedInUser.uid,
          voucherId: voucherId,
          voucherTitle: voucher.title,
          partner: voucher.partner,
          code: generatedCode,
          date: new Date().toISOString()
        });
        localStorage.setItem("sevasetu_claimedVouchers", JSON.stringify(claims));

        currentLoggedInUser = users[vIdx];
        localStorage.setItem("sevasetu_current_user", JSON.stringify(currentLoggedInUser));
        return generatedCode;
      }
      throw new Error("User validation error.");
    }
  },

  async getClaimedVouchers() {
    if (!currentLoggedInUser) return [];
    if (isConfigValid) {
      const q = query(collection(db, "claimedVouchers"), where("volunteerId", "==", currentLoggedInUser.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const claims = JSON.parse(localStorage.getItem("sevasetu_claimedVouchers") || "[]");
      return claims.filter(c => c.volunteerId === currentLoggedInUser.uid);
    }
  },

  // 6. Analytics & Leaderboard
  async getLeaderboard() {
    let users = [];
    if (isConfigValid) {
      const snap = await getDocs(collection(db, "users"));
      users = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } else {
      users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
    }

    // Volunteers ranked by completed counts (or points)
    const volunteers = users
      .filter(u => u.role === "volunteer")
      .sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0));

    // Restaurants ranked by completed distributions
    const restaurants = users
      .filter(u => u.role === "restaurant")
      .sort((a, b) => (b.sevaPoints || 0) - (a.sevaPoints || 0));

    return { volunteers, restaurants };
  }
};
