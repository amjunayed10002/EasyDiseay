
'use client';

import React, {useState, useEffect} from 'react';
import {useLanguage} from '@/components/LanguageProvider';
import {useAppLogo} from '@/components/AppLogoProvider';
import {ShieldPlus, MapPin, UserCircle, Navigation, Search, ArrowLeft, ExternalLink, Stethoscope, Store, Settings} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Separator} from '@/components/ui/separator';
import {Card, CardContent} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';

export default function NearbyPage() {
  const {t, language} = useLanguage();
  const {logoUrl} = useAppLogo();
  const {toast} = useToast();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationSet, setIsLocationSet] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  if (!mounted) return null;

  const handleUseGps = () => {
    setIsLoadingLocation(true);
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: language === 'bn' ? 'জিওলোকেশন সমর্থিত নয়' : 'Geolocation not supported',
        description: language === 'bn' ? 'আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না।' : 'Your browser does not support geolocation.',
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        setResolvedLocation(`${latitude}, ${longitude}`);
        setIsLocationSet(true);
        setIsLoadingLocation(false);
        toast({
          title: t.locationSet,
          description: `${latitude}, ${longitude}`,
        });
      },
      (error) => {
        toast({
          variant: 'destructive',
          title: 'Location Error',
          description: error.message,
        });
        setIsLoadingLocation(false);
      }
    );
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: language === 'bn' ? 'অবস্থান লিখুন' : 'Enter Location',
        description: language === 'bn' ? 'অনুগ্রহ করে একটি শহরের নাম বা অঞ্চল লিখুন।' : 'Please enter a city or region.',
      });
      return;
    }
    setResolvedLocation(searchQuery);
    setIsLocationSet(true);
  };

  const handleSearchItem = (item: string) => {
    const effectiveLocation = resolvedLocation || searchQuery.trim();

    if (!effectiveLocation) {
      toast({
        title: language === 'bn' ? 'অবস্থান প্রয়োজন' : 'Location required',
        description: language === 'bn' ? 'অনুগ্রহ করে প্রথমে আপনার অবস্থান সেট করুন।' : 'Please set your location first.',
      });
      return;
    }

    const query = `${item} near ${effectiveLocation} 8km`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] flex flex-col">
      {/* Top Header Bar */}
      <header className="w-full bg-[#1b7d3d] text-white py-3 px-6 shadow-sm z-20">
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
            <Link href="/nearby" className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full hover:bg-white/30 transition-colors">
              <MapPin className="w-4 h-4" />
              {t.findNearby}
            </Link>
            <Link href="/admin" className="hover:opacity-80" aria-label="Admin">
              <UserCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col items-center text-center space-y-8">
        <div className="p-5 rounded-full bg-[#1b7d3d]/5 border border-[#1b7d3d]/10">
          <MapPin className="w-10 h-10 text-[#1b7d3d]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#1b7d3d]">
            {t.findNearbyTitle}
          </h2>
          <p className="text-muted-foreground">
            {t.findNearbySubtitle}
          </p>
        </div>

        {!isLocationSet ? (
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <Button 
              className="w-full h-14 text-lg font-bold bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white rounded-xl flex items-center justify-center gap-3 shadow-md"
              onClick={handleUseGps}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <span className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 animate-spin" />
                  {t.gettingLocation}
                </span>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  {t.useGpsButton}
                </>
              )}
            </Button>

            <div className="relative flex items-center justify-center">
              <Separator className="bg-[#e1e9e4]" />
              <span className="absolute bg-[#f8faf9] px-4 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                {t.orEnterManually}
              </span>
            </div>

            <div className="flex gap-2 p-1 bg-white border border-[#e1e9e4] rounded-xl shadow-sm">
              <Input 
                placeholder={t.locationPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                className="flex-1 h-12 border-none bg-transparent focus-visible:ring-0 text-lg px-4"
              />
              <Button 
                onClick={handleManualSearch}
                className="h-12 px-6 bg-[#8abf98] hover:bg-[#7aad88] text-white font-bold rounded-lg flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {t.searchButtonLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Location Status Card */}
            <Card className="border border-[#1b7d3d]/20 bg-[#1b7d3d]/5 rounded-2xl overflow-hidden text-left shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1b7d3d] p-3 rounded-full">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1b7d3d]">{t.locationSet}</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-xs md:max-w-md">
                      {resolvedLocation.includes(',') ? `${t.useGpsButton}: ${resolvedLocation}` : resolvedLocation}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-[#1b7d3d] font-bold"
                  onClick={() => {
                    setIsLocationSet(false);
                    setResolvedLocation('');
                  }}
                >
                  {t.change}
                </Button>
              </CardContent>
            </Card>

            {/* Grid for Shop and Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agro Shop Section */}
              <Card className="border border-[#e1e9e4] rounded-[2rem] bg-white overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-[#f0f9f1] rounded-2xl">
                      <Store className="w-8 h-8 text-[#1b7d3d]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        🏪 {t.agroShop}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t.agroShopDesc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[t.agroShop, t.agriStore, t.seedStore, t.fertilizerShop].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSearchItem(item)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-[#1b7d3d]/20 hover:bg-[#f8faf9] transition-all group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#1b7d3d]">{item}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-[#1b7d3d] font-bold">8km</span>
                          <ExternalLink className="w-4 h-4 text-[#1b7d3d]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Agro Doctor Section */}
              <Card className="border border-[#e1e9e4] rounded-[2rem] bg-white overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-[#f0f9f1] rounded-2xl">
                      <Stethoscope className="w-8 h-8 text-[#1b7d3d]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        🩺 {t.agroDoctor}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t.agroDoctorDesc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[t.agriConsultant, t.cropDoctor, t.agriExtension, t.plantPathologist].map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSearchItem(item)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-[#1b7d3d]/20 hover:bg-[#f8faf9] transition-all group"
                      >
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#1b7d3d]">{item}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-[#1b7d3d] font-bold">8km</span>
                          <ExternalLink className="w-4 h-4 text-[#1b7d3d]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Link href="/" className="flex items-center gap-2 text-[#1b7d3d] font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          {t.privacyNote}
        </p>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground text-xs border-t bg-white">
        <p>© {new Date().getFullYear()} {t.title}. All rights reserved.</p>
      </footer>
    </main>
  );
}
