import React, { useRef, useState } from 'react';
import samplePet from '../assets/images/sample_pet_photo_1790150612374.jpg';
import sampleSynthwave from '../assets/images/sample_neon_synthwave_1790150627438.jpg';
import sampleAvatar from '../assets/images/sample_avatar_pop_1790150644531.jpg';

export interface SampleImage {
  id: string;
  name: string;
  emoji: string;
  src: string;
  desc: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'pet-photo',
    name: 'Pet Photo',
    emoji: '🐶',
    src: samplePet,
    desc: 'Golden Retriever high-res daylight fur photo',
  },
  {
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    emoji: '🌴',
    src: sampleSynthwave,
    desc: '80s wireframe grid with neon skyline & sunset',
  },
  {
    id: 'avatar-pop',
    name: 'Avatar Pop',
    emoji: '🕶️',
    src: sampleAvatar,
    desc: 'Vibrant pop-art character portrait with sunglasses',
  },
];

interface UploadZoneProps {
  onImageSelected: (img: HTMLImageElement, name: string, originalBytes?: number) => void;
  activeImageName: string;
  imageDimensions: { width: number; height: number } | null;
  originalSizeBytes: number | null;
}

export function UploadZone({
  onImageSelected,
  activeImageName,
  imageDimensions,
  originalSizeBytes,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageSelected(img, file.name, file.size);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const approxBytes = img.naturalWidth * img.naturalHeight * 0.4;
      onImageSelected(img, `${sample.name.toLowerCase().replace(/\s+/g, '_')}.jpg`, approxBytes);
    };
    img.src = sample.src;
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-4 rounded border-2 border-dashed transition-all cursor-pointer select-none text-center ${
          isDragging
            ? 'border-amber-400 bg-neutral-800'
            : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <span className="text-2xl" aria-hidden="true">📤</span>
          <p className="text-sm font-semibold text-neutral-200">
            Drop your image here, or <span className="text-amber-400 underline">browse</span>
          </p>
          <p className="text-xs text-neutral-400">
            PNG, JPG, WEBP up to 25MB · Processed 100% locally
          </p>
        </div>

        {activeImageName && (
          <div className="mt-3 pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-neutral-300">
            <span className="truncate max-w-[180px] text-amber-300">
              🖼️ {activeImageName}
            </span>
            {imageDimensions && (
              <>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-400">
                  {imageDimensions.width}×{imageDimensions.height} px
                </span>
              </>
            )}
            {originalSizeBytes && (
              <>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-400">
                  {formatBytes(originalSizeBytes)}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Sample Presets (Instant Test)
          </span>
          <span className="text-[11px] text-neutral-400">Click to load</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = activeImageName.toLowerCase().includes(sample.name.toLowerCase().replace(/\s+/g, '_'));
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`relative flex flex-col items-center p-2 rounded text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-neutral-800 ring-1 ring-amber-400'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="w-full h-12 rounded overflow-hidden bg-neutral-950 mb-1.5 relative border border-neutral-800 sm:h-14">
                  <img
                    src={sample.src}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-1 text-[10px] drop-shadow sm:text-xs">
                    {sample.emoji}
                  </span>
                </div>
                <div className="w-full min-w-0">
                  <p className="text-[11px] font-medium text-neutral-200 truncate sm:text-xs">
                    {sample.name}
                  </p>
                  <p className="text-[9px] text-neutral-400 truncate sm:text-[10px]">
                    {sample.id === 'pet-photo' ? 'Detailed fur' : sample.id === 'neon-synthwave' ? 'Vibrant lines' : 'Bold portrait'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
