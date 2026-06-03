import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { DiscussSession } from "@/lib/types";

function sessionsCol() {
  return collection(getFirestoreDb(), "discussSessions");
}

function normalizeSession(docId: string, data: any): DiscussSession {
  return {
    id: docId,
    collegeSlug: data.collegeSlug,
    status: data.status,
    createdByUserId: data.createdByUserId,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    activeSpeakerSeatIndex: data.activeSpeakerSeatIndex ?? 0,
    seats: Array.isArray(data.seats) ? data.seats : [],
  } as DiscussSession;
}

export async function findActiveSession(collegeSlug: string): Promise<DiscussSession | null> {
  const q = query(
    sessionsCol(),
    where("collegeSlug", "==", collegeSlug),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  const d = snap.docs[0];
  if (!d) return null;
  return normalizeSession(d.id, d.data());
}

export async function startDiscussSession(params: {
  collegeSlug: string;
  psychiatristUserId: string;
  psychiatristDisplayName?: string;
}): Promise<string> {
  // If already active, return it.
  const existing = await findActiveSession(params.collegeSlug);
  if (existing) return existing.id;

  const seat0 = {
    seatIndex: 0,
    kind: "psychiatrist",
    userId: params.psychiatristUserId,
    displayName: params.psychiatristDisplayName ?? "Psychiatrist",
  };
  const seats = [
    seat0,
    { seatIndex: 1, kind: "member" },
    { seatIndex: 2, kind: "member" },
    { seatIndex: 3, kind: "member" },
    { seatIndex: 4, kind: "member" },
    { seatIndex: 5, kind: "member" },
  ];

  const ref = await addDoc(sessionsCol(), {
    collegeSlug: params.collegeSlug,
    status: "active",
    createdByUserId: params.psychiatristUserId,
    activeSpeakerSeatIndex: 0,
    seats,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function endDiscussSession(sessionId: string): Promise<void> {
  await updateDoc(doc(sessionsCol(), sessionId), {
    status: "ended",
    updatedAt: serverTimestamp(),
  });
}

export async function setActiveSpeaker(sessionId: string, seatIndex: number): Promise<void> {
  await updateDoc(doc(sessionsCol(), sessionId), {
    activeSpeakerSeatIndex: seatIndex,
    updatedAt: serverTimestamp(),
  });
}

export async function joinDiscussSession(params: {
  sessionId: string;
  userId: string;
  displayName: string;
}): Promise<number> {
  const ref = doc(sessionsCol(), params.sessionId);
  return await runTransaction(getFirestoreDb(), async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Session not found");
    const data = snap.data() as any;
    if (data.status !== "active") throw new Error("Session is not active");
    const seats: any[] = Array.isArray(data.seats) ? [...data.seats] : [];

    // Already seated?
    const existingSeat = seats.find((s) => s.userId === params.userId);
    if (existingSeat) return Number(existingSeat.seatIndex);

    // Find first free member seat (1..5)
    const free = seats.find(
      (s) => s.kind === "member" && (!s.userId || s.userId === null || s.userId === "")
    );
    if (!free) throw new Error("Room is full");

    free.userId = params.userId;
    free.displayName = params.displayName;
    free.joinedAt = new Date(); // Use Date instead of serverTimestamp() - Firestore doesn't allow serverTimestamp() inside arrays

    tx.update(ref, { seats, updatedAt: serverTimestamp() });
    return Number(free.seatIndex);
  });
}

export function subscribeToDiscussSession(
  sessionId: string,
  cb: (session: DiscussSession | null) => void
): () => void {
  return onSnapshot(doc(sessionsCol(), sessionId), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb(normalizeSession(snap.id, snap.data()));
  });
}

