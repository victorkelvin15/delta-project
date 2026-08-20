# Delta Properties — GitHub + Netlify Deployment Guide

This guide walks you through pushing your project to GitHub and connecting it to your **existing Netlify site** for automatic deployments.

---

## Prerequisites

- A [GitHub account](https://github.com)
- [Git](https://git-scm.com/downloads) installed on your computer
- Your existing Netlify site (already deployed via drag-and-drop)

### Verify Git is installed

```bash
git --version
```

If not installed, download from https://git-scm.com/downloads

---

## Step 1 — Create a GitHub Repository

1. Go to **https://github.com/new**
2. Fill in the details:
   - **Repository name**: `delta-properties` (or your preferred name)
   - **Description**: `Delta Properties Registry System — Delta State property portal`
   - **Visibility**: Choose **Private** (recommended) or Public
   - ⚠️ **Do NOT** check "Add a README file" (we already have one)
   - ⚠️ **Do NOT** add a `.gitignore` template (we already have one)
   - ⚠️ **Do NOT** choose a license
3. Click **Create repository**
4. You'll see a page with setup instructions — **keep this page open**, you'll need the repository URL

---

## Step 2 — Initialize Git & Push Your Code

Open a terminal/command prompt and navigate to your project folder (the `delta-properties-deploy` folder).

### Option A: If starting fresh (no existing git repo)

```bash
# Navigate to the project folder
cd path/to/delta-properties-deploy

# Initialize a new git repository
git init

# Add all files to staging
git add .

# Create the first commit
git commit -m "Initial commit — Delta Properties Registry System"

# Rename branch to main (GitHub's default)
git branch -M main

# Connect to your GitHub repository (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/delta-properties.git

# Push code to GitHub
git push -u origin main
```

### Option B: If you already have a git repo set up

```bash
cd path/to/delta-properties-deploy

# Add the remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/delta-properties.git

# Push your existing commits
git push -u origin main
```

### Authentication Note

When you push, GitHub will ask for authentication:
- **Recommended**: Use a [Personal Access Token (PAT)](https://github.com/settings/tokens)
  1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Click **Generate new token (classic)**
  3. Give it a name like "Delta Properties Deploy"
  4. Select scopes: `repo` (full control of private repositories)
  5. Click **Generate token** and **copy it immediately** (you won't see it again)
  6. Use this token as your password when Git asks for credentials
- **Alternative**: Set up [SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## Step 3 — Connect Netlify to GitHub

Now connect your **existing Netlify site** to the GitHub repository for automatic deploys.

### 3a. Link the repository

1. Log in to [Netlify](https://app.netlify.com)
2. Click on your **existing Delta Properties site**
3. Go to **Site configuration** (left sidebar)
4. Scroll down to **Build & deploy** section
5. Under **Build settings**, click **Link site to Git**
   - If you see "Link repository" or "Connect to Git provider", click that
6. Choose **GitHub** as the provider
7. Authorize Netlify to access your GitHub account (if not already done)
8. Select the **delta-properties** repository from the list
9. Configure the build settings:

| Setting            | Value  |
|--------------------|--------|
| **Branch to deploy** | `main` |
| **Build command**    | *(leave empty — no build step needed)* |
| **Publish directory** | `.` (just a dot — the repo root) |

10. Click **Save** or **Deploy site**

### 3b. Verify the connection

After linking:
1. Go to your site's **Deploys** tab in Netlify
2. You should see a new deploy triggered from your GitHub repo
3. Wait for it to say **Published** ✅
4. Visit your site URL to confirm everything works

---

## Step 4 — Automatic Deployments

Once connected, **every push to `main` automatically triggers a new deploy**:

```bash
# Make changes to your files, then:
git add .
git commit -m "Update: description of changes"
git push
```

Netlify will automatically:
1. Detect the push to `main`
2. Pull the latest code
3. Deploy the updated site
4. Show the deploy status in the Deploys tab

### Deploy notifications (optional)

1. In Netlify, go to **Site configuration** → **Notifications**
2. Add an **Email notification** for deploy succeeded/failed
3. You'll get an email every time a deploy completes

---

## Step 5 — Branch Deploys & Preview Deploys (Optional)

For testing changes before they go live:

### Enable Deploy Previews

1. In Netlify → **Site configuration** → **Build & deploy** → **Continuous deployment**
2. Under **Deploy contexts**, enable **Deploy Previews**
3. Now when you create a **Pull Request** on GitHub, Netlify generates a preview URL

### Workflow

```bash
# Create a feature branch
git checkout -b feature/new-page

# Make changes...
git add .
git commit -m "Add new feature"
git push -u origin feature/new-page

# Go to GitHub → Create a Pull Request
# Netlify will auto-generate a preview URL in the PR comments
# Review the preview, then merge the PR to deploy to production
```

---

## Quick Reference — Common Git Commands

| Command | What it does |
|---------|-------------|
| `git status` | See which files have changed |
| `git add .` | Stage all changes |
| `git add filename` | Stage a specific file |
| `git commit -m "message"` | Commit staged changes |
| `git push` | Push commits to GitHub |
| `git pull` | Pull latest changes from GitHub |
| `git log --oneline` | View commit history |
| `git checkout -b branch-name` | Create and switch to new branch |
| `git checkout main` | Switch back to main branch |

---

## Troubleshooting

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/delta-properties.git
```

### "error: failed to push some refs"
```bash
# Pull remote changes first, then push
git pull --rebase origin main
git push
```

### Netlify deploy fails
1. Check the **Deploy log** in Netlify for errors
2. Ensure `netlify.toml` is in the root of your repo
3. Verify the publish directory is set to `.` (dot)
4. Make sure there's no build command configured (it's a static site)

### Site shows old content after push
1. Go to Netlify → Deploys → check if deploy was triggered
2. Try **Trigger deploy** → **Clear cache and deploy site**
3. Hard-refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## File Checklist

Make sure all these files are in your repository:

- [x] `index.html` — Landing portal
- [x] `registry.html` — Registration wizard
- [x] `admin.html` — Admin verification dashboard
- [x] `public.html` — Public property directory
- [x] `netlify.toml` — Netlify configuration
- [x] `_redirects` — URL routing rules
- [x] `js/firebase-config.js` — Firebase placeholder
- [x] `.gitignore` — Git ignore rules
- [x] `README.md` — Project documentation

---

## Adding Firebase Later

When you're ready to add Firebase:

1. Open `js/firebase-config.js`
2. Replace the contents with:

```javascript
// Firebase configuration — Delta Properties
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.isFirebaseConfigured = true;
```

3. Commit and push — Netlify auto-deploys:

```bash
git add js/firebase-config.js
git commit -m "Enable Firebase integration"
git push
```

⚠️ **Important**: If your repo is **public**, do NOT commit real Firebase API keys. Use environment variables or keep the repo **private**.

---

*Guide prepared for Delta Properties — August 2026*
