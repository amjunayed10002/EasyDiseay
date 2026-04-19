
'use client';

import {Button} from '@/components/ui/button';
import {useLanguage} from '@/components/LanguageProvider';
import {Languages} from 'lucide-react';

export function LanguageToggle() {
  const {language, setLanguage} = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      className="flex items-center gap-2 border-primary/20 hover:bg-primary/10 transition-colors"
    >
      <Languages className="w-4 h-4 text-primary" />
      <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
    </Button>
  );
}
