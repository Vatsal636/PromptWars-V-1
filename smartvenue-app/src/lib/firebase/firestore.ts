// ─── Firestore Service ───
// Provides Firestore instance, typed collection references, and data seeding.

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  type Firestore,
  type CollectionReference,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseApp } from './config';
import type { StadiumZone, QueueStation, AIAlert, Incident, GateData } from '@/types';

let firestoreInstance: Firestore | null = null;

/**
 * Get or initialize Firestore instance.
 */
export function getFirestoreDb(): Firestore | null {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    if (!app) return null;
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

// ─── Collection Names ───
export const COLLECTIONS = {
  CROWD_ZONES: 'crowd_zones',
  QUEUES: 'queues',
  ALERTS: 'alerts',
  INCIDENTS: 'incidents',
  GATES: 'gates',
  ROUTES: 'routes',
  VENUE_STATS: 'venue_stats',
} as const;

/**
 * Get typed collection reference.
 */
export function getCollection(name: string): CollectionReference<DocumentData> | null {
  const db = getFirestoreDb();
  if (!db) return null;
  return collection(db, name);
}

// ─── Data Seeding ───

/**
 * Seed crowd zones into Firestore.
 */
export async function seedCrowdZones(zones: StadiumZone[]): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  for (const zone of zones) {
    await setDoc(doc(db, COLLECTIONS.CROWD_ZONES, zone.id), {
      ...zone,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Seed queue stations into Firestore.
 */
export async function seedQueues(stations: QueueStation[]): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  for (const station of stations) {
    await setDoc(doc(db, COLLECTIONS.QUEUES, station.id), {
      ...station,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Seed alerts into Firestore.
 */
export async function seedAlerts(alerts: AIAlert[]): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  for (const alert of alerts) {
    await setDoc(doc(db, COLLECTIONS.ALERTS, alert.id), {
      ...alert,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Seed incidents into Firestore.
 */
export async function seedIncidents(incidents: Incident[]): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  for (const incident of incidents) {
    await setDoc(doc(db, COLLECTIONS.INCIDENTS, incident.id), {
      ...incident,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Seed gate data into Firestore.
 */
export async function seedGates(gates: GateData[]): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  for (const gate of gates) {
    await setDoc(doc(db, COLLECTIONS.GATES, gate.id), {
      ...gate,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Update venue-wide stats document.
 */
export async function updateVenueStats(stats: Record<string, unknown>): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await setDoc(doc(db, COLLECTIONS.VENUE_STATS, 'current'), {
    ...stats,
    updatedAt: Date.now(),
  });
}

// ─── Real-Time Listeners ───

/**
 * Subscribe to crowd zones collection. Returns unsubscribe function.
 */
export function subscribeCrowdZones(
  callback: (zones: StadiumZone[]) => void
): Unsubscribe {
  const col = getCollection(COLLECTIONS.CROWD_ZONES);
  if (!col) return () => {};
  const q = query(col);
  return onSnapshot(q, (snapshot) => {
    const zones: StadiumZone[] = [];
    snapshot.forEach((doc) => {
      zones.push({ id: doc.id, ...doc.data() } as StadiumZone);
    });
    callback(zones);
  });
}

/**
 * Subscribe to queue stations collection.
 */
export function subscribeQueues(
  callback: (queues: QueueStation[]) => void
): Unsubscribe {
  const col = getCollection(COLLECTIONS.QUEUES);
  if (!col) return () => {};
  const q = query(col);
  return onSnapshot(q, (snapshot) => {
    const queues: QueueStation[] = [];
    snapshot.forEach((doc) => {
      queues.push({ id: doc.id, ...doc.data() } as QueueStation);
    });
    callback(queues);
  });
}

/**
 * Subscribe to AI alerts collection.
 */
export function subscribeAlerts(
  callback: (alerts: AIAlert[]) => void
): Unsubscribe {
  const col = getCollection(COLLECTIONS.ALERTS);
  if (!col) return () => {};
  const q = query(col);
  return onSnapshot(q, (snapshot) => {
    const alerts: AIAlert[] = [];
    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() } as AIAlert);
    });
    callback(alerts);
  });
}

/**
 * Subscribe to incidents collection.
 */
export function subscribeIncidents(
  callback: (incidents: Incident[]) => void
): Unsubscribe {
  const col = getCollection(COLLECTIONS.INCIDENTS);
  if (!col) return () => {};
  const q = query(col);
  return onSnapshot(q, (snapshot) => {
    const incidents: Incident[] = [];
    snapshot.forEach((doc) => {
      incidents.push({ id: doc.id, ...doc.data() } as Incident);
    });
    callback(incidents);
  });
}
