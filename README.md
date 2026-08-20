# Delta Properties Registry System

A modern, responsive property registry portal for Delta State, Nigeria. Built as a static site with localStorage-based persistence and Firebase hooks for future cloud integration.

## 🏗️ Project Structure

```
delta-properties-deploy/
├── index.html            # Landing portal — navigation hub
├── registry.html         # Multi-step property registration wizard
├── admin.html            # Admin verification & review dashboard
├── public.html           # Public verified-property directory
├── netlify.toml          # Netlify build config & security headers
├── _redirects            # Netlify URL routing rules
├── js/
│   └── firebase-config.js  # Firebase placeholder (paste keys when ready)
├── .gitignore
└── README.md
```

## 🚀 Features

- **Property Registration** — Multi-step wizard with owner info, property details, and document uploads
- **Admin Verification** — Review queue with approve/reject workflow and audit trail
- **Public Directory** — Searchable, filterable verified-property listing with map integration
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Offline-First** — localStorage persistence; works without Firebase
- **Firebase-Ready** — Flip a switch to enable Firestore + Firebase Auth

## 🔧 How It Works

### Without Firebase (Current Default)
- `registry.html` saves submissions to `localStorage`
- `admin.html` reads from `localStorage` for the review queue
- `public.html` displays demo/seeded data
- No authentication required — demo mode

### With Firebase (When Ready)
1. Open `js/firebase-config.js` and paste your Firebase project config
2. Set `window.isFirebaseConfigured = true`
3. All modules automatically switch to Firestore + Firebase Auth

## 📦 Deployment

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for detailed instructions on:
- Creating a GitHub repository
- Pushing code with Git
- Connecting your existing Netlify site to GitHub
- Setting up automatic deployments

## 🔒 Security Notes

- All CSS and JS are inline (no external dependencies to compromise)
- Security headers configured in `netlify.toml`
- Firebase config is a placeholder — no secrets are exposed
- When adding Firebase keys, restrict your API key to your Netlify domain

## 📄 License

Private project — Delta Properties.
