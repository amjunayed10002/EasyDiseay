
'use client';

/**
 * TASK: Website Traffic Tracking
 * Purpose: Increments the global visitor counter in Firestore once per session 
 * and provides the current count and visibility settings to the application.
 */

import { useEffect } from 'react';
import { doc, increment } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';

export function useVisitorCounter() {
  const db = useFirestore();
  const statsRef = useMemoFirebase(() => doc(db, 'stats', 'main'), [db]);
  const { data: statsData, isLoading } = useDoc(statsRef);

  useEffect(() => {
    // Only increment once per browser session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited && statsRef) {
      // Use non-blocking setDoc with merge to increment. 
      setDocumentNonBlocking(statsRef, { 
        visitorCount: increment(1)
      }, { merge: true });
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, [statsRef]);

  return {
    visitorCount: statsData?.visitorCount || 0,
    showVisitorCount: !!statsData?.showVisitorCount,
    isLoading
  };
}
