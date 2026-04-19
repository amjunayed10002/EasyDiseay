
'use client';

import React, {useState, useRef} from 'react';
import {Upload, Image as ImageIcon, X} from 'lucide-react';
import {useLanguage} from '@/components/LanguageProvider';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';

interface ImageUploaderProps {
  onImageSelect: (dataUri: string) => void;
  onClear: () => void;
}

export function ImageUploader({onImageSelect, onClear}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {t} = useLanguage();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-full min-h-[400px]">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative group flex flex-col items-center justify-center w-full h-full min-h-[400px] border-2 border-dashed rounded-[2rem] transition-all cursor-default bg-white",
            isDragging ? "border-[#1b7d3d] bg-[#1b7d3d]/5" : "border-[#8abf98]/40 hover:border-[#1b7d3d]/60"
          )}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="p-6 rounded-3xl bg-[#f8faf9] mb-2 shadow-sm border border-[#e1e9e4]">
              <ImageIcon className="w-12 h-12 text-[#8abf98]" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-800">{t.dropImage}</h3>
              <p className="text-sm text-muted-foreground">{t.clickBrowse}</p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mt-4 border-[#8abf98] text-[#1b7d3d] hover:bg-[#8abf98]/10 px-8 py-6 rounded-xl flex items-center gap-2 font-semibold"
            >
              <Upload className="w-4 h-4" />
              {t.chooseImage}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>
      ) : (
        <div className="relative group rounded-[2rem] overflow-hidden border border-[#e1e9e4] shadow-md bg-white h-full min-h-[400px] flex items-center justify-center">
          <img
            src={preview}
            alt="Crop preview"
            className="max-w-full max-h-[500px] object-contain p-4"
          />
          <button
            onClick={clearImage}
            className="absolute top-6 right-6 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
