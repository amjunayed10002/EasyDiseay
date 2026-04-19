"use client";

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "@/firebase/config";

console.log("🔥 Firebase Config Loaded:", firebaseConfig);

if (!firebaseConfig) {
  throw new Error("Firebase config is undefined");
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export default app;