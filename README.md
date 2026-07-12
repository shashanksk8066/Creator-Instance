# Creator Instance (Multi-Tenant Creator Monetization Platform)

Creator Instance is a robust, multi-tenant platform designed to help content creators quickly launch their own branded, monetizable websites. The platform allows administrators to manage multiple creators, while empowering individual creators with powerful dashboards to publish blogs, track analytics, integrate with Instagram via automated DMs, and instantly monetize through native Adsterra ad placements.

## Core Features
- **Multi-Tenant Subdomains:** Dynamic routing to serve unique branded websites for different creators based on URL subdomains (e.g., `creator.yourdomain.com`).
- **Creator Dashboard:** An isolated, secure dashboard for creators to manage their blogs, tags, media, and support tickets.
- **Admin Dashboard:** A high-level control panel for platform administrators to manage users, configure global platform settings (Meta API, Google Drive Backup), and monitor platform-wide Adsterra revenue.
- **Instagram Auto-DM Integration:** Creators can build rules that automatically reply to Instagram DMs and comments using official Meta webhook integrations.
- **Automated Cloud Backups:** Uploaded media (such as blog thumbnails) is automatically compressed into WebP format and synchronized to Google Drive via OAuth2.
- **Built-in Monetization:** Seamless, configurable integration with Adsterra to automatically inject ads into creator blogs.

## Tech Stack

### Frontend
- **Framework:** React + TypeScript + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS & Lucide React Icons
- **State Management:** React Context API (Auth Context, Advertisement Context)
- **Authentication:** Firebase Auth

### Backend
- **Environment:** Node.js + Express + TypeScript
- **Database:** Firebase Firestore
- **Cache & Queue:** Redis (BullMQ / ioredis)
- **Authentication:** Firebase Admin SDK
- **Media Processing:** Multer + Sharp (WebP compression)
- **External APIs:** Googleapis (OAuth2 Drive Backup), Axios

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- Redis Server (Running locally on port 6379, or a remote instance)
- A Firebase Project (with Firestore and Authentication enabled)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd creator-instance
```

### 2. Backend Setup
Navigate to the backend folder and install the dependencies:
```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend/` directory with the following:
```env
PORT=3000
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

*Note: Alternatively, place your Firebase `serviceAccountKey.json` directly in the root of the `backend/` directory.*

**Start the Backend Server (Development):**
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend/` directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Start the Frontend Server (Development):**
```bash
npm run dev
```

### 4. Platform Configuration
Once both servers are running:
1. Navigate to the frontend (typically `http://localhost:5173`).
2. Log in with an Admin account.
3. Access the **Admin Dashboard -> Configuration** to set up:
   - Meta App Credentials (for Instagram Auto-DM)
   - Google Drive OAuth2 Credentials (for media backups)
   - Adsterra Publisher API Keys (for ad monetization)

## Build for Production
To build the frontend for production deployment:
```bash
cd frontend
npm run build
```
To compile the TypeScript backend for production:
```bash
cd backend
npm run build
npm start
```
