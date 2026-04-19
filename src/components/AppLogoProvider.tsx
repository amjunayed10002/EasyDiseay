
'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

type AppLogoContextType = {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
};

const AppLogoContext = createContext<AppLogoContextType | undefined>(undefined);

export function AppLogoProvider({children}: {children: ReactNode}) {
  const db = useFirestore();
  // Using useMemoFirebase to stabilize the reference and prevent infinite loops
  const statsRef = useMemoFirebase(() => doc(db, 'stats', 'main'), [db]);
  const { data: statsData } = useDoc(statsRef);
  
  // localLogo provides optimistic UI updates while the Firestore write propagates
  const [localLogo, setLocalLogo] = useState<string | null>(null);

  useEffect(() => {
    // Sync local state with Firestore whenever the global database setting changes
    if (statsData?.logoUrl !== undefined) {
      setLocalLogo(statsData.logoUrl);
    }
  }, [statsData?.logoUrl]);

  /**
   * Updates the logo globally by storing it as a Base64 string in Firestore.
   * This provides a free alternative to Firebase Storage for student/prototype projects.
   */
  const setLogoUrl = (url: string | null) => {
    // 1. Optimistic update for the current user's immediate UI feedback
    setLocalLogo(url);
    
    // 2. Persist to Firestore so all visitors globally see the same logo
    if (statsRef) {
      setDocumentNonBlocking(statsRef, { 
        logoUrl: url 
      }, { merge: true });
    }
  };

  return (
    <AppLogoContext.Provider value={{logoUrl: localLogo, setLogoUrl}}>
      {children}
    </AppLogoContext.Provider>
  );
}

export function useAppLogo() {
  const context = useContext(AppLogoContext);
  if (context === undefined) {
    throw new Error('useAppLogo must be used within an AppLogoProvider');
  }
  return context;
}
