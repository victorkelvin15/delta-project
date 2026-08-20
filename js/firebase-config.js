/* =============================================================================
 * Delta Properties Registry — Firebase / Firestore configuration & data layer
 * =============================================================================
 *
 * This file initializes Firebase and exposes a global `DeltaDB` helper object
 * that every page (registry.html, admin.html, public.html) uses to talk to
 * Cloud Firestore. It uses the Firebase "compat" SDK so that plain, non-module
 * <script> files and inline onclick="" handlers keep working without a bundler.
 *
 * -----------------------------------------------------------------------------
 * 1. HOW TO ADD YOUR CREDENTIALS
 * -----------------------------------------------------------------------------
 * Go to Firebase Console -> Project settings -> "Your apps" -> Web app config,
 * then paste the values into `firebaseConfig` below. All fields are required
 * except measurementId (only used if you enable Analytics).
 *
 * -----------------------------------------------------------------------------
 * 2. FIRESTORE DATA MODEL (collection: "properties")
 * -----------------------------------------------------------------------------
 * Each property is one document. The document ID is the reference number
 * (e.g. "DP-2026-000123"). Fields:
 *
 *   id            string   Reference number (same as the document ID)
 *   status        string   PENDING | UNDER REVIEW | CORRECTION REQUIRED |
 *                          VERIFIED | REJECTED | PUBLISHED
 *   verified      boolean  true once an admin verifies it
 *   published     boolean  true once an admin publishes it (public visibility)
 *
 *   // Owner information
 *   owner         string   Owner full name (alias of ownerName)
 *   ownerName     string
 *   phone         string
 *   email         string   Used as the owner's identity for "My Properties"
 *   idType        string   NIN | Passport | Drivers | Voters | ...
 *   idNumber      string
 *   address       string   Owner contact address
 *
 *   // Property details
 *   title         string   Property title (alias of propTitle)
 *   propTitle     string
 *   type          string   Residential | Commercial | Land | House | ...
 *   purpose       string   Residential | Commercial | ...
 *   bedrooms      number
 *   bathrooms     number
 *   floors        number
 *   description   string
 *   yearBuilt     string|number
 *   condition     string
 *
 *   // Location
 *   state         string
 *   lga           string
 *   city          string
 *   area          string
 *   street        string
 *   house         string
 *   landmark      string
 *   fullAddress   string
 *   lat           number
 *   lng           number
 *   mapPin        string
 *
 *   // Media (counts / primary image URL)
 *   image         string   Primary image URL (used on cards)
 *   images        number   Count of uploaded images
 *   docs          number   Count of uploaded documents
 *
 *   // Timestamps / meta
 *   submitted     string   ISO date the owner submitted
 *   createdAt     Timestamp Firestore server timestamp (for ordering)
 *   updatedAt     Timestamp Firestore server timestamp
 *   correctionNote string  Latest correction note (if any)
 *
 * A second collection "history" stores the admin audit trail:
 *   property (id), action, note, admin, at (ISO), createdAt (server ts)
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/* 1) YOUR FIREBASE CREDENTIALS — REPLACE THESE VALUES                        */
/* -------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "G-XXXXXXXXXX" // optional (Analytics)
};

/* -------------------------------------------------------------------------- */
/* 2) INITIALIZE FIREBASE + FIRESTORE                                         */
/* -------------------------------------------------------------------------- */
let db = null;
let firebaseReady = false;

// True only when the config still holds the shipped placeholder values.
const configHasPlaceholders =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.indexOf("YOUR_") === 0 ||
  firebaseConfig.projectId.indexOf("YOUR_") === 0;

try {
  if (typeof firebase === "undefined") {
    throw new Error(
      "Firebase SDK not loaded. Make sure the firebase-app-compat.js and " +
      "firebase-firestore-compat.js <script> tags are included BEFORE firebase-config.js."
    );
  }
  if (configHasPlaceholders) {
    throw new Error(
      "Firebase credentials not set. Edit js/firebase-config.js and paste your " +
      "project's config from Firebase Console → Project settings → Your apps."
    );
  }
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  firebaseReady = true;
  console.log("[DeltaDB] Firebase initialized for project:", firebaseConfig.projectId);
} catch (err) {
  console.error("[DeltaDB] Firebase initialization failed:", err.message);
}

const PROPERTIES_COLLECTION = "properties";
const HISTORY_COLLECTION = "history";

/* -------------------------------------------------------------------------- */
/* 3) DATA ACCESS LAYER — global `DeltaDB` object (CRUD + realtime helpers)    */
/* -------------------------------------------------------------------------- */
const DeltaDB = {
  /** True when Firebase initialized successfully. */
  isReady() {
    return firebaseReady && db !== null;
  },

  /* ---------------------------- CREATE ---------------------------- */
  /**
   * Create a new property document. Uses `data.id` (the reference number)
   * as the document ID so lookups are stable across pages.
   * @returns {Promise<string>} the document id
   */
  async addProperty(data) {
    if (!this.isReady()) throw new Error("Firestore not ready");
    const id = data.id;
    const payload = {
      ...data,
      status: data.status || "PENDING",
      verified: !!data.verified,
      published: !!data.published,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection(PROPERTIES_COLLECTION).doc(id).set(payload);
    return id;
  },

  /* ---------------------------- READ ------------------------------ */
  /** Read a single property by id. @returns {Promise<Object|null>} */
  async getProperty(id) {
    if (!this.isReady()) throw new Error("Firestore not ready");
    const snap = await db.collection(PROPERTIES_COLLECTION).doc(id).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  },

  /** One-time fetch of all properties. @returns {Promise<Object[]>} */
  async getAllProperties() {
    if (!this.isReady()) throw new Error("Firestore not ready");
    const snap = await db.collection(PROPERTIES_COLLECTION).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /** One-time fetch of published properties. @returns {Promise<Object[]>} */
  async getPublishedProperties() {
    if (!this.isReady()) throw new Error("Firestore not ready");
    const snap = await db
      .collection(PROPERTIES_COLLECTION)
      .where("published", "==", true)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /** One-time fetch of a single owner's properties by email. */
  async getPropertiesByEmail(email) {
    if (!this.isReady()) throw new Error("Firestore not ready");
    const snap = await db
      .collection(PROPERTIES_COLLECTION)
      .where("email", "==", email)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  /* ------------------------ REALTIME (onSnapshot) ------------------ */
  /**
   * Listen to ALL properties in real time (used by the admin queue).
   * @param {(items:Object[])=>void} onData
   * @param {(err:Error)=>void} [onError]
   * @returns {Function} unsubscribe
   */
  listenAll(onData, onError) {
    if (!this.isReady()) { onError && onError(new Error("Firestore not ready")); return () => {}; }
    return db.collection(PROPERTIES_COLLECTION)
      .onSnapshot(
        (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => { console.error("[DeltaDB] listenAll error:", err); onError && onError(err); }
      );
  },

  /**
   * Listen to PUBLISHED properties in real time (used by the public site).
   * @returns {Function} unsubscribe
   */
  listenPublished(onData, onError) {
    if (!this.isReady()) { onError && onError(new Error("Firestore not ready")); return () => {}; }
    return db.collection(PROPERTIES_COLLECTION)
      .where("published", "==", true)
      .onSnapshot(
        (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => { console.error("[DeltaDB] listenPublished error:", err); onError && onError(err); }
      );
  },

  /**
   * Listen to the audit history in real time (used by the admin history tab).
   * @returns {Function} unsubscribe
   */
  listenHistory(onData, onError) {
    if (!this.isReady()) { onError && onError(new Error("Firestore not ready")); return () => {}; }
    return db.collection(HISTORY_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(50)
      .onSnapshot(
        (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => { console.error("[DeltaDB] listenHistory error:", err); onError && onError(err); }
      );
  },

  /* ---------------------------- UPDATE ---------------------------- */
  /**
   * Update arbitrary fields on a property (adds updatedAt automatically).
   */
  async updateProperty(id, fields) {
    if (!this.isReady()) throw new Error("Firestore not ready");
    await db.collection(PROPERTIES_COLLECTION).doc(id).update({
      ...fields,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  /** Convenience: set status (+ verified/published flags) in one call. */
  async setStatus(id, status, extra = {}) {
    const fields = { status, ...extra };
    if (status === "VERIFIED") fields.verified = true;
    if (status === "PUBLISHED") { fields.verified = true; fields.published = true; }
    if (status === "REJECTED") fields.published = false;
    return this.updateProperty(id, fields);
  },

  /* ---------------------------- DELETE ---------------------------- */
  async deleteProperty(id) {
    if (!this.isReady()) throw new Error("Firestore not ready");
    await db.collection(PROPERTIES_COLLECTION).doc(id).delete();
  },

  /* --------------------------- HISTORY ---------------------------- */
  /** Append an audit-trail entry. */
  async addHistory(entry) {
    if (!this.isReady()) throw new Error("Firestore not ready");
    await db.collection(HISTORY_COLLECTION).add({
      ...entry,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },
};

// Expose globally (redundant for classic scripts, explicit for clarity).
window.DeltaDB = DeltaDB;
