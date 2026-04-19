
'use client';

import React, {useEffect, useState} from 'react';
import {CropDoctorApp} from '@/components/CropDoctorApp';
import {useLanguage} from '@/components/LanguageProvider';
import {useAppLogo} from '@/components/AppLogoProvider';
import {ShieldPlus, MapPin, UserCircle, Settings, LogIn, ArrowLeft, UserPlus, Mail, Phone, HelpCircle} from 'lucide-react';
import Link from 'next/link';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import {useFirestore, useDoc, useMemoFirebase} from '@/firebase';
import {doc} from 'firebase/firestore';

export default function DoctorPage() {
  const {t} = useLanguage();
  const {logoUrl} = useAppLogo();
  const {toast} = useToast();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [securityMode, setSecurityMode] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);
  
  const [userId, setUserId] = useState('');
  const [userCode, setUserCode] = useState('');

  const [adminEmail, setAdminEmail] = useState('315222057@hamdarduniversity.edu.bd');
  const [adminPhone, setAdminPhone] = useState('+880123456789');

  // Stats logic for global config
  const statsRef = useMemoFirebase(() => doc(db, 'stats', 'main'), [db]);
  const { data: statsData } = useDoc(statsRef);

  useEffect(() => {
    setMounted(true);
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    
    const loggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
    setIsUserLoggedIn(loggedIn);
  }, []);

  useEffect(() => {
    if (statsData) {
      setSecurityMode(!!statsData.securityMode);
      if (statsData.adminEmail) setAdminEmail(statsData.adminEmail);
      if (statsData.adminPhone) setAdminPhone(statsData.adminPhone);
    }
  }, [statsData]);

  if (!mounted) return null;

  const handleUserLogin = (e: React.FormEvent) => {
  e.preventDefault();

  const storedAdminCode =
    localStorage.getItem('adminLoginCode') ?? 'adnan@10002';

  const inputId = userId.trim();
  const inputCode = userCode.trim();

  // ✅ ADMIN LOGIN
  if (inputId === 'admin' && inputCode === storedAdminCode.trim()) {
    localStorage.setItem('isUserLoggedIn', 'true');
    localStorage.setItem('currentUserId', 'admin');

    setIsUserLoggedIn(true);

    toast({
      title: "Login Successful",
      description: "Welcome, Admin.",
    });

    return;
  }

  // ✅ NORMAL USER LOGIN
  const savedUsers = localStorage.getItem('registeredUsers');
  const users = savedUsers ? JSON.parse(savedUsers) : [];

  const matchedUser = users.find(
    (u: any) =>
      u.id?.trim() === inputId &&
      u.code?.trim() === inputCode
  );

  if (matchedUser) {
    if (matchedUser.status === 'Disabled') {
      toast({
        variant: 'destructive',
        title: t.disabled,
        description: "Your account is disabled. Please contact admin.",
      });
      return;
    }

    localStorage.setItem('isUserLoggedIn', 'true');
    localStorage.setItem('currentUserId', matchedUser.id);

    setIsUserLoggedIn(true);

    toast({
      title: "Login Successful",
      description: `Welcome, ${matchedUser.name}.`,
    });

    return;
  }

  // ❌ INVALID LOGIN
  toast({
    variant: 'destructive',
    title: t.invalidCredentials,
    description: "Please check your ID and Code.",
  });
};

  const handleUserLogout = () => {
    localStorage.removeItem('isUserLoggedIn');
    localStorage.removeItem('currentUserId');
    setIsUserLoggedIn(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    });
  };

  const showLogin = securityMode && !isUserLoggedIn;

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col font-body">
      <header className="w-full bg-[#1b7d3d] text-white py-3 px-6 shadow-sm z-20 sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
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
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 font-bold hover:underline bg-white/10 px-3 py-1 rounded-md">
                <Settings className="w-4 h-4" />
                {t.admin}
              </Link>
            )}
            <Link href="/nearby" className="hidden md:flex items-center gap-1.5 hover:underline">
              <MapPin className="w-4 h-4" />
              {t.findNearby}
            </Link>
            {isUserLoggedIn && (
              <Button variant="ghost" size="sm" onClick={handleUserLogout} className="text-white hover:bg-white/10 font-bold p-0">
                {t.logout}
              </Button>
            )}
            <Link href="/admin" className="hover:opacity-80" aria-label="Admin">
              <UserCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {showLogin ? (
        <section className="flex-1 flex flex-col items-center justify-center p-4 py-20 bg-white">
          <div className="text-center space-y-4 mb-10 animate-in fade-in duration-700">
            <div className="bg-[#1b7d3d]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCircle className="w-12 h-12 text-[#1b7d3d]" />
            </div>
            <h2 className="text-3xl font-bold text-[#1b7d3d]">{showRegisterInfo ? t.contactAdmin : t.userLoginTitle}</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">{showRegisterInfo ? "Contact us to get your User ID and Login Code" : t.userLoginSubtitle}</p>
          </div>
          
          <Card className="w-full max-w-md border-[#e1e9e4] rounded-[2.5rem] shadow-xl bg-white overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <CardContent className="p-10 space-y-8">
              {!showRegisterInfo ? (
                <>
                  <form onSubmit={handleUserLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">{t.userIdLabel}</Label>
                      <Input 
                        placeholder={t.userIdPlaceholder}
                        className="h-12 bg-[#f8faf9] border-[#e1e9e4] rounded-xl focus:ring-[#1b7d3d]"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">{t.loginCodeLabel}</Label>
                      <Input 
                        type="password"
                        placeholder={t.loginCodePlaceholder}
                        className="h-12 bg-[#f8faf9] border-[#e1e9e4] rounded-xl focus:ring-[#1b7d3d]"
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-14 bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                      <LogIn className="w-5 h-5" />
                      {t.loginButton}
                    </Button>
                  </form>

                  <div className="flex flex-col gap-4 text-center pt-2">
                    <Link 
                      href="/contact"
                      className="text-muted-foreground font-bold text-xs hover:underline inline-flex items-center justify-center gap-2"
                    >
                      <HelpCircle className="w-3 h-3" />
                      {t.forgetLoginCode}
                    </Link>
                    <button 
                      onClick={() => setShowRegisterInfo(true)}
                      className="text-[#1b7d3d] font-bold text-sm hover:underline inline-flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {t.noAccount} {t.register}
                    </button>
                    <Link href="/" className="text-muted-foreground font-bold text-sm hover:underline inline-flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      {t.backToHome}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-[#f0f9f1] p-6 rounded-3xl border border-[#1b7d3d]/10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1b7d3d] p-2 rounded-xl">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-[#1b7d3d] uppercase tracking-wider">{t.adminEmail}</p>
                        <p className="text-sm font-bold text-gray-800">{adminEmail}</p>
                      </div>
                    </div>
                    <div className="h-px bg-[#1b7d3d]/10 w-full"></div>
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1b7d3d] p-2 rounded-xl">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-[#1b7d3d] uppercase tracking-wider">{t.adminPhone}</p>
                        <p className="text-sm font-bold text-gray-800">{adminPhone}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => setShowRegisterInfo(false)}
                    className="w-full h-12 border-[#e1e9e4] rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <p className="mt-10 text-xs text-muted-foreground text-center">
            {t.adminContact}
          </p>
        </section>
      ) : (
        <>
          <section className="pt-16 pb-8 px-4 text-center space-y-4 animate-in fade-in duration-700">
            <Link href="/" className="inline-flex items-center gap-2 text-[#1b7d3d] hover:underline text-sm font-bold mb-6">
              <ArrowLeft className="w-4 h-4" />
              {t.backToHome}
            </Link>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1b7d3d] leading-tight">
              {t.doctorPageTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.uploadStartHint}
            </p>
          </section>

          <section className="flex-1 w-full max-w-6xl mx-auto px-4 pb-20">
            <CropDoctorApp />
          </section>
        </>
      )}

      <footer className="py-8 text-center text-muted-foreground text-xs border-t bg-white">
        <p>© {new Date().getFullYear()} {t.title}. All rights reserved.</p>
      </footer>
    </main>
  );
}
