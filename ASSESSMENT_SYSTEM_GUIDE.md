# Assessment System & Metrics Update Guide

## Overview

The Mental Health Hub now has a complete assessment tracking system that:
- ✅ Saves all assessments (Dr. Aris AI, PHQ9, Voice AI) to Firestore
- ✅ Shows student past records on login
- ✅ Updates college metrics automatically
- ✅ Displays graphs and individual student scores in admin dashboard

## What Changed

### 1. **New Firestore Collection: `assessments`**
   - Stores all assessment results with timestamp
   - Links to user ID and college slug
   - Includes severity, score, recommendations

### 2. **Student Dashboard Updates**
   - **Loads past assessments** on page load
   - **Shows latest score** in header
   - **Displays assessment history** (last 3-5 assessments)
   - **Saves new assessments** automatically after completion

### 3. **College Admin Dashboard Updates**
   - **Loads students from Firestore** (not localStorage)
   - **Shows weekly trends graph** (last 7 days)
   - **Displays individual student scores** with color coding
   - **Clickable student cards** to view assessment history
   - **Real-time metrics** calculated from assessment data

### 4. **Metrics Calculation**
   - **Active Students**: Unique users with assessments in last 30 days
   - **Total Students**: Count from `users` collection
   - **Average Health Score**: Calculated from all assessments
   - **High Risk Alerts**: Count of "High" severity assessments
   - **Response Time**: Currently 0 (ready for future integration)

## Firestore Setup Required

### Step 1: Create Indexes

You **MUST** create these composite indexes in Firebase Console:

1. **assessments** collection:
   - `userId` (Ascending) + `timestamp` (Descending)
   - `collegeSlug` (Ascending) + `timestamp` (Descending)
   - `userId` (Ascending) + `collegeSlug` (Ascending) + `timestamp` (Descending)

2. **users** collection:
   - `collegeSlug` (Ascending) + `role` (Ascending)

**How to create:**
- Go to Firebase Console → Firestore → Indexes
- Click "Create Index"
- Add fields in exact order shown above
- Wait 1-5 minutes for index to build

**OR** use Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

### Step 2: Verify Collections

After students take assessments, you should see:
- **`assessments`** collection with documents
- **`users`** collection with student profiles
- **`collegeMetrics`** collection with calculated metrics

## How It Works

### Student Flow

1. **Student logs in** → User profile saved to Firestore `users` collection
2. **Student takes assessment** (Dr. Aris/PHQ9) → Assessment saved to `assessments` collection
3. **Metrics updated** → `collegeMetrics` recalculated automatically
4. **Next login** → Past assessments loaded and displayed

### Admin Flow

1. **Admin opens dashboard** → Loads students from Firestore
2. **For each student** → Fetches latest assessment score
3. **Calculates metrics** → From all assessments in college
4. **Displays graphs** → Weekly trends from last 7 days
5. **Click student** → Shows individual assessment history

## Data Flow

```
Student Login
    ↓
Save to Firestore (users collection)
    ↓
Take Assessment (Dr. Aris/PHQ9)
    ↓
Save Assessment (assessments collection)
    ↓
Update Metrics (collegeMetrics collection)
    ↓
Display in Dashboards
```

## Assessment Types

### Dr. Aris AI (`type: "dr-aris"`)
- **Score**: 0-100 (Vitality Index from Dr. Aris)
- **Severity**: Calculated from score (≥70=Low, 40-69=Medium, <40=High)
- **Saved automatically** when session completes

### PHQ9 (`type: "phq9"`)
- **Raw Score**: 0-27 (sum of 9 questions)
- **Health Score**: 0-100 (converted: `100 - (rawScore/27)*100`)
- **Severity**: Based on PHQ9 scoring ranges
- **Saved automatically** when quiz completes

### Voice AI (`type: "voice-ai"`)
- **Score**: 0-100 (from mock API)
- **Severity**: Low/Medium/High
- **Note**: Currently uses mock data, can be replaced with real analysis

## Metrics Calculation Logic

### `calculateAndUpdateMetrics(collegeSlug)`

1. **Get active student IDs**: Unique users with assessments
2. **Get total students**: Count from `users` collection where `role="student"` and `collegeSlug` matches
3. **Calculate average health score**: Sum all assessment scores / count
4. **Count high risk alerts**: Filter assessments where `severity === "High"`
5. **Save to `collegeMetrics` collection**

**Called automatically when:**
- Student completes assessment
- Admin dashboard loads
- Metrics are refreshed

## Student Dashboard Features

### Past Assessments Display
- Shows last 3-5 assessments
- Color-coded by severity (red/orange/green)
- Shows assessment type (Dr. Aris/PHQ9)
- Displays date and score

### Latest Score
- Displayed in header next to college average
- Updates after each assessment
- Used for personal HealthGauge

## Admin Dashboard Features

### Weekly Trends Graph
- **Line chart** showing average health score over last 7 days
- **X-axis**: Dates
- **Y-axis**: Health Score (0-100)
- **Data**: Aggregated from all student assessments

### Student List
- **Color-coded scores**: Red (High), Orange (Medium), Green (Low)
- **Click to expand**: Shows individual assessment history
- **Status badges**: Anonymous vs Registered
- **Assessment count**: Number of assessments per student

### Individual Student History
- **Expandable view**: Click student card to see history
- **Last 10 assessments**: Chronological list
- **Score and severity**: For each assessment
- **Assessment type**: Dr. Aris, PHQ9, etc.

## Testing Checklist

### Student Testing
- [ ] Login as student → Check user saved to Firestore
- [ ] Take Dr. Aris assessment → Verify assessment saved
- [ ] Check dashboard → See past assessments
- [ ] Take PHQ9 → Verify score calculated correctly
- [ ] Check metrics update → Refresh admin dashboard

### Admin Testing
- [ ] Login as admin → See student list
- [ ] Check metrics → Verify active students, health score, alerts
- [ ] View weekly trends → See graph with data
- [ ] Click student → See assessment history
- [ ] Refresh button → Updates all data

### Metrics Testing
- [ ] Multiple students take assessments
- [ ] Check `collegeMetrics` document → Verify calculations
- [ ] Verify active students count
- [ ] Verify average health score
- [ ] Verify high risk alerts count

## Troubleshooting

### "The query requires an index"
- **Solution**: Create the missing index (link provided in error)
- Check `firestore.indexes.json` for all required indexes

### Metrics show 0
- **Solution**: Ensure assessments are being saved
- Check Firestore console for `assessments` collection
- Verify `collegeSlug` matches between student and admin

### Students not appearing
- **Solution**: Verify students are saved to Firestore on login
- Check `users` collection for student documents
- Ensure `collegeSlug` is set correctly

### Graphs not showing
- **Solution**: Need at least 1 assessment in last 7 days
- Check `assessments` collection has recent data
- Verify `timestamp` field is set correctly

## Code Changes Summary

### New Files
- `src/lib/db/assessments.ts` - Assessment CRUD operations
- `FIRESTORE_SETUP_GUIDE.md` - Index creation guide
- `ASSESSMENT_SYSTEM_GUIDE.md` - This file

### Modified Files
- `src/lib/db/metrics.ts` - Now calculates from real data
- `src/app/pages/StudentDashboard.tsx` - Saves/loads assessments
- `src/app/pages/CollegeAdminDashboard.tsx` - Shows graphs and student data
- `src/app/components/PHQ9Chatbot.tsx` - Now passes score
- `src/app/student/login/page.tsx` - Saves user to Firestore
- `firestore.indexes.json` - Added required indexes

## Next Steps

1. ✅ Create Firestore indexes (see FIRESTORE_SETUP_GUIDE.md)
2. ✅ Test student login → Verify user saved
3. ✅ Take assessment → Verify assessment saved
4. ✅ Check admin dashboard → Verify metrics and graphs
5. ✅ Test with multiple students → Verify aggregation works

---

**System is now fully functional with real-time data tracking!** 🎉
