# Dr. Aris AI Integration - Complete Guide

## Overview

Dr. Aris AI has been successfully integrated into the Mental Health Hub project. The AI-powered psychological analyst now replaces the mock API calls in the "Talk to Me" feature across all dashboards (Student, IT Employee, Elder).

## What Changed

### 1. **VoiceAIBtn Component** (`src/app/components/VoiceAIBtn.tsx`)
   - **Before**: Used a 5-minute timer with mock API call to `/api/analyze`
   - **After**: Launches Dr. Aris AI session with real-time voice and facial analysis
   - Button text changed from "Talk to Me" to "Talk to Dr. Aris"
   - Shows full Dr. Aris session interface when clicked

### 2. **New Components Created**
   - **DrArisSession.tsx**: Full Gemini Live API integration with 25-question diagnostic
   - **LiveVisualizer.tsx**: Audio visualization bars for active session
   - **audio-helpers.ts**: Audio encoding/decoding utilities for Gemini Live

### 3. **Layout Updates** (`src/app/layout.tsx`)
   - Added face-api.js script tag for facial emotion detection
   - Loads from CDN: `https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js`

### 4. **Global Styles** (`src/app/globals.css`)
   - Added `.glass-effect` class for backdrop blur effects
   - Added `.custom-scrollbar` styles for transcript area

### 5. **Environment Variables** (`env.example`)
   - Added `NEXT_PUBLIC_GOOGLE_AI_API_KEY` requirement

## Features

### Dr. Aris AI Capabilities
1. **25-Question Diagnostic**: Conducts a comprehensive psychological assessment
2. **Real-time Voice Analysis**: Uses Gemini 2.5 Flash Native Audio for natural conversation
3. **Facial Emotion Detection**: Analyzes facial expressions using face-api.js
4. **Emotional Congruence Check**: Detects mismatches between verbal and facial expressions
   - Example: If user says "I'm sad" but is smiling, Dr. Aris confronts the discrepancy
   - Reduces final score by 10 points for each major incongruence
5. **Vitality Index Score**: 0-100 well-being score based on analysis
6. **Personalized Recommendations**: Minimum 5 actionable solutions

### User Experience
- **Welcome Screen**: Button to start consultation
- **Live Session**: 
  - Real-time video feed with emotion detection
  - Audio visualization bars
  - Progress tracker (X/25 questions)
  - Live transcript of conversation
  - "DR. ARIS SPEAKING" / "WAITING FOR INPUT" indicators
- **Results**: 
  - Vitality Index score (0-100)
  - Psychological summary
  - Emotional congruence analysis
  - Prescriptive recommendations

## Setup Instructions

### 1. Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Enable Gemini 2.5 Flash Native Audio API access

### 2. Configure Environment Variables
Add to your `.env.local` file:
```env
NEXT_PUBLIC_GOOGLE_AI_API_KEY="your_google_ai_api_key_here"
```

### 3. Dependencies
All required packages are already in `package.json`:
- `@google/genai`: ^1.38.0 ✅ (already installed)

### 4. Face-API.js
The library is loaded automatically via CDN in `layout.tsx`. No additional installation needed.

## How It Works

### Flow
1. User clicks "Talk to Dr. Aris" button
2. Component checks for API key and face-api.js availability
3. Requests camera and microphone permissions
4. Loads face-api.js models (TinyFaceDetector, FaceExpressionNet)
5. Connects to Gemini Live API with:
   - Native audio input/output
   - Video frames sent every 1 second
   - Real-time transcription
6. Dr. Aris conducts 25-question diagnostic
7. After completion, calls `submitAnalysis` function
8. Returns results: severity, score, recommendations
9. Results displayed in existing ResultsCard component

### Technical Details

**Audio Processing**:
- Input: 16kHz sample rate, PCM format
- Output: 24kHz sample rate, decoded from base64
- Uses Web Audio API ScriptProcessor for real-time streaming

**Video Processing**:
- Captures frames at 320x240 resolution
- Sends JPEG images (60% quality) to Gemini every 1 second
- Face-api.js analyzes expressions locally
- Detected emotion displayed in real-time

**Session Management**:
- Uses Firestore-like real-time callbacks
- Handles interruptions gracefully
- Cleans up resources on completion/error

## Integration Points

### Where Dr. Aris is Used
1. **Student Dashboard** (`src/app/pages/StudentDashboard.tsx`)
   - VoiceAIBtn component → Dr. Aris session
2. **IT Employee Dashboard** (`src/app/pages/ITDashboard.tsx`)
   - VoiceAIBtn component → Dr. Aris session
3. **Elder Dashboard** (`src/app/elder/dashboard/page.tsx`)
   - VoiceAIBtn component → Dr. Aris session

### Results Integration
Results from Dr. Aris are automatically converted to the existing `Severity` format:
- Score ≥ 70: "Low" severity
- Score 40-69: "Medium" severity
- Score < 40: "High" severity

These results are passed to the existing `ResultsCard` component, maintaining UI consistency.

## Error Handling

### Common Issues

1. **"Google AI API key not configured"**
   - Solution: Add `NEXT_PUBLIC_GOOGLE_AI_API_KEY` to `.env.local`

2. **"face-api.js not loaded"**
   - Solution: Wait a few seconds for CDN to load, then retry
   - Check browser console for CDN errors

3. **"Could not start camera"**
   - Solution: Grant camera/microphone permissions
   - Check if another app is using the camera

4. **"Failed to load facial recognition models"**
   - Solution: Check internet connection
   - Models load from CDN: `https://justadudewhohacks.github.io/face-api.js/models`

## Testing

### Manual Testing Steps
1. Start dev server: `npm run dev`
2. Navigate to any dashboard (Student/IT/Elder)
3. Click "Talk to Dr. Aris" button
4. Grant camera/microphone permissions
5. Wait for face-api.js models to load
6. Start conversation with Dr. Aris
7. Answer 25 questions
8. Review results

### Expected Behavior
- Video feed shows user's face
- Emotion detection updates in real-time
- Progress bar advances with each question
- Transcript shows conversation history
- Audio visualization bars animate during speech
- Results appear after 25 questions

## Performance Considerations

- **Face-api.js Models**: ~2-3MB, loaded once per session
- **Video Frames**: Sent every 1 second (320x240 JPEG, ~10-20KB each)
- **Audio Streaming**: Real-time PCM data, minimal bandwidth
- **Memory**: Audio contexts and buffers cleaned up after session

## Future Enhancements

Potential improvements:
1. Cache face-api.js models in IndexedDB for faster loading
2. Add session recording/playback
3. Support for multiple languages
4. Integration with Firestore to save assessment history
5. Export results as PDF report

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API key is correctly set
3. Ensure camera/microphone permissions are granted
4. Test in Chrome/Edge (best compatibility with Web Audio API)

---

**Integration Complete** ✅

Dr. Aris AI is now fully integrated and ready to use across all Mental Health Hub dashboards!
