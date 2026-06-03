# Firestore Setup Guide for Mental Health Hub

## Required Firestore Indexes

The application requires the following composite indexes to be created in your Firebase Console. These indexes enable efficient querying of assessments and users.

### 1. Assessments Collection Indexes

#### Index 1: User Assessments (by userId, timestamp)
- **Collection**: `assessments`
- **Fields**:
  - `userId` (Ascending)
  - `timestamp` (Descending)

**Purpose**: Loads a user's past assessments in chronological order.

#### Index 2: College Assessments (by collegeSlug, timestamp)
- **Collection**: `assessments`
- **Fields**:
  - `collegeSlug` (Ascending)
  - `timestamp` (Descending)

**Purpose**: Loads all assessments for a college to calculate metrics.

#### Index 3: Student Assessments in College (by userId, collegeSlug, timestamp)
- **Collection**: `assessments`
- **Fields**:
  - `userId` (Ascending)
  - `collegeSlug` (Ascending)
  - `timestamp` (Descending)

**Purpose**: Loads a specific student's assessments within a college.

### 2. Users Collection Index

#### Index 4: College Students (by collegeSlug, role)
- **Collection**: `users`
- **Fields**:
  - `collegeSlug` (Ascending)
  - `role` (Ascending)

**Purpose**: Lists all students registered for a college.

## How to Create Indexes

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mentalhealth-thon`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **"Create Index"**
5. For each index above:
   - Select the collection group
   - Add fields in the exact order specified
   - Set the order (Ascending/Descending) as shown
   - Click **"Create"**

### Option 2: Using Firebase CLI

If you have Firebase CLI installed, you can deploy indexes automatically:

```bash
firebase deploy --only firestore:indexes
```

This will read from `firestore.indexes.json` and create all required indexes.

## Collection Structure

### `assessments` Collection

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string;              // Student's user ID
  collegeSlug?: string;        // College identifier
  type: "voice-ai" | "phq9" | "dr-aris" | "combined";
  severity: "Low" | "Medium" | "High" | null;
  score: number;               // 0-100
  voiceSentiment?: number;      // -1 to 1
  facialEmotions?: Record<string, number>;
  phq9Score?: number;          // 0-27
  recommendations: string[];    // Array of recommendations
  timestamp: Timestamp;        // When assessment was taken
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `users` Collection

**Document ID**: User's ID (e.g., `student_abc123` or Firebase Auth UID)

**Fields**:
```typescript
{
  role: "student" | "it-employee" | "elder" | "guardian" | "college-admin";
  name: string;
  email?: string;
  phone?: string;
  collegeSlug?: string;         // For students/admins
  isAnonymous: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `collegeMetrics` Collection

**Document ID**: College slug (e.g., `iit-madras`)

**Fields**:
```typescript
{
  studentsActive: number;       // Students with assessments in last 30 days
  studentsTotal: number;        // Total registered students
  avgHealthScore: number;       // 0-100 average
  highRiskAlerts: number;       // Count of "High" severity assessments
  avgResponseTimeMin: number;   // Average response time (currently 0)
  updatedAt: Timestamp;
}
```

## Security Rules (Recommended)

Add these Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Assessments: Users can read their own, admins can read all in their college
    match /assessments/{assessmentId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.collegeSlug == resource.data.collegeSlug
      );
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // College metrics: Read-only for authenticated users
    match /collegeMetrics/{collegeSlug} {
      allow read: if request.auth != null;
      allow write: if false; // Only server-side updates
    }
    
    // Colleges: Public read for active colleges
    match /colleges/{collegeSlug} {
      allow read: if resource.data.status == "active";
      allow write: if request.auth != null; // Only admins in production
    }
  }
}
```

## Testing Indexes

After creating indexes:

1. **Wait for index build** (usually 1-5 minutes)
2. **Test student login**: Create a student account
3. **Take an assessment**: Complete Dr. Aris or PHQ9
4. **Check student dashboard**: Should show past assessments
5. **Check admin dashboard**: Should show student list and graphs

## Troubleshooting

### Error: "The query requires an index"
- **Solution**: Click the link in the error message to create the index automatically
- Or manually create the index in Firebase Console

### Error: "Index must have at least one field"
- **Solution**: Make sure field names have no leading/trailing spaces
- Type field paths exactly: `userId`, `collegeSlug`, `timestamp` (no quotes in console)

### Metrics not updating
- **Solution**: Metrics are calculated on-demand when `ensureCollegeMetrics()` is called
- They update automatically after each assessment is saved
- Refresh the admin dashboard to see updated metrics

### Students not appearing in admin dashboard
- **Solution**: Ensure students are saved to Firestore when they log in
- Check that `upsertUserProfile()` is called in student login
- Verify `collegeSlug` matches between student and admin

## Next Steps

1. ✅ Create all indexes listed above
2. ✅ Deploy security rules (optional but recommended)
3. ✅ Test with a student account
4. ✅ Verify assessments are saved
5. ✅ Check admin dashboard shows students and graphs

---

**Note**: Index creation can take a few minutes. The app will show an error with a direct link to create the index if one is missing.
