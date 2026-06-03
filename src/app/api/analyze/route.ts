import { NextRequest, NextResponse } from "next/server";
import { VoiceAnalysisResult, FacialAnalysisResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    // Mock AI Analysis - Production would call AssemblyAI + MediaPipe
    if (type === "voice") {
      const voiceResult: VoiceAnalysisResult = {
        sentiment: Math.random() * 0.6 - 0.3, // -0.3 to 0.3 range
        emotions: {
          happy: Math.random() * 0.3,
          sad: Math.random() * 0.4,
          stressed: Math.random() * 0.5,
          neutral: Math.random() * 0.4,
        },
        speechRate: 120 + Math.random() * 40,
        pauses: Math.floor(Math.random() * 10),
      };

      return NextResponse.json({
        success: true,
        data: voiceResult,
        severity: calculateSeverityFromVoice(voiceResult),
      });
    }

    if (type === "facial") {
      const facialResult: FacialAnalysisResult = {
        emotions: {
          happy: Math.random() * 0.3,
          sad: Math.random() * 0.4,
          angry: Math.random() * 0.2,
          surprised: Math.random() * 0.2,
          fearful: Math.random() * 0.3,
          disgusted: Math.random() * 0.1,
          neutral: Math.random() * 0.5,
        },
        attention: 0.6 + Math.random() * 0.3,
        engagement: 0.5 + Math.random() * 0.4,
      };

      return NextResponse.json({
        success: true,
        data: facialResult,
        severity: calculateSeverityFromFacial(facialResult),
      });
    }

    if (type === "combined") {
      const voiceResult: VoiceAnalysisResult = {
        sentiment: Math.random() * 0.6 - 0.3,
        emotions: {
          happy: Math.random() * 0.3,
          sad: Math.random() * 0.4,
          stressed: Math.random() * 0.5,
          neutral: Math.random() * 0.4,
        },
        speechRate: 120 + Math.random() * 40,
        pauses: Math.floor(Math.random() * 10),
      };

      const facialResult: FacialAnalysisResult = {
        emotions: {
          happy: Math.random() * 0.3,
          sad: Math.random() * 0.4,
          angry: Math.random() * 0.2,
          surprised: Math.random() * 0.2,
          fearful: Math.random() * 0.3,
          disgusted: Math.random() * 0.1,
          neutral: Math.random() * 0.5,
        },
        attention: 0.6 + Math.random() * 0.3,
        engagement: 0.5 + Math.random() * 0.4,
      };

      const combinedSeverity = calculateCombinedSeverity(voiceResult, facialResult);

      return NextResponse.json({
        success: true,
        data: {
          voice: voiceResult,
          facial: facialResult,
        },
        severity: combinedSeverity.severity,
        score: combinedSeverity.score,
        recommendations: combinedSeverity.recommendations,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid analysis type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { success: false, error: "Analysis failed" },
      { status: 500 }
    );
  }
}

function calculateSeverityFromVoice(voice: VoiceAnalysisResult): "Low" | "Medium" | "High" {
  const score = (voice.sentiment + 1) / 2; // Normalize to 0-1
  if (score < 0.4) return "High";
  if (score < 0.6) return "Medium";
  return "Low";
}

function calculateSeverityFromFacial(facial: FacialAnalysisResult): "Low" | "Medium" | "High" {
  const negativeEmotions = facial.emotions.sad + facial.emotions.angry + facial.emotions.fearful;
  const score = negativeEmotions / 3;
  if (score > 0.5) return "High";
  if (score > 0.3) return "Medium";
  return "Low";
}

function calculateCombinedSeverity(
  voice: VoiceAnalysisResult,
  facial: FacialAnalysisResult
): {
  severity: "Low" | "Medium" | "High";
  score: number;
  recommendations: string[];
} {
  const voiceScore = (voice.sentiment + 1) / 2;
  const negativeEmotions = facial.emotions.sad + facial.emotions.angry + facial.emotions.fearful;
  const facialScore = 1 - negativeEmotions / 3;

  const combinedScore = voiceScore * 0.6 + facialScore * 0.4;

  let severity: "Low" | "Medium" | "High";
  const recommendations: string[] = [];

  if (combinedScore < 0.3) {
    severity = "High";
    recommendations.push("Immediate professional intervention recommended");
    recommendations.push("Contact crisis helpline: 1800-599-0019");
    recommendations.push("Schedule emergency counseling session");
  } else if (combinedScore < 0.6) {
    severity = "Medium";
    recommendations.push("Book a session with college counselor");
    recommendations.push("Try guided breathing exercises");
    recommendations.push("Monitor your mood over the next week");
  } else {
    severity = "Low";
    recommendations.push("Maintain healthy routines");
    recommendations.push("Practice mindfulness exercises");
    recommendations.push("Regular check-ins recommended");
  }

  return {
    severity,
    score: Math.round(combinedScore * 100),
    recommendations,
  };
}

