import { useState } from 'react';

export type ExportFormat = 'image/jpeg' | 'image/png' | 'image/webp';

interface BottomBarProps {
  onDownload: (format: ExportFormat, filename: string) => void;
  onReset: () => void;
  onCopyToClipboard: () => Promise<boolean>;
  activePresetId: string | null;
  activeImageName: string;
  originalSizeBytes: number | null;
  estimatedSizeKb: number | null;
  isProcessing: boolean;
}

export function BottomBar({
  onDownload,
  onReset,
  onCopyToClipboard,
  activePresetId,
  activeImageName,
  originalSizeBytes,
  estimatedSizeKb,
  isProcessing,
}: BottomBarProps) {
  const [format, setFormat] = useState<ExportFormat>('image/jpeg');
  const [copied, setCopied] = useState(false);

  const getExtension = (f: ExportFormat) => {
    if (f === 'image/png') return 'png';
    if (f === 'image/webp') return 'webp';
    return 'jpg';
  };

  const baseName = activeImageName
    ? activeImageName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
    : 'image';
  const presetSuffix = activePresetId ? `_${activePresetId}` : '_mangled';
  const fullFilename = `pixelmangle_${baseName}${presetSuffix}.${getExtension(format)}`;

  const handleCopy = async () => {
    const success = await onCopyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  let savingsText: string | null = null;
  if (originalSizeBytes && estimatedSizeKb && estimatedSizeKb > 0) {
    const origKb = originalSizeBytes / 1024;
    const diff = ((estimatedSizeKb - origKb) / origKb) * 100;
    if (diff < -5) {
      savingsText = `${Math.abs(Math.round(diff))}% smaller`;
    } else if (diff > 5) {
      savingsText = `+${Math.round(diff)}% size`;
    }
  }

  return (
    <aside aria-label="Export Actions" className="sticky bottom-0 z-40 w-full bg-neutral-900 border-t border-neutral-800 shadow-2xl px-3 py-2.5 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5 text-[11px] font-mono sm:flex-row sm:items-center sm:gap-3 sm:text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-neutral-400">Est. Size:</span>
            <span className="text-amber-300 font-semibold tabular-nums">
              {estimatedSizeKb ? `~${estimatedSizeKb} KB` : '-- KB'}
            </span>
          </div>

          {savingsText && (
            <span className="inline-flex w-fit items-center rounded border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-[10px] font-sans font-medium text-emerald-300 sm:text-[11px]">
              📉 {savingsText}
            </span>
          )}

          <span className="hidden max-w-[200px] truncate text-neutral-400 md:inline">
            📄 {fullFilename}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center justify-center bg-neutral-950 rounded border border-neutral-800 p-0.5 text-[11px] font-mono sm:text-xs">
            {[
              { label: 'JPG', value: 'image/jpeg' as ExportFormat },
              { label: 'PNG', value: 'image/png' as ExportFormat },
              { label: 'WEBP', value: 'image/webp' as ExportFormat },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFormat(f.value)}
                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                  format === f.value
                    ? 'bg-neutral-800 text-amber-300 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isProcessing}
              className="flex-1 px-3 py-2 text-[11px] font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 sm:flex-none sm:text-xs"
              title="Copy mangled image to system clipboard"
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={isProcessing}
              className="flex-1 px-3 py-2 text-[11px] font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 sm:flex-none sm:text-xs"
            >
              🔄 Reset
            </button>

            <button
              type="button"
              onClick={() => onDownload(format, fullFilename)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-[11px] font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded border border-amber-300 shadow transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 sm:flex-none sm:text-xs"
            >
              <span>⬇️</span>
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
