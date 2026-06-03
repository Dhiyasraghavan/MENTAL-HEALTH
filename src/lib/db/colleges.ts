import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase/client";
import { withCache, queryCache } from "@/lib/cache";
import type { College, CollegeStatus } from "@/lib/types";

function slugifyCollegeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collegesCol() {
  return collection(getFirestoreDb(), "colleges");
}

export async function listActiveColleges(): Promise<College[]> {
  return withCache(
    "colleges:active",
    async () => {
      const q = query(
        collegesCol(),
        where("status", "==", "active"),
        orderBy("name", "asc"),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          slug: d.id,
          name: data.name ?? d.id,
          status: (data.status as CollegeStatus) ?? "active",
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          createdByUserId: data.createdByUserId,
        };
      });
    },
    10 * 60 * 1000,
  ); // Cache for 10 minutes
}

export async function getCollege(slug: string): Promise<College | null> {
  return withCache(
    `college:${slug}`,
    async () => {
      const ref = doc(collegesCol(), slug);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const data = snap.data() as any;
      return {
        slug: snap.id,
        name: data.name ?? snap.id,
        status: (data.status as CollegeStatus) ?? "active",
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        createdByUserId: data.createdByUserId,
      };
    },
    10 * 60 * 1000,
  ); // Cache for 10 minutes
}

export async function upsertCollege(params: {
  name: string;
  status?: CollegeStatus;
  createdByUserId?: string;
}): Promise<College> {
  const slug = slugifyCollegeName(params.name);
  const ref = doc(collegesCol(), slug);

  await setDoc(
    ref,
    {
      name: params.name.trim(),
      status: params.status ?? "active",
      createdByUserId: params.createdByUserId ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  // Invalidate cache
  queryCache.delete("colleges:active");
  queryCache.delete(`college:${slug}`);

  const c = await getCollege(slug);
  if (!c) {
    // Should never happen, but keep types happy.
    return {
      slug,
      name: params.name.trim(),
      status: params.status ?? "active",
      createdAt: new Date(),
    };
  }
  return c;
}
