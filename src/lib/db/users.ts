import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import type { User, UserRole } from "@/lib/types";

const usersColPath = "users";

export async function getUserProfile(userId: string): Promise<User | null> {
  const ref = doc(getFirestoreDb(), usersColPath, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    role: (data.role as UserRole) ?? "student",
    name: data.name ?? "User",
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    collegeSlug: data.collegeSlug ?? undefined,
    isAnonymous: Boolean(data.isAnonymous),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}

export async function upsertUserProfile(user: {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  collegeSlug?: string;
  isAnonymous: boolean;
}): Promise<void> {
  const ref = doc(getFirestoreDb(), usersColPath, user.id);
  await setDoc(
    ref,
    {
      role: user.role,
      name: user.name,
      email: user.email ?? null,
      phone: user.phone ?? null,
      collegeSlug: user.collegeSlug ?? null,
      isAnonymous: user.isAnonymous,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

