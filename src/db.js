import { db, auth, isConfigValid } from "./firebase";
import { 
  collection, 
  addDoc as fbAddDoc, 
  getDocs as fbGetDocs, 
  doc, 
  getDoc as fbGetDoc, 
  updateDoc as fbUpdateDoc, 
  setDoc as fbSetDoc,
  onSnapshot as fbOnSnapshot,
  deleteDoc as fbDeleteDoc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";

// --- CRYPTOGRAPHY: SHA-256 HASHING & AES/XOR TRANS-PORTABLE ENCRYPTION ---
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "SevaSetuSecureKey123!";

// SHA-256 Hashing Algorithm (Pure JS)
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiLength = ascii[lengthProperty];
  var hash = [];
  var k = [];
  var primeCounter = 0;
  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
  words[words[lengthProperty]] = (asciiLength * 8);
  for (j = 0; j < words[lengthProperty]; ) {
    var w = words.slice(j, j += 16);
    var oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ((hash[4] & hash[5]) ^ (~hash[4] & hash[6])) + k[i] + w[i]) | 0;
      var temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]))) | 0;
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash[8] = 0;
      hash = hash.slice(0, 8);
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    var hex = (hash[i] >>> 0).toString(16);
    result += ((hex.length < 8 ? '0' : '') + hex);
  }
  return result;
}

// Symmetric XOR Base64 Encryption
function encryptText(text) {
  if (typeof text !== "string") return text;
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(unescape(encodeURIComponent(result)));
}

// Symmetric XOR Base64 Decryption
function decryptText(encodedText) {
  if (typeof encodedText !== "string") return encodedText;
  try {
    const text = decodeURIComponent(escape(atob(encodedText)));
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return encodedText;
  }
}

// Recursive object helpers
function encryptObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => encryptObject(item));
  }
  const cleanObj = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      if (k.startsWith("_")) continue;
      cleanObj[k] = obj[k];
    }
  }
  const hashVal = sha256(JSON.stringify(cleanObj));
  const encrypted = { _integrityHash: hashVal };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.startsWith("_")) {
        encrypted[key] = obj[key];
        continue;
      }
      const val = obj[key];
      if (typeof val === "string") {
        encrypted[key] = encryptText(val);
      } else if (typeof val === "object" && val !== null) {
        encrypted[key] = encryptObject(val);
      } else {
        encrypted[key] = val;
      }
    }
  }
  return encrypted;
}

function decryptObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => decryptObject(item));
  }
  const decrypted = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.startsWith("_")) {
        decrypted[key] = obj[key];
        continue;
      }
      const val = obj[key];
      if (typeof val === "string") {
        decrypted[key] = decryptText(val);
      } else if (typeof val === "object" && val !== null) {
        decrypted[key] = decryptObject(val);
      } else {
        decrypted[key] = val;
      }
    }
  }
  return decrypted;
}

// Intercept standard firestore operations to encrypt/decrypt automatically
const addDoc = async (collRef, data) => {
  return await fbAddDoc(collRef, encryptObject(data));
};

const setDoc = async (docRef, data, options) => {
  return await fbSetDoc(docRef, encryptObject(data), options);
};

const updateDoc = async (docRef, data) => {
  return await fbUpdateDoc(docRef, encryptObject(data));
};

class DecryptedDocumentSnapshot {
  constructor(snap) {
    this._snap = snap;
    this.id = snap.id;
    this.ref = snap.ref;
    this.metadata = snap.metadata;
    this._decryptedData = snap.exists() ? decryptObject(snap.data()) : null;
  }
  exists() {
    return this._snap.exists();
  }
  data() {
    return this._decryptedData;
  }
  get(fieldPath) {
    return this._decryptedData ? this._decryptedData[fieldPath] : undefined;
  }
}

class DecryptedQuerySnapshot {
  constructor(snap) {
    this._snap = snap;
    this.docs = snap.docs.map(docSnap => new DecryptedDocumentSnapshot(docSnap));
    this.size = snap.size;
    this.empty = snap.empty;
    this.metadata = snap.metadata;
    this.query = snap.query;
  }
  docChanges(options) {
    return this._snap.docChanges(options).map(change => ({
      type: change.type,
      oldIndex: change.oldIndex,
      newIndex: change.newIndex,
      doc: new DecryptedDocumentSnapshot(change.doc)
    }));
  }
  forEach(callback, thisArg) {
    this.docs.forEach(docSnap => callback.call(thisArg, docSnap));
  }
}

const getDoc = async (docRef) => {
  const snap = await fbGetDoc(docRef);
  return new DecryptedDocumentSnapshot(snap);
};

const getDocs = async (queryRef) => {
  const snap = await fbGetDocs(queryRef);
  return new DecryptedQuerySnapshot(snap);
};

const onSnapshot = (queryRef, callback, onError) => {
  return fbOnSnapshot(queryRef, (snap) => {
    callback(new DecryptedQuerySnapshot(snap));
  }, onError);
};


// --- SEED MOCK DATA ---
const MOCK_USERS = [
  { uid: "ngo_1", name: "Robin Hood Army", email: "rha@seva.org", role: "ngo", description: "Zero-funds volunteer organization redistributing surplus food.", volunteers: ["vol_1", "vol_2"], completedCount: 42 },
  { uid: "ngo_2", name: "Clean Earth Foundation", email: "clean@seva.org", role: "ngo", description: "Dedicated to local sanitation drives and public cleanliness campaigns.", volunteers: ["vol_3"], completedCount: 19 },
  { uid: "rest_1", name: "Green Garden Cafe", email: "greengarden@food.com", role: "restaurant", address: "123, Park Lane, Indiranagar", sevaPoints: 250, completedCount: 15 },
  { uid: "rest_2", name: "Pizza Corner", email: "pizzacorner@food.com", role: "restaurant", address: "45, Ring Road, Koramangala", sevaPoints: 120, completedCount: 8 },
  { uid: "vol_1", name: "Rahul Kumar", email: "rahul@gmail.com", role: "volunteer", rewardPoints: 340, impactHours: 18, completedCount: 12, ngoId: "ngo_1" },
  { uid: "vol_2", name: "Priya Sharma", email: "priya@gmail.com", role: "volunteer", rewardPoints: 500, impactHours: 25, completedCount: 18, ngoId: "ngo_1" },
  { uid: "vol_3", name: "Amit Patel", email: "amit@gmail.com", role: "volunteer", rewardPoints: 80, impactHours: 6, completedCount: 3, ngoId: "ngo_2" }
];

const MOCK_FOODS = [
  { id: "food_1", restaurantId: "rest_1", restaurantName: "Green Garden Cafe", foodType: "Cooked Rice, Dal and Veggies", quantity: "For 15 people", expiryTime: new Date(Date.now() + 4 * 3600000).toISOString(), location: "Indiranagar Branch, near Metro", status: "pending", claimedBy: null, claimedByName: null, feedback: "" },
  { id: "food_2", restaurantId: "rest_2", restaurantName: "Pizza Corner", foodType: "Surplus Cheese Pizzas (Unsold)", quantity: "8 Large Pizzas", expiryTime: new Date(Date.now() - 2 * 3600000).toISOString(), location: "Koramangala 5th Block", status: "completed", claimedBy: "vol_1", claimedByName: "Rahul Kumar", feedback: "Distributed to kids near flyover. Appreciated!" }
];

const MOCK_DRIVES = [
  { 
    id: "drive_1", 
    title: "Indiranagar Park Clean-Up", 
    description: "Join us in cleaning the public children's park after the weekend festival dump.", 
    date: new Date(Date.now() + 2 * 24 * 3600000).toISOString().split('T')[0], 
    time: "07:30 AM", 
    location: "Indiranagar Public Park, 2nd Main", 
    organizerId: "ngo_2", 
    organizerName: "Clean Earth Foundation", 
    pointsReward: 50, 
    participants: ["vol_3", "vol_1"], 
    proofs: [
      { 
        volunteerId: "vol_1", 
        volunteerName: "Rahul Kumar", 
        imageUrl: "https://images.unsplash.com/photo-1604186837056-8e7c2867b6f2?w=600&auto=format&fit=crop&q=80||https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&auto=format&fit=crop&q=80||KGs Collected: 45||Sq Meters: 120", 
        approved: true 
      }
    ] 
  },
  { 
    id: "drive_2", 
    title: "Koramangala Lake Side Sweep", 
    description: "Plastics and trash cleanup along the lakeside walking path.", 
    date: new Date(Date.now() - 3 * 24 * 3600000).toISOString().split('T')[0], 
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
        imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80||https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80||KGs Collected: 75||Sq Meters: 230", 
        approved: true 
      }
    ] 
  }
];

const MOCK_VOUCHERS = [
  { id: "vouch_1", partner: "Zepto", title: "₹150 Flat Discount on Groceries", pointsCost: 150, description: "Get flat ₹150 off on order value above ₹499.", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60" },
  { id: "vouch_2", partner: "Swiggy", title: "Free Delivery + ₹50 Off on Food Delivery", pointsCost: 100, description: "Redeemable on any restaurant food order above ₹299.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop&q=60" },
  { id: "vouch_3", partner: "BookMyShow", title: "₹100 Off Movie Voucher", pointsCost: 120, description: "Enjoy movie ticket discounts across any cinemas in town.", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&auto=format&fit=crop&q=60" }
];

const MOCK_SKILLS = [
  { id: "skill_1", title: "Design Educational Posters", description: "Design 3 visual posters for health and hygiene awareness in local schools.", requiredSkill: "Graphic Design", hoursReward: 4, pointsReward: 70, organizerId: "ngo_1", organizerName: "Robin Hood Army", status: "open", assignedTo: null, workLink: "" },
  { id: "skill_2", title: "Teach Basic Math to Primary Kids", description: "Teach simple fractions and equations to a batch of 10 children.", requiredSkill: "Teaching", hoursReward: 6, pointsReward: 120, organizerId: "ngo_2", organizerName: "Clean Earth Foundation", status: "open", assignedTo: null, workLink: "" }
];

const MOCK_TUTORS = [
  { id: "tut_1", tutorId: "vol_1", name: "Rahul Kumar", subject: "Mathematics", availability: "Weekends 4-6 PM", location: "Indiranagar", pointsEarned: 120 }
];

const MOCK_TUTOR_REQUESTS = [
  { id: "req_1", childName: "Sunny (10 yrs)", parentName: "Ramesh", subject: "Mathematics", location: "Indiranagar", details: "Basic arithmetic and fractions help needed.", status: "matched", matchedTutor: "Rahul Kumar", date: new Date().toISOString() }
];

const MOCK_CAMPS = [
  { id: "camp_1", title: "Indiranagar Free Pediatric Health Camp", location: "Indiranagar Community Hall", date: new Date(Date.now() + 4 * 24 * 3600000).toISOString().split('T')[0], description: "Free checkups and distribution of vitamins for kids.", doctors: ["Dr. Aditi Sharma"], patientsCount: 15, status: "scheduled", report: "" }
];

const MOCK_CLOTHES = [
  { id: "cl_1", donorName: "Priya Sharma", category: "Children Clothes", details: "Sweaters and t-shirts for ages 5-8", quantity: "1 Bag (12 items)", status: "pending", claimedBy: null, distributionLocation: "" }
];

const MOCK_ELDERLY = [
  { id: "eld_1", elderlyName: "Savitri Devi (78 yrs)", helperType: "Groceries & Pharmacy run", location: "Koramangala 4th Block", details: "Needs monthly medicines refilled and wheat bag carried.", status: "assigned", helperId: "vol_2", helperName: "Priya Sharma", date: new Date().toISOString() }
];

const MOCK_ELDERLY_VISITS = [
  { id: "vis_1", requestId: "eld_1", notes: "Bought medicines from pharmacy, delivered and checked vitals. She is doing well.", volunteerName: "Priya Sharma", date: new Date().toISOString() }
];

const MOCK_TREES = [
  { id: "tree_1", driveTitle: "Clean Earth Lake Side Drive", location: "Koramangala Lake", volunteerName: "Rahul Kumar", treeName: "Rahul's Neem", status: "Healthy Sapling", survivalPhoto: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=60", date: new Date().toISOString() }
];

const MOCK_ANIMAL_RESCUES = [
  { id: "ani_1", animalType: "Stray Dog", injuryDetails: "Leg injury, limping near supermarket", location: "Indiranagar Double Road", reportedBy: "Amit Patel", status: "reported", rescuedBy: "", vetDetails: "", date: new Date().toISOString() }
];

const MOCK_CROWD = [
  { id: "crowd_1", title: "Rebuild Government Primary School Library", description: "Funds needed to purchase books, paint tables, and install bookshelves for 100 students.", targetAmount: 25000, currentAmount: 12500, organizerId: "ngo_1", organizerName: "Robin Hood Army", donations: [{ donorName: "Rahul Kumar", amount: 500 }], proofs: [] }
];

const MOCK_SOS = [
  { id: "sos_1", title: "Flooded Area Food Supply Run", description: "15 families stranded near low-lying Indiranagar area. Needs immediate dry ration kits.", severity: "critical", location: "Indiranagar 2nd Stage, near canal", status: "active", date: new Date().toISOString() }
];

const MOCK_MEDS = [
  { id: "med_1", medicineName: "Vitamin C Supplements 500mg", quantity: "10 boxes of 100 tablets", expiryDate: "2027-08-15", location: "Koramangala Pharmacy Hub", donorName: "Green Garden Cafe", status: "available", claimedBy: null }
];

const MOCK_REVIEWS = [
  { id: "rev_1", userName: "Golden Spoon Restaurant", userRole: "restaurant", rating: 5, category: "Ahaar Setu", text: "SevaSetu has made it so easy for our restaurant to donate leftover meals. We feel great knowing it goes to shelters instead of landfills!", date: new Date().toISOString() },
  { id: "rev_2", userName: "Rahul Kumar (Volunteer)", userRole: "volunteer", rating: 5, category: "Ahaar Setu", text: "Picked up 50 meal boxes from Green Garden Cafe and delivered to Indiranagar Shelter within 30 minutes! Prompt packaging and smooth process.", date: new Date().toISOString() },
  { id: "rev_3", userName: "Aarav Mehta", userRole: "volunteer", rating: 5, category: "Swachh Setu", text: "Organizing and participating in sanitation campaigns with Swachh Setu has brought our community together. Puffy graphics, points, and real impact!", date: new Date().toISOString() },
  { id: "rev_4", userName: "Priya Sharma", userRole: "volunteer", rating: 5, category: "Shiksha Setu", text: "Tutoring kids in the evening through Shiksha Setu is the highlight of my week. A must-join platform!", date: new Date().toISOString() }
];

// Local state initialization for Mock Fallback
const initializeLocalStorage = () => {
  if (!localStorage.getItem("sevasetu_users")) {
    localStorage.setItem("sevasetu_users", JSON.stringify(MOCK_USERS));
    localStorage.setItem("sevasetu_foods", JSON.stringify(MOCK_FOODS));
    localStorage.setItem("sevasetu_drives", JSON.stringify(MOCK_DRIVES));
    localStorage.setItem("sevasetu_vouchers", JSON.stringify(MOCK_VOUCHERS));
    localStorage.setItem("sevasetu_claims", JSON.stringify([]));
    localStorage.setItem("sevasetu_skills", JSON.stringify(MOCK_SKILLS));
    localStorage.setItem("sevasetu_crowd", JSON.stringify(MOCK_CROWD));
    localStorage.setItem("sevasetu_sos", JSON.stringify(MOCK_SOS));
    localStorage.setItem("sevasetu_meds", JSON.stringify(MOCK_MEDS));
    
    // Seed new arrays
    localStorage.setItem("sevasetu_tutors", JSON.stringify(MOCK_TUTORS));
    localStorage.setItem("sevasetu_tutor_requests", JSON.stringify(MOCK_TUTOR_REQUESTS));
    localStorage.setItem("sevasetu_camps", JSON.stringify(MOCK_CAMPS));
    localStorage.setItem("sevasetu_camps_reg", JSON.stringify([]));
    localStorage.setItem("sevasetu_clothes", JSON.stringify(MOCK_CLOTHES));
    localStorage.setItem("sevasetu_elderly", JSON.stringify(MOCK_ELDERLY));
    localStorage.setItem("sevasetu_elderly_visits", JSON.stringify(MOCK_ELDERLY_VISITS));
    localStorage.setItem("sevasetu_trees", JSON.stringify(MOCK_TREES));
    localStorage.setItem("sevasetu_animal_rescues", JSON.stringify(MOCK_ANIMAL_RESCUES));
    localStorage.setItem("sevasetu_reviews", JSON.stringify(MOCK_REVIEWS));
  } else {
    // Migration helper: refresh drives if missing dual before/after photo URLs
    const currentDrives = localStorage.getItem("sevasetu_drives");
    if (!currentDrives || !currentDrives.includes("||")) {
      localStorage.setItem("sevasetu_drives", JSON.stringify(MOCK_DRIVES));
    }
  }
};
initializeLocalStorage();

// --- LOCAL PUB-SUB SYSTEM ---
const localSubscriptions = {
  users: [],
  foods: [],
  drives: [],
  vouchers: [],
  claims: [],
  skills: [],
  crowd: [],
  sos: [],
  meds: [],
  tutors: [],
  tutor_requests: [],
  camps: [],
  camps_reg: [],
  clothes: [],
  elderly: [],
  elderly_visits: [],
  trees: [],
  animal_rescues: [],
  reviews: []
};

const notifySubscribers = (key, data) => {
  if (localSubscriptions[key]) {
    localSubscriptions[key].forEach(cb => cb(data));
  }
};

let currentLoggedInUser = JSON.parse(localStorage.getItem("sevasetu_current_user") || "null");
const authChangeListeners = [];

export const DB = {
  // 1. Auth Listeners & Methods
  onAuthChange(callback) {
    if (isConfigValid) {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
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
      authChangeListeners.push(callback);
      callback(currentLoggedInUser);
      return () => {
        const idx = authChangeListeners.indexOf(callback);
        if (idx !== -1) authChangeListeners.splice(idx, 1);
      };
    }
  },

  getCurrentUser() {
    return currentLoggedInUser;
  },

  async login(email, password) {
    if (isConfigValid) {
      const creds = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", creds.user.uid));
      const userData = { uid: creds.user.uid, ...snap.data() };
      currentLoggedInUser = userData;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(userData));
      return userData;
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const found = users.find(u => u.email === email);
      if (found) {
        currentLoggedInUser = found;
        localStorage.setItem("sevasetu_current_user", JSON.stringify(found));
        authChangeListeners.forEach(cb => cb(found));
        return found;
      }
      throw new Error("User credentials not found locally.");
    }
  },

  async forgotPassword(email) {
    if (isConfigValid) {
      await sendPasswordResetEmail(auth, email);
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const found = users.find(u => u.email === email);
      if (!found) {
        throw new Error("No account associated with this email address.");
      }
      console.log(`Mock reset password email sent to ${email}`);
    }
    return true;
  },

  async loginWithGoogle(role = "user") {
    if (isConfigValid) {
      const provider = new GoogleAuthProvider();
      const creds = await signInWithPopup(auth, provider);
      const userRef = doc(db, "users", creds.user.uid);
      const snap = await getDoc(userRef);
      let userData;
      if (snap.exists()) {
        userData = { uid: creds.user.uid, ...snap.data() };
      } else {
        const name = creds.user.displayName || "Google User";
        const email = creds.user.email;
        const userPayload = {
          name,
          email,
          role,
          completedCount: 0
        };
        if (role === "volunteer") {
          userPayload.rewardPoints = 0;
          userPayload.impactHours = 0;
          userPayload.ngoId = "";
        } else if (role === "restaurant") {
          userPayload.sevaPoints = 0;
          userPayload.address = "";
        }
        await setDoc(userRef, userPayload);
        userData = { uid: creds.user.uid, ...userPayload };
      }
      currentLoggedInUser = userData;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(userData));
      return userData;
    } else {
      const name = prompt("Enter mock user display name:", "Google User Mock") || "Google User Mock";
      const email = prompt("Enter mock user email:", "googleuser@gmail.com");
      if (!email) throw new Error("Google login cancelled.");
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      let found = users.find(u => u.email === email);
      if (!found) {
        const newUid = "uid_google_" + Math.random().toString(36).substr(2, 9);
        const userPayload = {
          name,
          email,
          role,
          completedCount: 0
        };
        if (role === "volunteer") {
          userPayload.rewardPoints = 0;
          userPayload.impactHours = 0;
          userPayload.ngoId = "";
        } else if (role === "restaurant") {
          userPayload.sevaPoints = 0;
          userPayload.address = "";
        }
        found = { uid: newUid, ...userPayload };
        users.push(found);
        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        notifySubscribers("users", users);
      }
      currentLoggedInUser = found;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(found));
      authChangeListeners.forEach(cb => cb(found));
      return found;
    }
  },

  async register(name, email, password, role, extraInfo = {}) {
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

    if (isConfigValid) {
      const creds = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", creds.user.uid), userPayload);
      const created = { uid: creds.user.uid, ...userPayload };
      currentLoggedInUser = created;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(created));
      return created;
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      if (users.some(u => u.email === email)) throw new Error("Email already registered.");
      
      const newUid = "uid_" + Math.random().toString(36).substr(2, 9);
      const created = { uid: newUid, ...userPayload };
      users.push(created);
      localStorage.setItem("sevasetu_users", JSON.stringify(users));
      currentLoggedInUser = created;
      localStorage.setItem("sevasetu_current_user", JSON.stringify(created));
      authChangeListeners.forEach(cb => cb(created));
      notifySubscribers("users", users);
      return created;
    }
  },

  async logout() {
    if (isConfigValid) {
      await signOut(auth);
    }
    currentLoggedInUser = null;
    localStorage.removeItem("sevasetu_current_user");
    authChangeListeners.forEach(cb => cb(null));
    return true;
  },

  // Helper to trigger profile updates locally
  triggerProfileSync(updatedUser) {
    currentLoggedInUser = updatedUser;
    localStorage.setItem("sevasetu_current_user", JSON.stringify(updatedUser));
    authChangeListeners.forEach(cb => cb(updatedUser));
  },

  // 2. Real-Time Collection Subscriptions
  subscribe(collectionName, callback) {
    if (isConfigValid) {
      return onSnapshot(collection(db, collectionName), (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(list);
      });
    } else {
      localSubscriptions[collectionName].push(callback);
      const currentVal = JSON.parse(localStorage.getItem(`sevasetu_${collectionName}`) || "[]");
      callback(currentVal);
      return () => {
        const idx = localSubscriptions[collectionName].indexOf(callback);
        if (idx !== -1) localSubscriptions[collectionName].splice(idx, 1);
      };
    }
  },

  // 3. Ahaar Setu (Food Waste)
  async createFoodPickup(foodType, quantity, expiryTime, location) {
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
      await addDoc(collection(db, "foods"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_foods") || "[]");
      list.unshift({ id: "food_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_foods", JSON.stringify(list));
      notifySubscribers("foods", list);
    }
  },

  async claimFoodPickup(id) {
    if (isConfigValid) {
      const ref = doc(db, "foods", id);
      await updateDoc(ref, {
        status: "claimed",
        claimedBy: currentLoggedInUser.uid,
        claimedByName: currentLoggedInUser.name
      });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_foods") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].status === "pending") {
        list[idx].status = "claimed";
        list[idx].claimedBy = currentLoggedInUser.uid;
        list[idx].claimedByName = currentLoggedInUser.name;
        localStorage.setItem("sevasetu_foods", JSON.stringify(list));
        notifySubscribers("foods", list);
      }
    }
  },

  async completeFoodPickup(id, feedback) {
    if (isConfigValid) {
      const ref = doc(db, "foods", id);
      const snap = await getDoc(ref);
      const pickup = snap.data();
      
      await updateDoc(ref, { status: "completed", feedback });
      
      // Update points
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 30,
        completedCount: (currentLoggedInUser.completedCount || 0) + 1,
        impactHours: (currentLoggedInUser.impactHours || 0) + 2
      });
      const updatedVolSnap = await getDoc(volRef);
      this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...updatedVolSnap.data() });

      const restRef = doc(db, "users", pickup.restaurantId);
      const restSnap = await getDoc(restRef);
      if (restSnap.exists()) {
        await updateDoc(restRef, {
          sevaPoints: (restSnap.data().sevaPoints || 0) + 50,
          completedCount: (restSnap.data().completedCount || 0) + 1
        });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_foods") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].claimedBy === currentLoggedInUser.uid) {
        list[idx].status = "completed";
        list[idx].feedback = feedback;
        localStorage.setItem("sevasetu_foods", JSON.stringify(list));
        notifySubscribers("foods", list);

        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        // Update volunteer
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += 30;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += 2;
          this.triggerProfileSync(users[vIdx]);
        }
        // Update restaurant
        const rIdx = users.findIndex(u => u.uid === list[idx].restaurantId);
        if (rIdx !== -1) {
          users[rIdx].sevaPoints += 50;
          users[rIdx].completedCount += 1;
        }
        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        notifySubscribers("users", users);
      }
    }
  },

  // 4. Swachh Setu (Cleanups)
  async createCleanupDrive(title, description, date, time, location, points) {
    const payload = {
      title,
      description,
      date,
      time,
      location,
      organizerId: currentLoggedInUser.uid,
      organizerName: currentLoggedInUser.name,
      pointsReward: parseInt(points) || 50,
      participants: [],
      proofs: []
    };
    if (isConfigValid) {
      await addDoc(collection(db, "drives"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_drives") || "[]");
      list.unshift({ id: "drive_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_drives", JSON.stringify(list));
      notifySubscribers("drives", list);
    }
  },

  async joinCleanupDrive(id) {
    if (isConfigValid) {
      const ref = doc(db, "drives", id);
      const snap = await getDoc(ref);
      const parts = snap.data().participants || [];
      if (!parts.includes(currentLoggedInUser.uid)) {
        parts.push(currentLoggedInUser.uid);
        await updateDoc(ref, { participants: parts });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_drives") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        if (!list[idx].participants.includes(currentLoggedInUser.uid)) {
          list[idx].participants.push(currentLoggedInUser.uid);
          localStorage.setItem("sevasetu_drives", JSON.stringify(list));
          notifySubscribers("drives", list);
        }
      }
    }
  },

  async submitDriveProof(id, imageUrl) {
    const proof = {
      volunteerId: currentLoggedInUser.uid,
      volunteerName: currentLoggedInUser.name,
      imageUrl,
      approved: false
    };
    if (isConfigValid) {
      const ref = doc(db, "drives", id);
      const snap = await getDoc(ref);
      const proofs = snap.data().proofs || [];
      const updated = proofs.filter(p => p.volunteerId !== currentLoggedInUser.uid);
      updated.push(proof);
      await updateDoc(ref, { proofs: updated });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_drives") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        const proofs = list[idx].proofs || [];
        const updated = proofs.filter(p => p.volunteerId !== currentLoggedInUser.uid);
        updated.push(proof);
        list[idx].proofs = updated;
        localStorage.setItem("sevasetu_drives", JSON.stringify(list));
        notifySubscribers("drives", list);
      }
    }
  },

  // 5. Sahaayak Setu (NGOs Directory)
  async joinNGO(ngoId) {
    if (isConfigValid) {
      await updateDoc(doc(db, "users", currentLoggedInUser.uid), { ngoId });
      
      const ngoRef = doc(db, "users", ngoId);
      const ngoSnap = await getDoc(ngoRef);
      const vols = ngoSnap.data().volunteers || [];
      if (!vols.includes(currentLoggedInUser.uid)) {
        vols.push(currentLoggedInUser.uid);
        await updateDoc(ngoRef, { volunteers: vols });
      }
      this.triggerProfileSync({ ...currentLoggedInUser, ngoId });
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
        this.triggerProfileSync(users[vIdx]);
        notifySubscribers("users", users);
      }
    }
  },

  async approveDriveProof(driveId, volunteerId) {
    if (isConfigValid) {
      const ref = doc(db, "drives", driveId);
      const snap = await getDoc(ref);
      const drive = snap.data();
      const reward = drive.pointsReward || 50;

      const proofs = (drive.proofs || []).map(p => {
        if (p.volunteerId === volunteerId) return { ...p, approved: true };
        return p;
      });
      await updateDoc(ref, { proofs });

      const volRef = doc(db, "users", volunteerId);
      const volSnap = await getDoc(volRef);
      const volData = volSnap.data();
      await updateDoc(volRef, {
        rewardPoints: (volData.rewardPoints || 0) + reward,
        completedCount: (volData.completedCount || 0) + 1,
        impactHours: (volData.impactHours || 0) + 3
      });

      if (currentLoggedInUser.uid === volunteerId) {
        this.triggerProfileSync({ uid: volunteerId, ...volData, rewardPoints: volData.rewardPoints + reward, completedCount: volData.completedCount + 1, impactHours: volData.impactHours + 3 });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_drives") || "[]");
      const idx = list.findIndex(item => item.id === driveId);
      if (idx !== -1) {
        const reward = list[idx].pointsReward || 50;
        list[idx].proofs = list[idx].proofs.map(p => {
          if (p.volunteerId === volunteerId) return { ...p, approved: true };
          return p;
        });
        localStorage.setItem("sevasetu_drives", JSON.stringify(list));
        notifySubscribers("drives", list);

        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === volunteerId);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += reward;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += 3;
          localStorage.setItem("sevasetu_users", JSON.stringify(users));
          notifySubscribers("users", users);
          if (currentLoggedInUser.uid === volunteerId) {
            this.triggerProfileSync(users[vIdx]);
          }
        }
      }
    }
  },

  // 6. Rewards Store
  async redeemVoucher(voucherId) {
    if (isConfigValid) {
      const vRef = doc(db, "vouchers", voucherId);
      const vSnap = await getDoc(vRef);
      const cost = vSnap.data().pointsCost;

      if ((currentLoggedInUser.rewardPoints || 0) < cost) throw new Error("Insufficient points.");

      const code = vSnap.data().partner.toUpperCase() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: currentLoggedInUser.rewardPoints - cost
      });

      await addDoc(collection(db, "claims"), {
        volunteerId: currentLoggedInUser.uid,
        voucherId,
        voucherTitle: vSnap.data().title,
        partner: vSnap.data().partner,
        code,
        date: new Date().toISOString()
      });

      const updated = await getDoc(volRef);
      this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...updated.data() });
      return code;
    } else {
      const vouchers = JSON.parse(localStorage.getItem("sevasetu_vouchers") || "[]");
      const voucher = vouchers.find(v => v.id === voucherId);
      if (!voucher) throw new Error("Voucher not found.");
      if ((currentLoggedInUser.rewardPoints || 0) < voucher.pointsCost) throw new Error("Insufficient points.");

      const code = voucher.partner.toUpperCase() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();

      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
      if (vIdx !== -1) {
        users[vIdx].rewardPoints -= voucher.pointsCost;
        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        this.triggerProfileSync(users[vIdx]);
        notifySubscribers("users", users);

        const claims = JSON.parse(localStorage.getItem("sevasetu_claims") || "[]");
        claims.push({
          id: "claim_" + Date.now(),
          volunteerId: currentLoggedInUser.uid,
          voucherId,
          voucherTitle: voucher.title,
          partner: voucher.partner,
          code,
          date: new Date().toISOString()
        });
        localStorage.setItem("sevasetu_claims", JSON.stringify(claims));
        notifySubscribers("claims", claims);
        return code;
      }
    }
  },

  // 7. Skill-Based volunteering
  async createSkillTask(title, description, requiredSkill, hours, points) {
    const payload = {
      title,
      description,
      requiredSkill,
      hoursReward: parseInt(hours) || 2,
      pointsReward: parseInt(points) || 40,
      organizerId: currentLoggedInUser.uid,
      organizerName: currentLoggedInUser.name,
      status: "open",
      assignedTo: null,
      workLink: ""
    };
    if (isConfigValid) {
      await addDoc(collection(db, "skills"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_skills") || "[]");
      list.unshift({ id: "skill_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_skills", JSON.stringify(list));
      notifySubscribers("skills", list);
    }
  },

  async applyToSkillTask(id) {
    if (isConfigValid) {
      await updateDoc(doc(db, "skills", id), {
        status: "assigned",
        assignedTo: currentLoggedInUser.uid,
        assignedToName: currentLoggedInUser.name
      });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_skills") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].status === "open") {
        list[idx].status = "assigned";
        list[idx].assignedTo = currentLoggedInUser.uid;
        list[idx].assignedToName = currentLoggedInUser.name;
        localStorage.setItem("sevasetu_skills", JSON.stringify(list));
        notifySubscribers("skills", list);
      }
    }
  },

  async completeSkillTask(id, workLink) {
    if (isConfigValid) {
      const ref = doc(db, "skills", id);
      const snap = await getDoc(ref);
      const task = snap.data();

      await updateDoc(ref, { status: "completed", workLink });

      const volRef = doc(db, "users", task.assignedTo);
      const volSnap = await getDoc(volRef);
      const volData = volSnap.data();
      await updateDoc(volRef, {
        rewardPoints: (volData.rewardPoints || 0) + task.pointsReward,
        completedCount: (volData.completedCount || 0) + 1,
        impactHours: (volData.impactHours || 0) + task.hoursReward
      });

      if (currentLoggedInUser.uid === task.assignedTo) {
        this.triggerProfileSync({ uid: task.assignedTo, ...volData, rewardPoints: volData.rewardPoints + task.pointsReward, completedCount: volData.completedCount + 1, impactHours: volData.impactHours + task.hoursReward });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_skills") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].assignedTo === currentLoggedInUser.uid) {
        list[idx].status = "completed";
        list[idx].workLink = workLink;
        localStorage.setItem("sevasetu_skills", JSON.stringify(list));
        notifySubscribers("skills", list);

        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += list[idx].pointsReward;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += list[idx].hoursReward;
          localStorage.setItem("sevasetu_users", JSON.stringify(users));
          notifySubscribers("users", users);
          this.triggerProfileSync(users[vIdx]);
        }
      }
    }
  },

  // 8. Donation & Crowdfunding
  async createCampaign(title, description, targetAmount) {
    const payload = {
      title,
      description,
      targetAmount: parseInt(targetAmount) || 10000,
      currentAmount: 0,
      organizerId: currentLoggedInUser.uid,
      organizerName: currentLoggedInUser.name,
      donations: [],
      proofs: []
    };
    if (isConfigValid) {
      await addDoc(collection(db, "crowd"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_crowd") || "[]");
      list.unshift({ id: "crowd_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_crowd", JSON.stringify(list));
      notifySubscribers("crowd", list);
    }
  },

  async donateToCampaign(id, amount) {
    const donorName = currentLoggedInUser ? currentLoggedInUser.name : "Anonymous Donor";
    const parsedAmount = parseInt(amount) || 100;
    
    if (isConfigValid) {
      const ref = doc(db, "crowd", id);
      const snap = await getDoc(ref);
      const data = snap.data();
      const dons = data.donations || [];
      dons.push({ donorName, amount: parsedAmount });
      await updateDoc(ref, {
        currentAmount: (data.currentAmount || 0) + parsedAmount,
        donations: dons
      });

      // Award donor points if logged in (+10 points per 100 Rs donation)
      if (currentLoggedInUser) {
        const points = Math.floor(parsedAmount / 10);
        const uRef = doc(db, "users", currentLoggedInUser.uid);
        const uSnap = await getDoc(uRef);
        await updateDoc(uRef, {
          rewardPoints: (uSnap.data().rewardPoints || 0) + points
        });
        this.triggerProfileSync({ ...currentLoggedInUser, rewardPoints: (currentLoggedInUser.rewardPoints || 0) + points });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_crowd") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx].currentAmount += parsedAmount;
        list[idx].donations.push({ donorName, amount: parsedAmount });
        localStorage.setItem("sevasetu_crowd", JSON.stringify(list));
        notifySubscribers("crowd", list);

        if (currentLoggedInUser) {
          const points = Math.floor(parsedAmount / 10);
          const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
          const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
          if (vIdx !== -1) {
            users[vIdx].rewardPoints += points;
            localStorage.setItem("sevasetu_users", JSON.stringify(users));
            notifySubscribers("users", users);
            this.triggerProfileSync(users[vIdx]);
          }
        }
      }
    }
  },

  async uploadCampaignProof(id, imageUrl, description) {
    const proof = {
      imageUrl,
      description,
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      const ref = doc(db, "crowd", id);
      const snap = await getDoc(ref);
      const proofs = snap.data().proofs || [];
      proofs.push(proof);
      await updateDoc(ref, { proofs });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_crowd") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        const proofs = list[idx].proofs || [];
        proofs.push(proof);
        list[idx].proofs = proofs;
        localStorage.setItem("sevasetu_crowd", JSON.stringify(list));
        notifySubscribers("crowd", list);
      }
    }
  },

  // 9. Emergency SOS
  async broadcastSOS(title, description, severity, location) {
    const payload = {
      title,
      description,
      severity,
      location,
      organizerId: null,
      status: "active",
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "sos"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_sos") || "[]");
      list.unshift({ id: "sos_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_sos", JSON.stringify(list));
      notifySubscribers("sos", list);
    }
  },

  async resolveSOS(id) {
    if (isConfigValid) {
      await updateDoc(doc(db, "sos", id), { status: "resolved" });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_sos") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx].status = "resolved";
        localStorage.setItem("sevasetu_sos", JSON.stringify(list));
        notifySubscribers("sos", list);
      }
    }
  },

  // 10. Medicine Redistribution
  async donateMedicine(medicineName, quantity, expiryDate, location) {
    const payload = {
      medicineName,
      quantity,
      expiryDate,
      location,
      donorName: currentLoggedInUser ? currentLoggedInUser.name : "Anonymous Donor",
      status: "available",
      claimedBy: null
    };
    if (isConfigValid) {
      await addDoc(collection(db, "meds"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_meds") || "[]");
      list.unshift({ id: "med_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_meds", JSON.stringify(list));
      notifySubscribers("meds", list);
    }
  },

  async claimMedicine(id) {
    if (isConfigValid) {
      await updateDoc(doc(db, "meds", id), {
        status: "claimed",
        claimedBy: currentLoggedInUser.uid
      });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_meds") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].status === "available") {
        list[idx].status = "claimed";
        list[idx].claimedBy = currentLoggedInUser.uid;
        localStorage.setItem("sevasetu_meds", JSON.stringify(list));
        notifySubscribers("meds", list);
      }
    }
  },

  // 11. Leaderboard (Synchronous calculation from live lists)
  async getLeaderboard() {
    const usersList = isConfigValid
      ? (await getDocs(collection(db, "users"))).docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      : JSON.parse(localStorage.getItem("sevasetu_users") || "[]");

    const volunteers = usersList
      .filter(u => u.role === "volunteer")
      .sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0));

    const restaurants = usersList
      .filter(u => u.role === "restaurant")
      .sort((a, b) => (b.sevaPoints || 0) - (a.sevaPoints || 0));

    return { volunteers, restaurants };
  },

  // 12. Shiksha Setu (Education Support)
  async registerTutor(subject, availability, location) {
    const payload = {
      tutorId: currentLoggedInUser.uid,
      name: currentLoggedInUser.name,
      subject,
      availability,
      location,
      pointsEarned: 0
    };
    if (isConfigValid) {
      await addDoc(collection(db, "tutors"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_tutors") || "[]");
      list.unshift({ id: "tut_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_tutors", JSON.stringify(list));
      notifySubscribers("tutors", list);
    }
  },

  async createTutorRequest(childName, parentName, subject, location, details) {
    const payload = {
      childName,
      parentName,
      subject,
      location,
      details,
      status: "pending",
      matchedTutor: "",
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "tutor_requests"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_tutor_requests") || "[]");
      list.unshift({ id: "req_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_tutor_requests", JSON.stringify(list));
      notifySubscribers("tutor_requests", list);
    }
  },

  async matchTutorToRequest(requestId, tutorName) {
    if (isConfigValid) {
      const ref = doc(db, "tutor_requests", requestId);
      await updateDoc(ref, { status: "matched", matchedTutor: tutorName });
      // Award volunteer points
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 40,
        completedCount: (currentLoggedInUser.completedCount || 0) + 1,
        impactHours: (currentLoggedInUser.impactHours || 0) + 2
      });
      const snap = await getDoc(volRef);
      this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...snap.data() });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_tutor_requests") || "[]");
      const idx = list.findIndex(item => item.id === requestId);
      if (idx !== -1) {
        list[idx].status = "matched";
        list[idx].matchedTutor = tutorName;
        localStorage.setItem("sevasetu_tutor_requests", JSON.stringify(list));
        notifySubscribers("tutor_requests", list);

        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += 40;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += 2;
          localStorage.setItem("sevasetu_users", JSON.stringify(users));
          notifySubscribers("users", users);
          this.triggerProfileSync(users[vIdx]);
        }
      }
    }
  },

  // 13. Swasthya Setu (Medical Camps)
  async createMedicalCamp(title, location, date, description) {
    const payload = {
      title,
      location,
      date,
      description,
      doctors: [],
      patientsCount: 0,
      status: "scheduled",
      report: ""
    };
    if (isConfigValid) {
      await addDoc(collection(db, "camps"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_camps") || "[]");
      list.unshift({ id: "camp_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_camps", JSON.stringify(list));
      notifySubscribers("camps", list);
    }
  },

  async registerDoctorForCamp(campId, doctorName) {
    if (isConfigValid) {
      const ref = doc(db, "camps", campId);
      const snap = await getDoc(ref);
      const docs = snap.data().doctors || [];
      if (!docs.includes(doctorName)) {
        docs.push(doctorName);
        await updateDoc(ref, { doctors: docs });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_camps") || "[]");
      const idx = list.findIndex(item => item.id === campId);
      if (idx !== -1) {
        if (!list[idx].doctors.includes(doctorName)) {
          list[idx].doctors.push(doctorName);
          localStorage.setItem("sevasetu_camps", JSON.stringify(list));
          notifySubscribers("camps", list);
        }
      }
    }
  },

  async registerPatientForCamp(campId, patientName, patientAge) {
    const payload = {
      campId,
      patientName,
      patientAge,
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "camps_reg"), payload);
      // Increment patient count on camp
      const campRef = doc(db, "camps", campId);
      const campSnap = await getDoc(campRef);
      await updateDoc(campRef, { patientsCount: (campSnap.data().patientsCount || 0) + 1 });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_camps_reg") || "[]");
      list.push({ id: "reg_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_camps_reg", JSON.stringify(list));
      notifySubscribers("camps_reg", list);

      const camps = JSON.parse(localStorage.getItem("sevasetu_camps") || "[]");
      const idx = camps.findIndex(c => c.id === campId);
      if (idx !== -1) {
        camps[idx].patientsCount += 1;
        localStorage.setItem("sevasetu_camps", JSON.stringify(camps));
        notifySubscribers("camps", camps);
      }
    }
  },

  async submitCampReport(campId, reportSummary) {
    if (isConfigValid) {
      const ref = doc(db, "camps", campId);
      await updateDoc(ref, { status: "completed", report: reportSummary });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_camps") || "[]");
      const idx = list.findIndex(item => item.id === campId);
      if (idx !== -1) {
        list[idx].status = "completed";
        list[idx].report = reportSummary;
        localStorage.setItem("sevasetu_camps", JSON.stringify(list));
        notifySubscribers("camps", list);
      }
    }
  },

  // 14. Vastra Setu (Clothes & Essentials)
  async listClothesDonation(category, details, quantity) {
    const payload = {
      donorName: currentLoggedInUser ? currentLoggedInUser.name : "Anonymous Donor",
      category,
      details,
      quantity,
      status: "pending",
      claimedBy: null,
      distributionLocation: ""
    };
    if (isConfigValid) {
      await addDoc(collection(db, "clothes"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_clothes") || "[]");
      list.unshift({ id: "cl_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_clothes", JSON.stringify(list));
      notifySubscribers("clothes", list);
    }
  },

  async claimClothesPickup(id) {
    if (isConfigValid) {
      const ref = doc(db, "clothes", id);
      await updateDoc(ref, {
        status: "claimed",
        claimedBy: currentLoggedInUser.uid,
        claimedByName: currentLoggedInUser.name
      });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_clothes") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].status === "pending") {
        list[idx].status = "claimed";
        list[idx].claimedBy = currentLoggedInUser.uid;
        list[idx].claimedByName = currentLoggedInUser.name;
        localStorage.setItem("sevasetu_clothes", JSON.stringify(list));
        notifySubscribers("clothes", list);
      }
    }
  },

  async distributeClothes(id, distributionLocation) {
    if (isConfigValid) {
      const ref = doc(db, "clothes", id);
      await updateDoc(ref, { status: "completed", distributionLocation });
      // Award volunteer points
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 35,
        completedCount: (currentLoggedInUser.completedCount || 0) + 1,
        impactHours: (currentLoggedInUser.impactHours || 0) + 2
      });
      const snap = await getDoc(volRef);
      this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...snap.data() });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_clothes") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].claimedBy === currentLoggedInUser.uid) {
        list[idx].status = "completed";
        list[idx].distributionLocation = distributionLocation;
        localStorage.setItem("sevasetu_clothes", JSON.stringify(list));
        notifySubscribers("clothes", list);

        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += 35;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += 2;
          localStorage.setItem("sevasetu_users", JSON.stringify(users));
          notifySubscribers("users", users);
          this.triggerProfileSync(users[vIdx]);
        }
      }
    }
  },

  // 15. Punya Setu (Elderly Care Connect)
  async requestElderlyHelper(elderlyName, age, helperType, location, details) {
    const payload = {
      elderlyName,
      age: parseInt(age) || 70,
      helperType,
      location,
      details,
      status: "pending",
      helperId: null,
      helperName: "",
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "elderly"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_elderly") || "[]");
      list.unshift({ id: "eld_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_elderly", JSON.stringify(list));
      notifySubscribers("elderly", list);
    }
  },

  async claimElderlyHelp(id) {
    if (isConfigValid) {
      const ref = doc(db, "elderly", id);
      await updateDoc(ref, {
        status: "assigned",
        helperId: currentLoggedInUser.uid,
        helperName: currentLoggedInUser.name
      });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_elderly") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].status === "pending") {
        list[idx].status = "assigned";
        list[idx].helperId = currentLoggedInUser.uid;
        list[idx].helperName = currentLoggedInUser.name;
        localStorage.setItem("sevasetu_elderly", JSON.stringify(list));
        notifySubscribers("elderly", list);
      }
    }
  },

  async logElderlyVisit(requestId, notes) {
    const payload = {
      requestId,
      notes,
      volunteerName: currentLoggedInUser.name,
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "elderly_visits"), payload);
      const ref = doc(db, "elderly", requestId);
      await updateDoc(ref, { status: "completed" });
      // Award volunteer points
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 50,
        completedCount: (currentLoggedInUser.completedCount || 0) + 1,
        impactHours: (currentLoggedInUser.impactHours || 0) + 3
      });
      const snap = await getDoc(volRef);
      this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...snap.data() });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_elderly_visits") || "[]");
      list.unshift({ id: "vis_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_elderly_visits", JSON.stringify(list));
      notifySubscribers("elderly_visits", list);

      const requests = JSON.parse(localStorage.getItem("sevasetu_elderly") || "[]");
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].status = "completed";
        localStorage.setItem("sevasetu_elderly", JSON.stringify(requests));
        notifySubscribers("elderly", requests);

        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += 50;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += 3;
          localStorage.setItem("sevasetu_users", JSON.stringify(users));
          notifySubscribers("users", users);
          this.triggerProfileSync(users[vIdx]);
        }
      }
    }
  },

  // 16. Vriksha Setu (Tree Plantation)
  async plantVirtualTree(driveTitle, location, treeName) {
    const payload = {
      driveTitle,
      location,
      volunteerName: currentLoggedInUser ? currentLoggedInUser.name : "Anonymous Planter",
      treeName,
      status: "Healthy Sapling",
      survivalPhoto: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=60",
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "trees"), payload);
      if (currentLoggedInUser) {
        const volRef = doc(db, "users", currentLoggedInUser.uid);
        await updateDoc(volRef, {
          rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 20,
          completedCount: (currentLoggedInUser.completedCount || 0) + 1,
          impactHours: (currentLoggedInUser.impactHours || 0) + 1
        });
        const snap = await getDoc(volRef);
        this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...snap.data() });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_trees") || "[]");
      list.unshift({ id: "tree_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_trees", JSON.stringify(list));
      notifySubscribers("trees", list);

      if (currentLoggedInUser) {
        const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
        const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
        if (vIdx !== -1) {
          users[vIdx].rewardPoints += 20;
          users[vIdx].completedCount += 1;
          users[vIdx].impactHours += 1;
          localStorage.setItem("sevasetu_users", JSON.stringify(users));
          notifySubscribers("users", users);
          this.triggerProfileSync(users[vIdx]);
        }
      }
    }
  },

  async updateTreeGrowthStatus(id, survivalPhoto, status) {
    if (isConfigValid) {
      const ref = doc(db, "trees", id);
      await updateDoc(ref, { survivalPhoto, status });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_trees") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1) {
        list[idx].survivalPhoto = survivalPhoto;
        list[idx].status = status;
        localStorage.setItem("sevasetu_trees", JSON.stringify(list));
        notifySubscribers("trees", list);
      }
    }
  },

  // 17. Pashu Setu (Animal Welfare)
  async reportAnimalInjury(animalType, injuryDetails, location, photoUrl) {
    const payload = {
      animalType,
      injuryDetails,
      location,
      reportedBy: currentLoggedInUser ? currentLoggedInUser.name : "Anonymous Reporter",
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=60",
      status: "reported",
      rescuedBy: "",
      vetDetails: "",
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await addDoc(collection(db, "animal_rescues"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_animal_rescues") || "[]");
      list.unshift({ id: "ani_" + Date.now(), ...payload });
      localStorage.setItem("sevasetu_animal_rescues", JSON.stringify(list));
      notifySubscribers("animal_rescues", list);
    }
  },

  async claimAnimalRescue(id, rescuerName) {
    if (isConfigValid) {
      const ref = doc(db, "animal_rescues", id);
      await updateDoc(ref, { status: "rescued", rescuedBy: rescuerName, vetDetails: "Animal Welfare Shelter Clinic" });
      if (currentLoggedInUser) {
        const volRef = doc(db, "users", currentLoggedInUser.uid);
        await updateDoc(volRef, {
          rewardPoints: (currentLoggedInUser.rewardPoints || 0) + 40,
          completedCount: (currentLoggedInUser.completedCount || 0) + 1,
          impactHours: (currentLoggedInUser.impactHours || 0) + 2
        });
        const snap = await getDoc(volRef);
        this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...snap.data() });
      }
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_animal_rescues") || "[]");
      const idx = list.findIndex(item => item.id === id);
      if (idx !== -1 && list[idx].status === "reported") {
        list[idx].status = "rescued";
        list[idx].rescuedBy = rescuerName;
        list[idx].vetDetails = "Animal Welfare Shelter Clinic";
        localStorage.setItem("sevasetu_animal_rescues", JSON.stringify(list));
        notifySubscribers("animal_rescues", list);

        if (currentLoggedInUser) {
          const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
          const vIdx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
          if (vIdx !== -1) {
            users[vIdx].rewardPoints += 40;
            users[vIdx].completedCount += 1;
            users[vIdx].impactHours += 2;
            localStorage.setItem("sevasetu_users", JSON.stringify(users));
            notifySubscribers("users", users);
            this.triggerProfileSync(users[vIdx]);
          }
        }
      }
    }
  },

  async upgradeToVolunteer() {
    if (!currentLoggedInUser) throw new Error("No user is currently logged in.");
    if (isConfigValid) {
      const volRef = doc(db, "users", currentLoggedInUser.uid);
      await updateDoc(volRef, {
        role: "volunteer",
        rewardPoints: 0,
        completedCount: 0,
        impactHours: 0,
        ngoId: ""
      });
      const snap = await getDoc(volRef);
      this.triggerProfileSync({ uid: currentLoggedInUser.uid, ...snap.data() });
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const idx = users.findIndex(u => u.uid === currentLoggedInUser.uid);
      if (idx !== -1) {
        users[idx].role = "volunteer";
        users[idx].rewardPoints = 0;
        users[idx].completedCount = 0;
        users[idx].impactHours = 0;
        users[idx].ngoId = "";
        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        this.triggerProfileSync(users[idx]);
        notifySubscribers("users", users);
      }
    }
  },

  async submitReview(userName, rating, category, text, userRole = "user") {
    const payload = {
      userName,
      userRole,
      rating: parseInt(rating),
      category,
      text,
      date: new Date().toISOString()
    };
    if (isConfigValid) {
      await fbAddDoc(collection(db, "reviews"), payload);
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_reviews") || "[]");
      list.push({ id: Date.now().toString(), ...payload });
      localStorage.setItem("sevasetu_reviews", JSON.stringify(list));
      notifySubscribers("reviews", list);
    }
  },

  async updateDeliveryLocation(foodId, lat, lng, speed = 0) {
    const courierLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed || 0),
      timestamp: new Date().toISOString()
    };

    if (isConfigValid) {
      await fbUpdateDoc(doc(db, "foods", foodId), { courierLocation });
    } else {
      const list = JSON.parse(localStorage.getItem("sevasetu_foods") || "[]");
      const idx = list.findIndex(f => f.id === foodId);
      if (idx !== -1) {
        list[idx].courierLocation = courierLocation;
        localStorage.setItem("sevasetu_foods", JSON.stringify(list));
        notifySubscribers("foods", list);
      }
    }
  },

  async updateUserProfile(name) {
    if (!currentLoggedInUser) throw new Error("No user is logged in.");
    const uid = currentLoggedInUser.uid;
    const updatedUser = { ...currentLoggedInUser, name };

    if (isConfigValid) {
      await fbUpdateDoc(doc(db, "users", uid), { name });
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        users[idx].name = name;
        localStorage.setItem("sevasetu_users", JSON.stringify(users));
        notifySubscribers("users", users);
      }
    }

    currentLoggedInUser = updatedUser;
    localStorage.setItem("sevasetu_current_user", JSON.stringify(updatedUser));
    authChangeListeners.forEach(cb => cb(updatedUser));
    this.triggerProfileSync(updatedUser);
  },

  async deleteUserAccount() {
    if (!currentLoggedInUser) throw new Error("No user is logged in.");
    const uid = currentLoggedInUser.uid;

    if (isConfigValid) {
      await fbDeleteDoc(doc(db, "users", uid));
      const fbUser = auth.currentUser;
      if (fbUser) {
        await fbUser.delete();
      }
    } else {
      const users = JSON.parse(localStorage.getItem("sevasetu_users") || "[]");
      const filtered = users.filter(u => u.uid !== uid);
      localStorage.setItem("sevasetu_users", JSON.stringify(filtered));
      notifySubscribers("users", filtered);
    }

    currentLoggedInUser = null;
    localStorage.removeItem("sevasetu_current_user");
    authChangeListeners.forEach(cb => cb(null));
  }
}

