"use client";

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "../firebase/config";

console.log("Firebase Config:", firebaseConfig);

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export default app;