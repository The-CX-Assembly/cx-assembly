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
- **Default Admin Account**: `abhishekroks12345@gmail.com`
- **Password**: Configurable via `ADMIN_PASSWORD` in `.env.local` (Default: `CXAssembly2026!`)

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
