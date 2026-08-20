# Delta Properties Registry — Firebase Edition

Official property registry for Delta State, backed by **Cloud Firestore**.
Owners register properties → admins verify & publish → the public directory shows
published properties in real time (cross-device, no page refresh needed).

## Pages

| File            | Role            | What it does                                                        |
|-----------------|-----------------|--------------------------------------------------------------------|
| `index.html`    | Landing portal  | Links to the three portals.                                        |
| `registry.html` | Owner portal    | Multi-step registration wizard → writes a `PENDING` property.      |
| `admin.html`    | Admin portal    | Live verification queue → verify / correct / reject / publish.     |
| `public.html`   | Public directory| Live grid + map of **published** properties.                      |

## Folder structure

```
delta-project/
├── index.html               # Landing portal
├── registry.html            # Owner registration wizard  (writes to Firestore)
├── admin.html               # Admin verification queue    (reads + updates Firestore)
├── public.html              # Public directory            (reads published Firestore)
├── js/
│   └── firebase-config.js   # ← paste your Firebase keys here (single source)
├── css/                     # (reserved — styles are currently inline per page)
├── images/                  # brand / static assets
├── firebase.json            # Firebase Hosting + Firestore config
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # (empty) Firestore composite indexes
└── .firebaserc              # default Firebase project alias
```

## The status workflow

```
PENDING ──▶ UNDER REVIEW ──▶ VERIFIED ──▶ PUBLISHED
   │              │              │
   └──▶ CORRECTION REQUIRED      └──▶ REJECTED
```

* **Owner** submits → record is created as `PENDING` (`verified:false, published:false`).
* **Admin** verifies → `VERIFIED` (`verified:true`).
* **Admin** publishes → `PUBLISHED` (`published:true`) → appears on `public.html`.
* Every admin action is written to a `history` audit collection.

## 1) Add your Firebase credentials (required)

1. Go to <https://console.firebase.google.com> → open (or create) your project.
2. **Project settings → Your apps → Web (`</>`)** → register a web app → copy the config.
3. Open **`js/firebase-config.js`** and replace the placeholder values in
   `firebaseConfig` (apiKey, authDomain, projectId, storageBucket,
   messagingSenderId, appId). This is the **only** file you edit — all pages share it.
4. Also set your project id in **`.firebaserc`** (replace `YOUR_PROJECT_ID`).

> Until real keys are added, each page shows a "Firebase not configured" toast
> and no data loads. The moment valid keys are in, everything connects automatically.

## 2) Enable Firestore

In the Firebase console:

* **Firestore Database → Create database** (start in production mode).
* Deploy the security rules from `firestore.rules` (see step 4), or paste them in the
  **Rules** tab of the console.

There are **no manual collections to create** — they appear automatically:

* `properties` — one document per property (document ID = reference number `DP-YYYY-NNNNNN`).
* `history`    — admin audit trail.

## 3) (Recommended) Protect the admin portal with Firebase Auth

The current `firestore.rules` treat **any signed-in user as an admin**. To lock
down `admin.html`, enable **Authentication → Email/Password**, create your staff
accounts, and gate the page behind sign-in. For finer control, use a custom claim
`admin:true` and change `isAdmin()` in `firestore.rules` to:

```
return request.auth != null && request.auth.token.admin == true;
```

## 4) Deploy with Firebase Hosting

```bash
npm install -g firebase-tools     # once
firebase login
firebase use --add                # pick your project (updates .firebaserc)

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy the site
firebase deploy --only hosting
```

Your site will be live at `https://YOUR_PROJECT_ID.web.app`.

## Firestore data model (`properties` document)

```jsonc
{
  "id": "DP-2026-123456",        // == document ID (reference number)
  "status": "PENDING",           // PENDING | UNDER REVIEW | CORRECTION REQUIRED | VERIFIED | REJECTED | PUBLISHED
  "verified": false,
  "published": false,

  // Owner
  "ownerName": "Jane Doe", "owner": "Jane Doe",
  "phone": "0801...", "email": "jane@example.com",
  "idType": "NIN", "idNumber": "1234...", "address": "45 Peace Ave, Asaba",

  // Property
  "title": "3-Bedroom Flat", "propTitle": "3-Bedroom Flat",
  "type": "Residential", "purpose": "Residential",
  "bedrooms": 3, "bathrooms": 2, "floors": 2,
  "description": "...", "yearBuilt": "2020", "condition": "Excellent",

  // Location
  "state": "Delta", "lga": "Oshimili", "city": "Asaba",
  "area": "GRA", "street": "Oba Road", "house": "12", "landmark": "Near Market",
  "fullAddress": "12 Oba Road, GRA, Asaba", "locFullAddress": "12 Oba Road, GRA, Asaba",
  "lat": 6.2024, "lng": 6.6904, "mapPin": "",

  // Media & meta
  "image": "https://images.propertypro.ng/large/4-bedroom-detached-duplex-with-bq-in-oko-oba-gra-4ZT0Ewhe2c2ORTPdSa6E.jpeg", "images": 0, "docs": 0,
  "submitted": "2026-08-20T10:00:00.000Z",
  "createdAt": <serverTimestamp>, "updatedAt": <serverTimestamp>,
  "correctionNote": ""
}
```

## Technical notes

* Uses the Firebase **compat** SDK (v10) via CDN so the existing inline
  `onclick="..."` handlers keep working without a build step / bundler.
* All data access goes through the global **`DeltaDB`** helper in
  `js/firebase-config.js` (`addProperty`, `getPropertiesByEmail`, `listenAll`,
  `listenPublished`, `listenHistory`, `setStatus`, `addHistory`, …).
* Real-time updates use Firestore `onSnapshot`, so admin actions appear on the
  public directory instantly.

## Security notes

* `firestore.rules` allows **public read only for published properties**, lets
  **anyone create a `PENDING` submission** (but not self-verify/publish), and
  restricts **updates/deletes and the audit log to admins**.
* If you keep a Google Maps Embed API key in `public.html`, restrict it by HTTP
  referrer in Google Cloud Console before making the repo public.
