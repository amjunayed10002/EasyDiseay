
'use client';

/**
 * TASK: Application Landing Page
 * Purpose: Introduces the "EasyDiseay" platform, displays hero sections, 
 * supported crops, and the global visitor counter.
 */

import React, {useEffect, useState} from 'react';
import {useLanguage} from '@/components/LanguageProvider';
import {useAppLogo} from '@/components/AppLogoProvider';
import {useVisitorCounter} from '@/hooks/use-visitor-counter';
import {useFirestore, useDoc, useMemoFirebase} from '@/firebase';
import {doc} from 'firebase/firestore';
import {
  ShieldPlus, 
  MapPin, 
  UserCircle, 
  Settings, 
  ArrowRight, 
  Camera, 
  Zap, 
  CheckCircle2,
  Sprout,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';

interface CropItem {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  isImage?: boolean;
}

export default function HomePage() {
  const {t, setLanguage, language} = useLanguage();
  const {logoUrl} = useAppLogo();
  const {visitorCount, showVisitorCount} = useVisitorCounter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [showManyMore, setShowManyMore] = useState(true);

  const db = useFirestore();
  const statsRef = useMemoFirebase(() => doc(db, 'stats', 'main'), [db]);
  const { data: statsData } = useDoc(statsRef);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    // Load crops from Firestore, fallback to localStorage for backward compatibility
    if (statsData?.supportedCrops) {
      setCrops(statsData.supportedCrops);
    } else {
      const savedCrops = localStorage.getItem('supportedCrops');
      if (savedCrops) {
        setCrops(JSON.parse(savedCrops));
      } else {
        const defaultCrops: CropItem[] = [
          { id: '1', nameEn: 'Cucumber', nameBn: 'শসা', icon: '🥒' },
          { id: '4', nameEn: 'Potato', nameBn: 'আলু', icon: '🥔' },
          { id: '6', nameEn: 'Tomato', nameBn: 'টমেটো', icon: '🍅' },
        ];
        setCrops(defaultCrops);
      }
    }

    const manyMoreStatus = statsData?.showManyMore !== false;
    setShowManyMore(manyMoreStatus);
  }, [statsData]);

  return (
    <main className="min-h-screen bg-white flex flex-col font-body">
      <header className="w-full bg-[#1b7d3d] text-white py-3 px-6 shadow-sm z-50 sticky top-0">
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
                <p className="text-[10px] opacity-80">{t.appDescription}</p>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-[#secondary] transition-colors">{t.backToHome}</Link>
            <Link href="#features" className="hover:text-[#secondary] transition-colors">{t.features}</Link>
            <Link href="/nearby" className="hover:text-[#secondary] transition-colors">{t.findNearby}</Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 font-bold hover:underline bg-white/10 px-3 py-1 rounded-md">
                <Settings className="w-4 h-4" />
                {t.admin}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/10 p-1 rounded-lg">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] rounded ${language === 'en' ? 'bg-white text-[#1b7d3d]' : 'text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('bn')}
                className={`px-2 py-1 text-[10px] rounded ${language === 'bn' ? 'bg-white text-[#1b7d3d]' : 'text-white'}`}
              >
                BN
              </button>
            </div>
            <Link href="/admin" className="hover:opacity-80" aria-label="Admin">
              <UserCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f9f1] via-[#f8faf9] to-white pt-16 pb-12 md:pt-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
            <div className="bg-white p-1 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden w-24 h-24 mb-4 border border-[#e1e9e4]">
              {logoUrl ? (
                <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" />
              ) : (
                <ShieldPlus className="w-16 h-16 text-[#1b7d3d]" />
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b7d3d]/10 text-[#1b7d3d] text-sm font-bold">
              <Sprout className="w-4 h-4" />
              {t.impact3} {t.confidence}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b7d3d] leading-tight text-center">
              {t.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed text-center">
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-10">
              <Link href="/doctor">
                <Button className="h-16 px-10 text-lg font-bold bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 rounded-2xl shadow-lg shadow-[#1b7d3d]/20 transition-all active:scale-95">
                  {t.startDiagnosis}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/nearby">
                <Button variant="outline" className="h-16 px-10 text-lg font-bold border-[#e1e9e4] rounded-2xl hover:bg-[#1b7d3d]/5 bg-white">
                  {t.findNearby}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-sm font-bold text-[#1b7d3d] tracking-widest uppercase">{t.howItWorks}</h2>
            <p className="text-4xl font-bold text-gray-900">{t.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Camera, title: t.step1, desc: t.step1Desc },
              { icon: Zap, title: t.step2, desc: t.step2Desc },
              { icon: CheckCircle2, title: t.step3, desc: t.step3Desc }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-6 group">
                <div className="w-20 h-20 mx-auto bg-[#f8faf9] rounded-3xl flex items-center justify-center border border-[#e1e9e4] group-hover:bg-[#1b7d3d] group-hover:text-white transition-all duration-300 shadow-sm">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#f1f8f3]">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900">{t.supportedCrops}</h2>
            <p className="text-xl font-bold text-[#1b7d3d]">{language === 'en' ? 'Our Supported Crops' : 'আমাদের সাপোর্টেড ফসল'}</p>
            <div className="w-12 h-1 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {crops.map((crop) => (
              <div 
                key={crop.id} 
                className="bg-white px-6 py-3 rounded-full shadow-sm border border-[#e1e9e4] flex items-center gap-2 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {crop.isImage ? (
                    <img src={crop.icon} alt={crop.nameEn} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-xl">{crop.icon}</span>
                  )}
                </div>
                <span className="font-bold text-gray-800">
                  {language === 'en' ? crop.nameEn : crop.nameBn}
                </span>
              </div>
            ))}
            {showManyMore && (
              <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-[#e1e9e4] flex items-center gap-2 opacity-80">
                <Sparkles className="w-5 h-5 text-[#1b7d3d]" />
                <span className="font-bold text-gray-800">{t.manyMore}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border-none bg-[#f8faf9] rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="w-14 h-14 bg-[#1b7d3d]/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#1b7d3d]" />
                </div>
                <h3 className="text-xl font-bold">{t.feat1}</h3>
                <p className="text-sm text-muted-foreground">{t.feat1Desc}</p>
              </CardContent>
            </Card>
            <Card className="p-8 border-none bg-[#f8faf9] rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="w-14 h-14 bg-[#1b7d3d]/10 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-8 h-8 text-[#1b7d3d]" />
                </div>
                <h3 className="text-xl font-bold">{t.feat2}</h3>
                <p className="text-sm text-muted-foreground">{t.feat2Desc}</p>
              </CardContent>
            </Card>
            <Card className="p-8 border-none bg-[#f8faf9] rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0 space-y-4">
                <div className="w-14 h-14 bg-[#1b7d3d]/10 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#1b7d3d]" />
                </div>
                <h3 className="text-xl font-bold">{t.feat3}</h3>
                <p className="text-sm text-muted-foreground">{t.feat3Desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#1b7d3d] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-16 opacity-80">{t.impact}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="text-6xl font-bold mb-2">{t.impact1}</p>
              <p className="text-lg opacity-80">{t.impact1Desc}</p>
            </div>
            <div>
              <p className="text-6xl font-bold mb-2">{t.impact2}</p>
              <p className="text-lg opacity-80">{t.impact2Desc}</p>
            </div>
            <div>
              <p className="text-6xl font-bold mb-2">{t.impact3}</p>
              <p className="text-lg opacity-80">{t.impact3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {language === 'en' ? 'Ready to Secure Your Harvest?' : 'আপনার ফসল সুরক্ষিত করতে প্রস্তুত?'}
          </h2>
          <p className="text-xl text-muted-foreground">
            {language === 'en' ? 'Join thousands of farmers using EasyDiseay to boost productivity.' : 'উৎপাদনশীলতা বাড়াতে ইজিডিজি ব্যবহারকারী হাজার হাজার কৃষকের সাথে যোগ দিন।'}
          </p>
          <div className="pt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/doctor">
              <Button className="h-16 px-12 text-xl font-bold bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 rounded-2xl shadow-xl transition-all hover:scale-105">
                {t.startDiagnosis}
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="h-16 px-12 text-xl font-bold border-[#1b7d3d] text-[#1b7d3d] hover:bg-[#1b7d3d]/5 rounded-2xl transition-all flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                {t.contactEd}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t bg-[#f8faf9]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#1b7d3d] p-1.5 rounded-xl flex items-center justify-center overflow-hidden w-10 h-10 shadow-md">
                {logoUrl ? (
                  <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" />
                ) : (
                  <ShieldPlus className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold text-gray-900 leading-none">{t.title}</h1>
                <p className="text-[10px] text-muted-foreground">{t.appDescription}</p>
              </div>
            </div>
            {showVisitorCount && (
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#e1e9e4] shadow-sm animate-in fade-in duration-500">
                <Eye className="w-3.5 h-3.5 text-[#1b7d3d]" />
                <span className="text-[10px] font-bold text-gray-600">
                  {t.visitorCount}: <span className="text-[#1b7d3d]">{visitorCount}</span>
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {t.title}. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-[#1b7d3d]">Home</Link>
            <Link href="/doctor" className="hover:text-[#1b7d3d]">Doctor</Link>
            <Link href="/nearby" className="hover:text-[#1b7d3d]">Nearby</Link>
            <Link href="/contact" className="hover:text-[#1b7d3d]">{t.contactEd}</Link>
            <Link href="/admin" className="hover:text-[#1b7d3d]">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
