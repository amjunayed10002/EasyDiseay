
'use client';

import React, {useEffect, useState} from 'react';
import {useLanguage} from '@/components/LanguageProvider';
import {useAppLogo} from '@/components/AppLogoProvider';
import {ShieldPlus, Mail, ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import {Card, CardContent} from '@/components/ui/card';
import {useFirestore, useDoc, useMemoFirebase} from '@/firebase';
import {doc} from 'firebase/firestore';

export default function ContactPage() {
  const {t} = useLanguage();
  const {logoUrl} = useAppLogo();
  const db = useFirestore();
  const [adminEmail, setAdminEmail] = useState('315222057@hamdarduniversity.edu.bd');
  const [mounted, setMounted] = useState(false);

  // Stats logic for global email
  const statsRef = useMemoFirebase(() => doc(db, 'stats', 'main'), [db]);
  const { data: statsData } = useDoc(statsRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (statsData?.adminEmail) {
      setAdminEmail(statsData.adminEmail);
    }
  }, [statsData]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col font-body">
      <header className="w-full bg-[#1b7d3d] text-white py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90">
            <div className="bg-white p-1 rounded-xl flex items-center justify-center overflow-hidden w-8 h-8">
              {logoUrl ? (
                <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" />
              ) : (
                <ShieldPlus className="w-6 h-6 text-[#1b7d3d]" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">{t.title}</h1>
              <p className="text-xs opacity-80">{t.appDescription}</p>
            </div>
          </Link>
          <Link href="/" className="text-sm font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="bg-[#1b7d3d]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-[#1b7d3d]" />
          </div>
          <h2 className="text-4xl font-bold text-[#1b7d3d]">{t.contactAdmin}</h2>
          
          <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-12 space-y-6">
              <div className="bg-[#1b7d3d] text-white p-8 rounded-3xl shadow-inner">
                <p className="text-xl font-bold mb-4">
                  {adminEmail}
                </p>
                <div className="h-px bg-white/20 w-full mb-4"></div>
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                  {t.contactInstructions}
                </p>
              </div>
            </CardContent>
          </Card>

          <Link href="/" className="inline-flex items-center gap-2 text-[#1b7d3d] font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground text-xs border-t bg-white">
        <p>© {new Date().getFullYear()} {t.title}. All rights reserved.</p>
      </footer>
    </main>
  );
}
