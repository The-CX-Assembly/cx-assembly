# The CX Assembly

> **Built by CX Leaders. For CX Leaders.**  
> An initiative of The Executive Assembly.

A dynamic, high-performance web platform and Content Management System (CMS) for **The CX Assembly**, India’s private peer-led community for senior Customer Experience leaders.

Built with **Next.js 16 (App Router)**, **Cloud Firestore**, **Firebase Storage**, and **Firebase Authentication**, designed for seamless deployment on **Firebase App Hosting**.

---

## ✨ Features

- **Executive Aesthetic & Brand Identity**: Premium Navy theme (`#0C2339`), responsive layouts, micro-animations, glassmorphic headers, and editorial typography.
- **Dynamic Content Management (`/admin/content`)**: Full CMS to edit page copy across every section with instant live revalidation.
- **The Founding 50 Cohort (`/founding-50`)**: Roster of founding CX heads with executive headshots, company details, LinkedIn profiles, and interactive bio modals.
- **Leader & Speaker Management (`/admin/leaders`)**: Add, edit, reorder, and upload headshots directly to Firebase Storage.
- **Community Voices (`/community-voices`)**: Client-editable testimonials and candid peer quotes.
- **Membership Application & Lead Capture**: Multi-purpose application form with real-time validation, spam honeypot, and instant inbox capture.
- **Leads Inbox & CSV Export (`/admin/leads`)**: View all applications, search by applicant/company, update status, and one-click export to `.csv`.
- **Firebase App Hosting Ready**: Pre-configured `apphosting.yaml`, `firebase.json`, `firestore.rules`, and `storage.rules`.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules & CSS Design Tokens
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (for headshots and assets)
- **Auth & Security**: Firebase Auth + HttpOnly Session cookies + Firestore Security Rules
- **Hosting**: Firebase App Hosting (Cloud Run)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin CMS Portal

- **URL**: `http://localhost:3000/admin/login`
- **Sign-in**: "Continue with Google", or email + password (Firebase Authentication). Access is invitation-only.
- **Super admins** (full access, including **Users & Access** at `/admin/users`) are defined in `src/lib/admin-users.ts`. They can invite users, choose each person's role and sections, and disable or remove them.
- **One-time Firebase setup**:
  1. Firebase Console → Authentication → Sign-in method: enable **Google** and **Email/Password**.
  2. Authentication → Settings → Authorized domains: add your App Hosting domain (`localhost` is allowed by default).
  3. Create the session secret before deploying: `firebase apphosting:secrets:set ADMIN_SESSION_SECRET`.
  4. Deploy rules after changes: `firebase deploy --only firestore:rules`.
- **Local development** needs `ADMIN_SESSION_SECRET` in `.env.local`. Without service-account credentials, only built-in super admins can sign in and sample content is shown.

---

## 📦 Deployment to Firebase App Hosting

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete CX Assembly website and admin CMS"
   git push origin main
   ```
2. In the [Firebase Console](https://console.firebase.google.com/project/the-cx-assembly/apphosting), connect the repository `The-CX-Assembly/cx-assembly`.
3. Firebase App Hosting will automatically build and deploy the Next.js application from the `main` branch.
