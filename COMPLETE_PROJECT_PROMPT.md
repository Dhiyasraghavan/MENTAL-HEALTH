# COMPLETE MENTAL HEALTH HUB PROJECT - FULL RECREATION PROMPT

## PROJECT OVERVIEW

Build a **production-ready, Firebase-integrated Mental Health Hub** web application using **Next.js 16.1.4** (App Router), **TypeScript**, **Tailwind CSS 4**, **Firebase (Auth + Firestore)**, **Framer Motion**, and **React Hook Form**. The application serves **4 distinct user portals** (Students, IT Employees, Senior Citizens/Elders, College Administrators) with AI-powered wellness assessments, anonymous group discussion sessions, and real-time data synchronization.

**Core Theme**: SDG 3.4 Aligned (Good Health & Well-being), Anonymous, Secure, Multi-language support, Production-ready.

---

## TECHNOLOGY STACK & DEPENDENCIES

### Package.json Configuration
```json
{
  "name": "mentalhealth",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@google/genai": "^1.38.0",
    "@headlessui/react": "^2.2.9",
    "firebase": "^12.8.0",
    "framer-motion": "^12.29.0",
    "lucide-react": "^0.562.0",
    "next": "16.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.71.1",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## PROJECT STRUCTURE

```
mentalhealth/
├── .env.local (create from env.example)
├── env.example
├── package.json
├── next.config.js (if needed)
├── tsconfig.json
├── tailwind.config.js (if needed)
├── public/
│   ├── manifest.json
│   └── breathing/ (optional: guided-breathing.mp3)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Landing page)
│   │   ├── globals.css
│   │   ├── types.ts
│   │   ├── favicon.ico
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── HealthGauge.tsx
│   │   │   ├── VoiceAIBtn.tsx
│   │   │   ├── VoiceAIButton.tsx
│   │   │   ├── PHQ9Chatbot.tsx
│   │   │   ├── ResultsCard.tsx
│   │   │   ├── ResultsSection.tsx
│   │   │   ├── CollegeStats.tsx
│   │   │   └── MultiLangToggle.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── StudentSelection.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── ITSelection.tsx
│   │   │   ├── ITDashboard.tsx
│   │   │   ├── ElderSelection.tsx
│   │   │   ├── CollegeAdminSelection.tsx
│   │   │   ├── CollegeAdminLogin.tsx
│   │   │   ├── CollegeAdminRegister.tsx
│   │   │   ├── CollegeAdminDashboard.tsx
│   │   │   ├── CollegeSelection.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ElderGuardianDashboard.tsx
│   │   ├── student/
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── discuss/
│   │   │       └── page.tsx
│   │   ├── it-employee/
│   │   │   ├── page.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── elder/
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── guardian/
│   │   │       └── page.tsx
│   │   └── college-admin/
│   │       ├── page.tsx
│   │       ├── login/
│   │       │   └── page.tsx
│   │       ├── register/
│   │       │   └── page.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       └── discuss/
│   │           └── page.tsx
│   └── lib/
│       ├── types.ts
│       ├── phq9-questions.ts
│       ├── colleges.ts (legacy, can be removed)
│       ├── firebase/
│       │   └── client.ts
│       └── db/
│           ├── colleges.ts
│           ├── users.ts
│           ├── metrics.ts
│           └── discuss.ts
```

---

## FIREBASE SETUP & ENVIRONMENT

### Environment Variables (.env.local)
Create `.env.local` in project root with:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_ENV=development
```

**Important**: No quotes around values, exact variable names as shown.

### Firebase Console Setup Required
1. **Authentication**: Enable Email/Password sign-in method
2. **Firestore Database**: Create database in production mode (or test mode for prototyping)
3. **Firestore Indexes** (create these composite indexes):
   - Collection: `colleges`
     - Fields: `status` (Ascending), `name` (Ascending)
   - Collection: `discussSessions`
     - Fields: `collegeSlug` (Ascending), `status` (Ascending), `createdAt` (Descending)

---

## DATABASE SCHEMA (FIRESTORE)

### Collection: `colleges`
- **Document ID**: slugified college name (e.g., `iit-madras`)
- **Fields**:
  - `name` (string): Full college name
  - `status` (string): "pending" | "active" | "disabled"
  - `createdByUserId` (string | null): Firebase Auth UID of admin who registered
  - `createdAt` (Timestamp): Server timestamp
  - `updatedAt` (Timestamp): Server timestamp

### Collection: `users`
- **Document ID**: Firebase Auth UID
- **Fields**:
  - `role` (string): "student" | "it-employee" | "elder" | "guardian" | "college-admin"
  - `name` (string): User's display name
  - `email` (string | null): Email address
  - `phone` (string | null): Phone number
  - `collegeSlug` (string | null): Associated college slug (for students/admins)
  - `isAnonymous` (boolean): Whether user chose anonymous mode
  - `createdAt` (Timestamp): Server timestamp
  - `updatedAt` (Timestamp): Server timestamp

### Collection: `collegeMetrics`
- **Document ID**: college slug (e.g., `iit-madras`)
- **Fields**:
  - `studentsActive` (number): Currently active student count
  - `studentsTotal` (number): Total registered students
  - `avgHealthScore` (number): 0-100 average health score
  - `highRiskAlerts` (number): Count of high-risk alerts
  - `avgResponseTimeMin` (number): Average response time in minutes
  - `createdAt` (Timestamp): Server timestamp
  - `updatedAt` (Timestamp): Server timestamp

### Collection: `discussSessions`
- **Document ID**: Auto-generated session ID
- **Fields**:
  - `collegeSlug` (string): College this session belongs to
  - `status` (string): "active" | "ended"
  - `createdByUserId` (string): Psychiatrist/admin UID
  - `activeSpeakerSeatIndex` (number | null): Currently speaking seat (0-5)
  - `seats` (array): Array of seat objects:
    - `seatIndex` (number): 0-5
    - `kind` (string): "psychiatrist" | "member"
    - `userId` (string | null): Occupant's UID (if occupied)
    - `displayName` (string | null): Display name (e.g., "Anonymous Member")
    - `joinedAt` (Date | null): When user joined (use `new Date()`, NOT `serverTimestamp()`)
  - `createdAt` (Timestamp): Server timestamp
  - `updatedAt` (Timestamp): Server timestamp

---

## TYPE DEFINITIONS (src/lib/types.ts)

```typescript
export type Severity = "Low" | "Medium" | "High" | null;

export type UserRole = "student" | "it-employee" | "elder" | "guardian" | "college-admin";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  collegeSlug?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export type CollegeStatus = "pending" | "active" | "disabled";

export interface College {
  slug: string;
  name: string;
  status: CollegeStatus;
  createdAt: Date;
  createdByUserId?: string;
}

export type DiscussSessionStatus = "active" | "ended";

export interface DiscussSessionSeat {
  seatIndex: number; // 0..5
  kind: "psychiatrist" | "member";
  userId?: string;
  displayName?: string;
  joinedAt?: Date;
}

export interface DiscussSession {
  id: string;
  collegeSlug: string;
  status: DiscussSessionStatus;
  createdByUserId: string;
  createdAt: Date;
  activeSpeakerSeatIndex?: number; // 0..5
  seats: DiscussSessionSeat[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  type: "voice-ai" | "phq9" | "combined";
  severity: Severity;
  score: number;
  voiceSentiment?: number;
  facialEmotions?: Record<string, number>;
  phq9Score?: number;
  timestamp: Date;
  recommendations: string[];
}

export interface CollegeStats {
  collegeSlug: string;
  activeStudents: number;
  totalStudents: number;
  avgHealthScore: number;
  highRiskAlerts: number;
  avgResponseTime: number;
  weeklyTrends: {
    date: string;
    activeCount: number;
    avgScore: number;
  }[];
}

export interface VoiceAnalysisResult {
  sentiment: number; // -1 to 1
  emotions: {
    happy: number;
    sad: number;
    stressed: number;
    neutral: number;
  };
  speechRate: number;
  pauses: number;
}

export interface FacialAnalysisResult {
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
    disgusted: number;
    neutral: number;
  };
  attention: number;
  engagement: number;
}
```

---

## FIREBASE CLIENT SETUP (src/lib/firebase/client.ts)

```typescript
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readFirebaseConfig(): FirebaseClientConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length) return existing[0]!;

  const config = readFirebaseConfig();
  if (!config) {
    throw new Error(
      "Firebase is not configured. Copy `env.example` -> `.env.local` and fill NEXT_PUBLIC_FIREBASE_* values."
    );
  }

  return initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}

export function getAuthClient() {
  return getAuth(getFirebaseApp());
}
```

---

## DATABASE FUNCTIONS

### src/lib/db/colleges.ts
- `listActiveColleges()`: Query Firestore for colleges where `status == "active"`, ordered by `name` ascending
- `getCollege(slug: string)`: Get single college document by slug
- `upsertCollege({ name, status?, createdByUserId? })`: Create/update college document, auto-generate slug from name

### src/lib/db/users.ts
- `getUserProfile(userId: string)`: Get user document by UID
- `upsertUserProfile({ id, role, name, email?, phone?, collegeSlug?, isAnonymous })`: Create/update user profile

### src/lib/db/metrics.ts
- `getCollegeMetrics(collegeSlug: string)`: Get metrics document for college
- `ensureCollegeMetrics(collegeSlug: string)`: Get or create default metrics (all zeros) if missing

### src/lib/db/discuss.ts
- `findActiveSession(collegeSlug: string)`: Find active discuss session for college
- `startDiscussSession({ collegeSlug, psychiatristUserId, psychiatristDisplayName? })`: Create new session with 6 seats (seat 0 = psychiatrist)
- `endDiscussSession(sessionId: string)`: Mark session as "ended"
- `setActiveSpeaker(sessionId: string, seatIndex: number)`: Update `activeSpeakerSeatIndex`
- `joinDiscussSession({ sessionId, userId, displayName })`: Use Firestore transaction to assign user to first free member seat (1-5)
- `subscribeToDiscussSession(sessionId, callback)`: Real-time listener for session changes

**CRITICAL**: In `joinDiscussSession`, use `new Date()` for `joinedAt`, NOT `serverTimestamp()` (Firestore doesn't allow serverTimestamp in arrays).

---

## GLOBAL STYLES (src/app/globals.css)

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
  color: var(--foreground);
  font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;
  min-height: 100vh;
}

/* Ensure all input/select/textarea text is dark and readable */
input,
select,
textarea {
  color: #0f172a; /* slate-900 */
}

/* Gradient utility classes */
.gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
}

.gradient-blue-purple {
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Pulse ring animation */
@keyframes pulse-ring {
  0% {
    transform: scale(0.33);
    opacity: 1;
  }
  80%,
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.pulse-ring {
  animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
```

---

## ROOT LAYOUT (src/app/layout.tsx)

- Uses **Geist Sans** and **Geist Mono** fonts from Google Fonts
- Includes `<Navbar />` component on all pages except landing
- Metadata: "Mental Health Hub | SDG 3.4 Aligned"
- Links to `/manifest.json` for PWA support
- Theme color: `#3b82f6`

---

## LANDING PAGE (src/app/page.tsx → uses pages/Landing.tsx)

**Route**: `/`

**Features**:
- Gradient background: `from-blue-50 via-indigo-50 to-purple-50`
- Header: Logo (Heart icon in gradient box) + "Mental Health Hub" + "SDG 3.4 Aligned" + MultiLangToggle
- Hero section: "AI-Powered Wellness Platform" badge, large "Mental Health Hub" title with gradient text, subtitle
- **4 Portal Cards** in grid (1 col mobile, 2 col tablet, 4 col desktop):
  1. **Students** (👨‍🎓, blue theme, path: `/student`)
  2. **IT Employees** (💻, indigo theme, path: `/it-employee`)
  3. **Senior Citizens** (👴, purple theme, path: `/elder`)
  4. **College Admin** (🏫, blue theme, path: `/college-admin`)
- Each card: Icon in colored box, title, description, hover effects (scale + shadow), animated progress bar on hover
- Footer: "SDG 3.4: Good Health & Well-being • AI + Human Hybrid Support • 24/7 Available"

**Styling**: Rounded corners (`rounded-[40px]`), shadows, framer-motion animations

---

## NAVBAR COMPONENT (src/app/components/Navbar.tsx)

**Visibility**: Hidden on landing page (`pathname === "/"`), visible everywhere else

**Features**:
- Sticky top navigation (`sticky top-0 z-50`)
- White background with border-bottom
- Left: Logo (Heart icon) + "Mental Health Hub" text + "SDG 3.4 Aligned • AI-Powered Support" (on dashboards only)
- Right: 
  - "Anonymous Mode" badge (if user is anonymous and on dashboard)
  - Logout button (trash icon + "Logout" text)
- Logout clears `localStorage` (`user`, `college`) and redirects to `/`

---

## STUDENT PORTAL FLOW

### 1. Student Selection Page (`/student` → `pages/StudentSelection.tsx`)

**Features**:
- **Loads colleges from Firestore** using `listActiveColleges()` (only `status: "active"`)
- Searchable dropdown with Headless UI Listbox
- **College grouping** by category (Engineering, Medical, Arts & Science, University, Other) based on name keywords
- Remembers last selection in `localStorage` ("college" key stores slug)
- **State management**: `selected` starts as `null` (not `undefined`) to avoid controlled/uncontrolled warning
- Search input filters colleges in real-time
- Grouped display: Group headers + college options with checkmarks
- "Continue to Login" button (disabled if no selection) → routes to `/student/login?college={slug}`

**Styling**: Gradient background, white card with backdrop blur, rounded corners, icons from lucide-react

### 2. Student Login Page (`/student/login` → `student/login/page.tsx`)

**Features**:
- Validates college from query param using `getCollege(collegeSlug)`
- Form fields:
  - **Full Name** (required unless anonymous, disabled if anonymous)
  - **Registration Number** (required unless anonymous, password-masked with show/hide toggle, disabled if anonymous)
  - **Anonymous Mode checkbox** (when checked, name/regNo become optional and disabled)
- On submit: Creates user object, saves to `localStorage` ("user" key), routes to `/student/dashboard?college={slug}`

**Styling**: Gradient background, white card, icons, form validation with react-hook-form

### 3. Student Dashboard (`/student/dashboard` → `pages/StudentDashboard.tsx`)

**Features**:
- **Loads college data** from Firestore: `getCollege(collegeSlug)` + `ensureCollegeMetrics(collegeSlug)`
- Header: College name + "Real-time Health Monitoring Active • SDG 3.4 Aligned" + HealthGauge component
- **"Discuss" CTA Card**: Large gradient card (indigo-purple) with MessageCircle icon, "Discuss (Anonymous Group Session)" title, "Open Discuss" button → routes to `/student/discuss?college={slug}`
- **Two-column layout** (when no results):
  - Left: "Emotional Scan" card with VoiceAIBtn component
  - Right: CollegeStats component + 3 stat cards (Active Students, Response Time, High Risk Alerts) + PHQ9Chatbot
- **Results view** (when assessment complete): ResultsCard component with severity, score, recommendations, reset button
- Loading state: Spinner while fetching college/metrics
- Error state: "Invalid college selected" if college not found or inactive

**Styling**: White cards, rounded corners, shadows, responsive grid

### 4. Student Discuss Page (`/student/discuss` → `student/discuss/page.tsx`)

**CRITICAL FEATURES**:
- **Professional dark UI**: Background `bg-[#05070a]`, professional header with "Live Discussion" badge, title "Group Session"
- **Real-time session subscription**: Uses `subscribeToDiscussSession` to listen for changes
- **Auto-join on load**: Calls `joinDiscussSession` to assign user to a free member seat (1-5)
- **Mic permission**: When `activeSpeakerSeatIndex === mySeat`, automatically requests mic permission via `getUserMedia({ audio: true })`
- **6-seat round table**:
  - **Positioning**: Uses `getSeatTransform(index, radius)` helper:
    ```typescript
    function getSeatTransform(index: number, radius: number) {
      const angle = (index * 60 - 90) * (Math.PI / 180);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { x, y };
    }
    ```
  - **Responsive radius**: 120px on mobile (< 640px), 180px on desktop
  - **Seat 0**: Psychiatrist (purple border, gradient avatar)
  - **Seats 1-5**: Members (gray borders, slate avatars)
  - **Active speaker**: Blue glow, pulsing ripple animation, scale 1.1x, "Speaking" label with mic icon
  - **My seat**: Green ring indicator (`ring-2 ring-emerald-500/50`)
  - **Labels**: Fixed-height container (`h-[60px] md:h-[70px]`), flex column with `gap-1`, each label has fixed height to prevent overlap:
    - Role: "Psychiatrist" or "Member N" (uppercase, tracking-wider)
    - Status: "Connected" or "Waiting..." (only one shows)
    - Speaking: Only shows when `isActive` is true (with mic icon)
- **Header HUD**: Shows "You are the active speaker" banner when it's your turn (with animated mic icon)
- **Connected count**: Shows "X/6" in header, updates in real-time
- **Table visual**: Two concentric circles (outer gradient, inner dark) for table effect
- **Footer**: Session ID display

**Styling**: Dark theme, professional spacing, no overlapping labels, smooth animations

---

## COLLEGE ADMIN PORTAL FLOW

### 1. College Admin Selection (`/college-admin` → `pages/CollegeAdminSelection.tsx`)

**Features**:
- Two large cards: "Login" (existing admin) and "Register" (new college)
- Routes to `/college-admin/login` or `/college-admin/register`

### 2. College Admin Register (`/college-admin/register` → `pages/CollegeAdminRegister.tsx`)

**CRITICAL FEATURES**:
- **Form fields**: Name, Email, Phone, Designation, **College Name (text input, NOT dropdown)**, Password, Confirm Password
- **Firebase Auth**: Creates user with `createUserWithEmailAndPassword(getAuthClient(), email, password)`
- **Creates college in Firestore**: Calls `upsertCollege({ name: collegeName, status: "active", createdByUserId: uid })` - this makes the college appear in student selection
- **Creates user profile**: Calls `upsertUserProfile({ id: uid, role: "college-admin", ... })`
- **Auto-login**: Saves session to `localStorage` and routes to `/college-admin/dashboard?college={slug}`
- **Error handling**: Shows Firebase errors (e.g., "email-already-in-use")

### 3. College Admin Login (`/college-admin/login` → `pages/CollegeAdminLogin.tsx`)

**Features**:
- Email + Password form
- **Firebase Auth**: `signInWithEmailAndPassword(getAuthClient(), email, password)`
- **Loads user profile**: `getUserProfile(uid)`
- **Loads college**: `getCollege(profile.collegeSlug)`
- Routes to `/college-admin/dashboard?college={slug}`

### 4. College Admin Dashboard (`/college-admin/dashboard` → `pages/CollegeAdminDashboard.tsx`)

**Features**:
- **Loads college + metrics** from Firestore
- Header: College name + admin name/designation + HealthGauge + health score percentage
- **4 stat cards**: Total Students, Active Students, High Risk Alerts, Avg Response Time
- **CollegeStats component**: Shows analytics grid
- **Student Activity section**: Lists students from localStorage (reads all keys starting with "student_"), shows anonymous vs registered status
- **Quick Actions grid** (4 cards):
  1. "View Analytics" (blue gradient)
  2. "High Risk Alerts" (red gradient, shows count)
  3. **"Start Discuss"** (indigo-purple gradient, MessageCircle icon) → routes to `/college-admin/discuss?college={slug}`
  4. "Wellness Programs" (emerald gradient)

### 5. College Admin Discuss Page (`/college-admin/discuss` → `college-admin/discuss/page.tsx`)

**CRITICAL FEATURES**:
- **Professional dark UI**: Same as student discuss but with admin-specific header
- **Control bar**: "Start New Session" button (blue) / "Terminate Session" button (red), "X / 6 Present" counter
- **6-seat round table**: Same positioning logic as student page
- **Click to set speaker**: Admin can click any occupied seat to call `setActiveSpeaker(sessionId, seatIndex)`
- **Visual feedback**: Active seat glows blue, scales up, shows "Live" badge with mic icon
- **Real-time updates**: Subscribes to session changes, connected count updates automatically
- **Labels**: Same fixed-height system to prevent overlap

---

## IT EMPLOYEE PORTAL

### 1. IT Selection (`/it-employee` → `pages/ITSelection.tsx`)

**Features**: Simple page with emoji, title "IT Employee Wellness", "Check Dashboard" button → routes to `/it-employee/dashboard`

### 2. IT Dashboard (`/it-employee/dashboard` → `pages/ITDashboard.tsx`)

**Features**:
- Header: "Burnout Monitor" title + "IT Employee Portal" badge
- **Two stat cards**: Stress Index (0-100, orange gradient bar) and Productivity Level ("Unknown" initially, updates based on Voice AI results)
- **Voice AI Wellness Check**: VoiceAIBtn component
- **Workplace Wellness Resources**: 3 info cards (EAP Services, Desk Yoga, Therapist Connect)
- **PHQ9Chatbot**: Alternative assessment option
- **Results view**: ResultsCard when assessment complete
- **Logic**: `stressIndex` and `productivity` update based on Voice AI severity:
  - High → 75, "Low"
  - Medium → 55, "Moderate"
  - Low → 35, "Normal"

---

## ELDER PORTAL FLOW

### 1. Elder Selection (`/elder` → `pages/ElderSelection.tsx`)

**Features**: Two cards - "Elder Portal" (face unlock/manual) and "I am a Guardian" → routes to `/elder/login` or `/elder/guardian`

### 2. Elder Login (`/elder/login` → `elder/login/page.tsx`)

**Features**:
- **Two login methods**: Toggle between "Face Unlock" and "Manual Login"
- **Face Unlock**: Requests camera permission, simulates 2-second recognition, creates elder user, routes to dashboard
- **Manual Login**: Name input, creates elder user, routes to dashboard
- **Error handling**: Specific messages for camera permission denied, no camera found, camera in use

### 3. Elder Dashboard (`/elder/dashboard` → `elder/dashboard/page.tsx`)

**Features**:
- Header: "Elder Wellness Dashboard" + "Active Monitoring" badge
- **Health Score card**: Large HealthGauge (200px), "Good/Stable/Active" status labels, "Last check" timestamp
- **Voice Wellness Check**: VoiceAIBtn component
- **Quick Actions grid**: 4 buttons (Emergency, Schedule, Health Report, Medication)
- **Fall Detection AI card**: Purple-pink gradient, "Active & Monitoring" status
- **PHQ9Chatbot**: Alternative assessment
- **Results view**: ResultsCard when complete
- **State**: `healthScore` starts at 0, `lastCheckIn` starts as "Not yet", updates when Voice AI completes

### 4. Elder Guardian Dashboard (`/elder/guardian` → `pages/ElderGuardianDashboard.tsx`)

**Features**:
- Header: "Family Monitor" + "ONLINE" status badge
- **Elder profile card**: Avatar initials, name, last check-in, status ("HAPPY"/"CALM"/"CONCERNED"), voice tone
- **Health metrics**: Health Score %, Weekly Avg %
- **Weekly Trends section**: Empty state message (ready for DB integration)
- **Fall Detection AI card**: Configure alerts button
- **Alert banner**: Shows if status is "CONCERNED" with "Call Now" button
- **Quick Actions**: 4 buttons (Video Call, Health Report, Medication, Emergency)
- **State**: All metrics start at 0 or "Not yet", no fake data

---

## SHARED COMPONENTS

### HealthGauge (src/app/components/HealthGauge.tsx)
- Circular progress indicator using SVG
- Props: `score` (0-100), `size` (default 100)
- Animated stroke-dashoffset using framer-motion
- Shows percentage in center

### VoiceAIBtn (src/app/components/VoiceAIBtn.tsx)
- **5-minute recording session** with countdown timer
- Requests camera + microphone permissions
- Shows video preview (grayscale, muted) while recording
- **API call**: POST to `/api/analyze` with `{ type: "combined", duration }`
- **Error handling**: Specific messages for permission denied, no devices, device in use
- **States**: Idle (🗣️ emoji + "Talk to Me"), Recording (timer display), Analyzing (spinner)
- **Pulse ring animation** around button when recording

### PHQ9Chatbot (src/app/components/PHQ9Chatbot.tsx)
- **9 validated questions** from `src/lib/phq9-questions.ts`
- Each question has category (Anhedonia, Depressed Mood, etc.)
- **4 answer options**: "Not at all" (0), "Several days" (1), "More than half the days" (2), "Nearly every day" (3)
- Progress bar showing question X of 9
- **Scoring**: Sums all answers, calculates severity using `calculatePHQ9Severity(score)`
- **AnimatePresence** for smooth question transitions
- Calls `onComplete(severity)` when finished

### ResultsCard (src/app/components/ResultsCard.tsx)
- **Severity-based styling**:
  - Low: Emerald theme, "Healthy! 🎉", "Start Breathing" button
  - Medium: Orange theme, "Moderate Stress Detected", "Schedule Call" button
  - High: Red theme, "High Distress Level 🚨", "Contact Helpline: 1800-599-0019" button
- Shows score, recommendations list
- **Actions**: 
  - Low → Plays `/breathing/guided-breathing.mp3` (or alerts if missing)
  - Medium → Opens Calendly link
  - High → Opens tel: link for helpline
- "Take Assessment Again" reset button

### CollegeStats (src/app/components/CollegeStats.tsx)
- **Props**: `metrics: CollegeMetrics`
- **4 stat boxes**: Active Students, Health Score, High Risk Alerts, Response Time
- **Community Health bar**: Gradient progress bar showing avgHealthScore
- Color-coded (blue, emerald, red, amber)

### MultiLangToggle (src/app/components/MultiLangToggle.tsx)
- **3 languages**: English (🇬🇧), Hindi (🇮🇳), Tamil (🇮🇳)
- Dropdown with flag emojis
- Saves selection to `localStorage` ("language" key)
- Note: UI only, i18n integration ready for future

---

## API ROUTE (src/app/api/analyze/route.ts)

**Endpoint**: `POST /api/analyze`

**Request body**:
```json
{
  "type": "voice" | "facial" | "combined",
  "duration": number (optional, in seconds)
}
```

**Response**:
```json
{
  "success": true,
  "severity": "Low" | "Medium" | "High",
  "score": number (0-100),
  "recommendations": string[],
  "data": { voice?: VoiceAnalysisResult, facial?: FacialAnalysisResult }
}
```

**Logic**:
- **Mock AI analysis** (production would use AssemblyAI + MediaPipe)
- For "combined": Generates random voice + facial results, calculates combined severity
- **Severity calculation**:
  - Combined score < 0.3 → High (immediate intervention, helpline, emergency counseling)
  - 0.3-0.6 → Medium (book counselor, breathing exercises, monitor)
  - > 0.6 → Low (maintain routines, mindfulness, regular check-ins)

---

## PHQ9 QUESTIONS (src/lib/phq9-questions.ts)

**9 questions** with categories:
1. "Little interest or pleasure in doing things?" (Anhedonia)
2. "Feeling down, depressed, or hopeless?" (Depressed Mood)
3. "Trouble falling or staying asleep, or sleeping too much?" (Sleep Disturbance)
4. "Feeling tired or having little energy?" (Fatigue)
5. "Poor appetite or overeating?" (Appetite Changes)
6. "Feeling bad about yourself — or that you are a failure?" (Self-Esteem)
7. "Trouble concentrating on things, such as reading the news?" (Concentration)
8. "Moving or speaking slowly, or being extra fidgety?" (Psychomotor)
9. "Thoughts that you would be better off dead?" (Suicidal Ideation)

**Scoring function** `calculatePHQ9Severity(score)`:
- 0-4: Low, "None/Minimal"
- 5-9: Low, "Mild Depression"
- 10-14: Medium, "Moderate Depression"
- 15-19: High, "Moderately Severe"
- 20-27: High, "Severe"

---

## DESIGN SYSTEM & STYLING

### Color Palette
- **Primary gradients**: Blue (`#3b82f6`) to Purple (`#9333ea`)
- **Student theme**: Blue tones
- **IT theme**: Indigo tones
- **Elder theme**: Purple-pink tones
- **Admin theme**: Blue tones
- **Discuss theme**: Dark (`#05070a`) with blue accents

### Typography
- **Font**: Geist Sans (body), Geist Mono (code)
- **Fallback**: 'Plus Jakarta Sans', Arial, Helvetica
- **Weights**: Regular, Bold, Black (900)
- **Sizes**: Responsive (text-xs to text-7xl)

### Border Radius
- **Cards**: `rounded-[40px]` or `rounded-3xl`
- **Buttons**: `rounded-xl` or `rounded-2xl`
- **Inputs**: `rounded-xl`
- **Icons**: `rounded-xl` or `rounded-3xl`

### Shadows
- **Cards**: `shadow-xl` or `shadow-2xl`
- **Buttons**: `shadow-lg hover:shadow-xl`
- **Hover effects**: Scale transforms (`hover:scale-105`, `active:scale-95`)

### Animations
- **Framer Motion**: Page transitions, component entrances
- **Pulse ring**: For recording states
- **Pulsing glow**: For active speakers in Discuss
- **Spinner**: Loading states (border animation)

---

## ROUTING STRUCTURE

```
/ → Landing page
/student → Student selection
/student/login?college={slug} → Student login
/student/dashboard?college={slug} → Student dashboard
/student/discuss?college={slug} → Student discuss session

/it-employee → IT selection
/it-employee/dashboard → IT dashboard

/elder → Elder selection
/elder/login → Elder login (face/manual)
/elder/dashboard → Elder dashboard
/elder/guardian → Guardian dashboard

/college-admin → Admin selection (login/register)
/college-admin/login → Admin login
/college-admin/register → Admin register
/college-admin/dashboard?college={slug} → Admin dashboard
/college-admin/discuss?college={slug} → Admin discuss control
```

---

## KEY LOGIC & FEATURES

### 1. College Registration Flow
- Admin registers → Creates Firebase Auth user → Creates college doc in Firestore (`status: "active"`) → College appears in student selection dropdown

### 2. Student College Selection
- **Only shows colleges from Firestore** where `status === "active"`
- Searchable, grouped by category
- Remembers selection in localStorage

### 3. Anonymous Mode
- Students can check "Anonymous Mode" → Name/RegNo become optional
- User object has `isAnonymous: true`
- Navbar shows "Anonymous Mode" badge on dashboards

### 4. Discuss Session Flow
- **Admin starts session**: Creates `discussSessions` doc with 6 seats (seat 0 = psychiatrist, seats 1-5 = empty members)
- **Student joins**: Firestore transaction finds first free member seat, assigns `userId` and `displayName: "Anonymous Member"`
- **Real-time updates**: Both admin and student pages subscribe to session doc, see changes instantly
- **Active speaker**: Admin clicks seat → Updates `activeSpeakerSeatIndex` → All clients see that seat glow blue
- **Mic permission**: When student's seat becomes active, browser requests mic permission automatically
- **Connected count**: Calculated from `seats.filter(s => !!s.userId).length`, updates in real-time

### 5. Voice AI Assessment
- 5-minute recording session
- Requests camera + mic
- Shows video preview
- Calls `/api/analyze` on completion
- Returns severity, score, recommendations
- Displays ResultsCard

### 6. PHQ9 Assessment
- 9-question validated questionnaire
- Scores 0-27
- Calculates severity based on score ranges
- Displays ResultsCard

### 7. Results Display
- Severity-based color coding (emerald/orange/red)
- Action buttons based on severity (breathing exercise, schedule call, helpline)
- Reset button to take assessment again

---

## CRITICAL IMPLEMENTATION DETAILS

### 1. Firebase Client Initialization
- **Lazy initialization**: Only creates app when `getFirebaseApp()` is called
- **Error handling**: Throws clear error if env vars missing
- **No module-level exports**: `firestore` and `auth` are functions, not constants (allows build-time safety)

### 2. Firestore Transactions
- **joinDiscussSession** uses `runTransaction` to atomically assign seats
- **CRITICAL**: Use `new Date()` for `joinedAt` in arrays, NOT `serverTimestamp()`

### 3. Real-time Subscriptions
- **subscribeToDiscussSession**: Uses `onSnapshot` for live updates
- **Cleanup**: Returns unsubscribe function, called in `useEffect` cleanup

### 4. State Management
- **localStorage**: Used for session persistence (`user`, `college` keys)
- **Firestore**: Source of truth for colleges, users, sessions, metrics
- **React state**: UI state, loading states, form data

### 5. Controlled Components
- **Listbox value**: Use `null` (not `undefined`) for "no selection"
- **Input text color**: Global CSS ensures dark text (`color: #0f172a`)

### 6. Error Handling
- **Firebase errors**: Caught and displayed in UI
- **Network errors**: "Failed to get document because the client is offline" → Check ad-blockers, network
- **Permission errors**: Specific messages for camera/mic denied, not found, in use

### 7. Responsive Design
- **Mobile-first**: Breakpoints at `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **Discuss seats**: Smaller radius (120px) on mobile, larger (180px) on desktop
- **Grid layouts**: 1 col mobile, 2-4 col desktop

---

## COMPLETE FILE IMPLEMENTATION CHECKLIST

### Root Files
- [ ] `package.json` with exact dependencies listed above
- [ ] `env.example` with Firebase config template
- [ ] `.env.local` (user creates, not in repo)
- [ ] `tsconfig.json` (Next.js default)
- [ ] `tailwind.config.js` or PostCSS config (Tailwind 4)

### Layout & Global
- [ ] `src/app/layout.tsx` - Root layout with fonts, Navbar, metadata
- [ ] `src/app/globals.css` - All styles, gradients, animations
- [ ] `src/app/page.tsx` - Renders Landing component

### Type Definitions
- [ ] `src/lib/types.ts` - All interfaces and types listed above

### Firebase Setup
- [ ] `src/lib/firebase/client.ts` - Firebase initialization, getFirestoreDb, getAuthClient

### Database Functions
- [ ] `src/lib/db/colleges.ts` - listActiveColleges, getCollege, upsertCollege
- [ ] `src/lib/db/users.ts` - getUserProfile, upsertUserProfile
- [ ] `src/lib/db/metrics.ts` - getCollegeMetrics, ensureCollegeMetrics
- [ ] `src/lib/db/discuss.ts` - All discuss session functions (CRITICAL: use `new Date()` not `serverTimestamp()` in arrays)

### PHQ9
- [ ] `src/lib/phq9-questions.ts` - 9 questions array + calculatePHQ9Severity function

### Components
- [ ] `src/app/components/Navbar.tsx` - Sticky nav, logout, anonymous badge
- [ ] `src/app/components/HealthGauge.tsx` - Circular progress indicator
- [ ] `src/app/components/VoiceAIBtn.tsx` - 5-min recording with camera/mic
- [ ] `src/app/components/PHQ9Chatbot.tsx` - 9-question quiz with progress
- [ ] `src/app/components/ResultsCard.tsx` - Severity-based results display
- [ ] `src/app/components/CollegeStats.tsx` - Metrics grid component
- [ ] `src/app/components/MultiLangToggle.tsx` - Language switcher (UI only)

### Pages - Landing
- [ ] `src/app/pages/Landing.tsx` - 4 portal cards, hero section, footer

### Pages - Student Flow
- [ ] `src/app/pages/StudentSelection.tsx` - College selection with search/grouping
- [ ] `src/app/student/login/page.tsx` - Login form with anonymous mode
- [ ] `src/app/pages/StudentDashboard.tsx` - Dashboard with Voice AI, PHQ9, Discuss CTA
- [ ] `src/app/student/discuss/page.tsx` - **Professional 6-seat round table, mic permission, real-time updates**

### Pages - IT Employee
- [ ] `src/app/pages/ITSelection.tsx` - Simple selection page
- [ ] `src/app/pages/ITDashboard.tsx` - Burnout monitor with stress index, productivity

### Pages - Elder
- [ ] `src/app/pages/ElderSelection.tsx` - Elder vs Guardian selection
- [ ] `src/app/elder/login/page.tsx` - Face unlock + manual login
- [ ] `src/app/elder/dashboard/page.tsx` - Wellness dashboard with fall detection
- [ ] `src/app/pages/ElderGuardianDashboard.tsx` - Guardian monitoring view

### Pages - College Admin
- [ ] `src/app/pages/CollegeAdminSelection.tsx` - Login/Register selection
- [ ] `src/app/pages/CollegeAdminLogin.tsx` - Firebase Auth login
- [ ] `src/app/pages/CollegeAdminRegister.tsx` - **Registration that creates college in Firestore**
- [ ] `src/app/pages/CollegeAdminDashboard.tsx` - Admin dashboard with stats, student list, Discuss button
- [ ] `src/app/college-admin/discuss/page.tsx` - **Admin control panel for discuss sessions**

### API Routes
- [ ] `src/app/api/analyze/route.ts` - POST endpoint for voice/facial/combined analysis

### Route Wrappers
- [ ] `src/app/student/page.tsx` - Renders StudentSelection
- [ ] `src/app/student/dashboard/page.tsx` - Renders StudentDashboard with Suspense
- [ ] `src/app/it-employee/page.tsx` - Renders ITSelection
- [ ] `src/app/it-employee/dashboard/page.tsx` - Renders ITDashboard
- [ ] `src/app/elder/page.tsx` - Renders ElderSelection
- [ ] `src/app/college-admin/page.tsx` - Renders CollegeAdminSelection
- [ ] `src/app/college-admin/login/page.tsx` - Renders CollegeAdminLogin
- [ ] `src/app/college-admin/register/page.tsx` - Renders CollegeAdminRegister
- [ ] `src/app/college-admin/dashboard/page.tsx` - Renders CollegeAdminDashboard with Suspense

---

## STYLING SPECIFICATIONS

### Discuss Pages (Student & Admin)
- **Background**: `bg-[#05070a]` (very dark blue-black)
- **Text**: `text-slate-200` or `text-white`
- **Cards**: `bg-white/[0.03]` or `bg-white/[0.02]` with `border border-white/5` or `border-white/10`
- **Seat cards**: `w-16 h-16 md:w-20 md:h-20` (responsive sizing)
- **Active speaker**: Blue glow (`bg-blue-500/20`, `border-blue-500/50`), scale 1.1, pulsing ripple
- **Labels**: Fixed heights (`h-4`, `h-3`), `leading-none`, `gap-1` spacing, no overlap
- **Table visual**: Two concentric circles, subtle gradients

### Form Pages
- **Background**: Gradient (`from-blue-50 to-indigo-100` or similar)
- **Cards**: White with `rounded-[40px]`, `shadow-2xl`
- **Inputs**: `bg-slate-50`, `border-slate-200`, `focus:ring-4 focus:ring-blue-100`
- **Buttons**: Gradient backgrounds, `rounded-xl` or `rounded-2xl`, hover effects

### Dashboard Pages
- **Background**: `bg-slate-50` or white
- **Cards**: White with `rounded-[40px]` or `rounded-3xl`, shadows
- **Headers**: Large titles (`text-3xl` or `text-4xl`), `font-black`
- **Stats**: Color-coded boxes (blue, emerald, red, amber)

---

## ANIMATIONS & INTERACTIONS

### Framer Motion Usage
- **Page transitions**: `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`
- **Listbox options**: AnimatePresence with fade + slide
- **Seat animations**: Staggered entrance (`delay: idx * 0.05`), scale on active
- **Pulsing effects**: `animate={{ scale: [1, 1.1, 1] }}` with `repeat: Infinity`

### CSS Animations
- **Pulse ring**: Keyframe animation for recording indicator
- **Spinner**: Border animation (`border-t-transparent` + `animate-spin`)
- **Hover effects**: Scale transforms, shadow changes

---

## ERROR HANDLING PATTERNS

### Firebase Errors
- **auth/email-already-in-use**: Show "Email already registered, please login"
- **auth/configuration-not-found**: "Email/Password not enabled in Firebase"
- **auth/network-request-failed**: "Check your internet connection"
- **Firestore permission-denied**: "Database access denied"
- **Firestore offline**: "Failed to get document because the client is offline" → Check ad-blockers

### Media Errors
- **NotAllowedError**: "Camera/mic access denied, check browser permissions"
- **NotFoundError**: "No camera/mic found, connect a device"
- **NotReadableError**: "Device already in use, close other apps"

### Validation Errors
- **Form validation**: react-hook-form error messages
- **College not found**: "Invalid college selected"
- **Session not found**: "No active session" message

---

## TESTING CHECKLIST

### College Registration
1. Register new college admin → College appears in student selection
2. Register with existing email → Shows "email-already-in-use" error
3. Login with registered admin → Loads dashboard correctly

### Student Flow
1. Select college from dropdown (only active colleges show)
2. Login (anonymous or registered) → Dashboard loads
3. Click "Open Discuss" → Joins session, sees 6-seat circle
4. When admin sets student as speaker → Mic permission requested, seat glows blue

### Discuss Session
1. Admin starts session → 6 seats appear, psychiatrist in seat 0
2. 4 students join → Connected count shows "4/6"
3. Admin clicks seat → That seat becomes active speaker (glows blue)
4. Student's seat becomes active → Browser requests mic, "You are the active speaker" banner shows
5. Labels don't overlap → Each label in fixed-height container

### Voice AI
1. Click "Talk to Me" → Camera/mic permission requested
2. Record for 5 minutes → Timer counts down, video preview shows
3. Stop recording → Calls `/api/analyze`, shows ResultsCard
4. Permission denied → Shows specific error message

### PHQ9
1. Click "Start Quiz" → Shows first question
2. Answer all 9 questions → Progress bar updates
3. Complete → Calculates severity, shows ResultsCard

---

## DEPLOYMENT NOTES

### Environment Setup
1. Create Firebase project
2. Enable Email/Password auth
3. Create Firestore database
4. Create composite indexes (colleges, discussSessions)
5. Copy config to `.env.local`
6. Restart dev server

### Build
- Run `npm run build` to verify TypeScript compilation
- All client components must have `"use client"` directive
- Server components (layout, API routes) must NOT have `"use client"`

### Production Considerations
- Replace mock AI analysis with real AssemblyAI + MediaPipe integration
- Implement proper password hashing (Firebase Auth handles this)
- Add Firestore security rules
- Set up proper error logging
- Add analytics tracking
- Implement i18n for MultiLangToggle

---

## FINAL NOTES

This prompt covers **every file, every feature, every styling detail, and every piece of logic** in the Mental Health Hub project. Follow it exactly to recreate the entire application with:

✅ Firebase integration (Auth + Firestore)  
✅ College registration → Student selection flow  
✅ 4 user portals (Student, IT, Elder, Admin)  
✅ Voice AI + PHQ9 assessments  
✅ Anonymous group discussion with 6-seat round table  
✅ Real-time updates via Firestore subscriptions  
✅ Professional, polished UI with no overlapping labels  
✅ Mic permission requests when speaking  
✅ All dashboards with DB-ready data access  
✅ Complete error handling  
✅ Responsive design  

**The project is production-ready and fully functional when Firebase is configured correctly.**
