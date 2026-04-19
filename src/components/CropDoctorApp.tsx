
'use client';

/**
 * TASK: Main Diagnosis Interface
 * Purpose: Provides the core "Doctor" UI where users upload photos, 
 * select crop types, and view the diagnostic/treatment reports.
 */

import React, {useState} from 'react';
import {useLanguage} from '@/components/LanguageProvider';
import {ImageUploader} from '@/components/ImageUploader';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableRow, TableHeader, TableHead} from '@/components/ui/table';
import {
  Stethoscope,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sprout,
  LayoutGrid,
  Columns
} from 'lucide-react';
import {cn} from '@/lib/utils';

// Type definitions for AI responses (moved from server-side flows for security)
interface IdentifyCropDiseaseOutput {
  isDiseased: boolean;
  diseaseName: string | null;
  symptoms: string | null;
  confidenceScore: number | null;
  diagnosticNotes?: string;
}

interface GenerateTreatmentAdviceOutput {
  diseaseName: string;
  severity: 'Low' | 'Medium' | 'High';
  howItHappens: string;
  whyItHappens: string;
  recoverySolution: string;
  medicines: string;
  summary: string;
}

export function CropDoctorApp() {
  const {t, language, setLanguage} = useLanguage();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cropType, setCropType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<IdentifyCropDiseaseOutput | null>(null);
  const [treatment, setTreatment] = useState<GenerateTreatmentAdviceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTransposed, setIsTransposed] = useState(true);

  const handleAnalyze = async () => {
    if (!photoUri) return;

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);
    setTreatment(null);

    const targetLang = language === 'bn' ? 'Bengali' : 'English';

    try {
      // Call the secure API route instead of direct AI function
      const response = await fetch('/api/analyze-disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoDataUri: photoUri,
          cropType: cropType || undefined,
          language: targetLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const diagResult = await response.json();
      setDiagnosis(diagResult);

      if (diagResult.isDiseased && diagResult.diseaseName) {
        // Call the secure treatment advice API route
        const treatResponse = await fetch('/api/treatment-advice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            diseaseName: diagResult.diseaseName,
            cropType: cropType || undefined,
            language: targetLang,
          }),
        });

        if (!treatResponse.ok) {
          const errorData = await treatResponse.json();
          throw new Error(errorData.error || 'Treatment advice failed');
        }

        const treatResult = await treatResponse.json();
        setTreatment(treatResult);
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      const errorText = t?.error || 'Something went wrong. Please try again.';
      setError(`${errorText} (${errorMessage})`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setPhotoUri(null);
    setDiagnosis(null);
    setTreatment(null);
    setCropType('');
    setError(null);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {!diagnosis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <ImageUploader
              onImageSelect={setPhotoUri}
              onClear={() => setPhotoUri(null)}
            />
          </div>

          <Card className="border border-[#e1e9e4] shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Globe className="w-4 h-4 text-[#1b7d3d]" />
                  {t.languageLabel}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "rounded-lg",
                      language === 'en' ? "bg-[#1b7d3d] hover:bg-[#1b7d3d]/90" : "border-[#e1e9e4]"
                    )}
                  >
                    GB English
                  </Button>
                  <Button
                    variant={language === 'bn' ? 'default' : 'outline'}
                    onClick={() => setLanguage('bn')}
                    className={cn(
                      "rounded-lg font-medium",
                      language === 'bn' ? "bg-[#1b7d3d] hover:bg-[#1b7d3d]/90" : "border-[#e1e9e4]"
                    )}
                  >
                    BD বাংলা
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Sprout className="w-4 h-4 text-[#1b7d3d]" />
                  {t.cropNameLabel} <span className="text-xs font-normal opacity-70">{t.optional}</span>
                </div>
                <Input
                  placeholder={t.cropTypePlaceholder}
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="bg-[#f8faf9] border-[#e1e9e4] focus:ring-[#1b7d3d] rounded-lg"
                />
                <p className="text-[10px] text-muted-foreground italic">{t.placeholderAccuracy}</p>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!photoUri || isLoading}
                  className={cn(
                    "w-full h-12 text-base font-bold text-white rounded-lg shadow-sm border-none transition-all active:scale-95",
                    photoUri 
                      ? "bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 shadow-md" 
                      : "bg-[#8abf98] hover:bg-[#7aad88]"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      {t.analyzing}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      {t.analyzeButton}
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {t.uploadStartHint}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xl font-bold text-[#1b7d3d]">
              <Stethoscope className="w-6 h-6" />
              {t.analysisReportHeader}
            </div>
            <Button variant="outline" onClick={resetApp} className="flex items-center gap-2 border-[#e1e9e4]">
              <RefreshCw className="w-4 h-4" />
              {t.reset}
            </Button>
          </div>

          <Card className="border border-[#1b7d3d]/20 bg-[#1b7d3d]/5 rounded-2xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Leaf className="w-6 h-6 text-[#1b7d3d]" />
                <span className="text-xl font-bold lowercase">{cropType || 'Crop'}</span>
                <Badge variant={diagnosis?.isDiseased ? "destructive" : "default"} className="flex gap-1.5 px-3 py-1 text-xs italic font-bold">
                  {diagnosis?.isDiseased ? (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      {t.diseased}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      {t.healthy}
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {treatment?.summary || diagnosis?.diagnosticNotes || diagnosis?.symptoms || t.noDiseaseFound}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-muted-foreground tracking-widest">{t.diseaseAnalysisHeader}</h3>
              <div className="flex bg-muted p-1 rounded-lg gap-1">
                <Button 
                  variant={!isTransposed ? "secondary" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "h-8 px-3 rounded-md",
                    !isTransposed ? "bg-[#1b7d3d] text-white hover:bg-[#1b7d3d]/90 shadow-sm" : "text-muted-foreground"
                  )}
                  onClick={() => setIsTransposed(false)}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  {t.table}
                </Button>
                <Button 
                  variant={isTransposed ? "secondary" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "h-8 px-3 rounded-md",
                    isTransposed ? "bg-[#1b7d3d] text-white hover:bg-[#1b7d3d]/90 shadow-sm" : "text-muted-foreground"
                  )}
                  onClick={() => setIsTransposed(true)}
                >
                  <Columns className="w-4 h-4 mr-2" />
                  {t.transpose}
                </Button>
              </div>
            </div>

            <Card className="border border-[#e1e9e4] rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
              {isTransposed ? (
                <Table>
                  <TableHeader className="bg-[#1b7d3d] hover:bg-[#1b7d3d]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-white font-bold h-12 w-1/3">{t.field}</TableHead>
                      <TableHead className="text-white font-bold h-12">{t.value}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-b border-[#e1e9e4] hover:bg-transparent">
                      <TableCell className="bg-[#1b7d3d]/5 font-semibold text-[#1b7d3d]">{t.diseaseName}</TableCell>
                      <TableCell className="font-medium">{treatment?.diseaseName || diagnosis?.diseaseName || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-[#e1e9e4] hover:bg-transparent">
                      <TableCell className="bg-[#1b7d3d]/5 font-semibold text-[#1b7d3d]">{t.severity}</TableCell>
                      <TableCell>
                        {treatment ? (
                          <Badge variant="outline" className={cn(
                            "bg-orange-100 text-orange-700 border-orange-200 font-medium px-2 py-0.5",
                            treatment.severity === 'High' && "bg-red-100 text-red-700 border-red-200",
                            treatment.severity === 'Low' && "bg-green-100 text-green-700 border-green-200",
                          )}>
                            {treatment.severity}
                          </Badge>
                        ) : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-b border-[#e1e9e4] hover:bg-transparent">
                      <TableCell className="bg-[#1b7d3d]/5 font-semibold text-[#1b7d3d]">{t.howItHappens}</TableCell>
                      <TableCell className="text-muted-foreground">{treatment?.howItHappens || t.analysisPending}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-[#e1e9e4] hover:bg-transparent">
                      <TableCell className="bg-[#1b7d3d]/5 font-semibold text-[#1b7d3d]">{t.whyItHappens}</TableCell>
                      <TableCell className="text-muted-foreground">{treatment?.whyItHappens || t.analysisPending}</TableCell>
                    </TableRow>
                    <TableRow className="border-b border-[#e1e9e4] hover:bg-transparent">
                      <TableCell className="bg-[#1b7d3d]/5 font-semibold text-[#1b7d3d]">{t.recoverySolution}</TableCell>
                      <TableCell className="text-[#1b7d3d] font-medium">{treatment?.recoverySolution || t.analysisPending}</TableCell>
                    </TableRow>
                    <TableRow className="border-none hover:bg-transparent">
                      <TableCell className="bg-[#1b7d3d]/5 font-semibold text-[#1b7d3d]">{t.medicines}</TableCell>
                      <TableCell className="text-muted-foreground">{treatment?.medicines || t.analysisPending}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader className="bg-[#1b7d3d] hover:bg-[#1b7d3d]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-white font-bold h-12">{t.diseaseName}</TableHead>
                      <TableHead className="text-white font-bold h-12">{t.severity}</TableHead>
                      <TableHead className="text-white font-bold h-12">{t.howItHappens}</TableHead>
                      <TableHead className="text-white font-bold h-12">{t.whyItHappens}</TableHead>
                      <TableHead className="text-white font-bold h-12">{t.recoverySolution}</TableHead>
                      <TableHead className="text-white font-bold h-12">{t.medicines}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-medium">{treatment?.diseaseName || diagnosis?.diseaseName || 'N/A'}</TableCell>
                      <TableCell>
                        {treatment ? (
                          <Badge variant="outline" className={cn(
                            "bg-orange-100 text-orange-700 border-orange-200 font-medium px-2 py-0.5 whitespace-nowrap",
                            treatment.severity === 'High' && "bg-red-100 text-red-700 border-red-200",
                            treatment.severity === 'Low' && "bg-green-100 text-green-700 border-green-200",
                          )}>
                            {treatment.severity}
                          </Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground min-w-[200px]">{treatment?.howItHappens || t.analysisPending}</TableCell>
                      <TableCell className="text-muted-foreground min-w-[200px]">{treatment?.whyItHappens || t.analysisPending}</TableCell>
                      <TableCell className="text-[#1b7d3d] font-medium min-w-[200px]">{treatment?.recoverySolution || t.analysisPending}</TableCell>
                      <TableCell className="text-muted-foreground min-w-[200px]">{treatment?.medicines || t.analysisPending}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center">
          {error}
        </div>
      )}
    </div>
  );
}
