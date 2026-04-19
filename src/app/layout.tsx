
import type {Metadata} from 'next';
import './globals.css';
import {LanguageProvider} from '@/components/LanguageProvider';
import {AppLogoProvider} from '@/components/AppLogoProvider';
import {FirebaseClientProvider} from '@/firebase';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'EasyDiseay',
  description: 'Digital-powered crop disease identification and treatment advice',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <LanguageProvider>
            <AppLogoProvider>
              {children}
              <Toaster />
            </AppLogoProvider>
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
