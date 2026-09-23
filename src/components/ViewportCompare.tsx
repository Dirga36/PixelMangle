import React, { useRef, useState, useEffect, useCallback } from 'react';

export type ViewMode = 'split' | 'side-by-side' | 'mangled-only' | 'original-only';

interface ViewportCompareProps {
  originalImage: HTMLImageElement | null;
  mangledCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isProcessing: boolean;
  outputStats: {
    width: number;
    height: number;
    estimatedSizeKb: number;
    processingTimeMs: number;
  } | null;
}

export function ViewportCompare({
  originalImage,
  mangledCanvasRef,
  isProcessing,
  outputStats,
}: ViewportCompareProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!originalImage || !originalCanvasRef.current) return;
    const canvas = originalCanvasRef.current;
    canvas.width = originalImage.naturalWidth || originalImage.width;
    canvas.height = originalImage.naturalHeight || originalImage.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(originalImage, 0, 0);
    }
  }, [originalImage]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      setSliderPos(pos);
    },
    [isDragging]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // noop
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3" id="viewport">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded">
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors whitespace-nowrap ${
              viewMode === 'split'
                ? 'bg-neutral-800 text-amber-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ↔️ Split Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors whitespace-nowrap ${
              viewMode === 'side-by-side'
                ? 'bg-neutral-800 text-amber-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            🪟 Side-by-Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mangled-only')}
            className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors whitespace-nowrap ${
              viewMode === 'mangled-only'
                ? 'bg-neutral-800 text-amber-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            👾 Mangled Only
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800">
            {[
              { label: 'Fit', val: 1 },
              { label: '200%', val: 2 },
              { label: '400%', val: 4 },
            ].map((z) => (
              <button
                key={z.label}
                type="button"
                onClick={() => setZoomLevel(z.val)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer ${
                  zoomLevel === z.val
                    ? 'bg-neutral-800 text-amber-300'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {outputStats && (
            <span className="hidden sm:inline text-neutral-400 font-mono text-[11px]">
              {outputStats.width}×{outputStats.height}
            </span>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 min-h-[380px] sm:min-h-[500px] bg-neutral-950 border border-neutral-800 rounded overflow-hidden flex items-center justify-center select-none"
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #444 25%, transparent 25%),
              linear-gradient(-45deg, #444 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #444 75%),
              linear-gradient(-45deg, transparent 75%, #444 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        />

        {viewMode === 'split' && (
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
            <div
              className="relative max-w-full max-h-full transition-transform duration-75"
              style={{
                transform: zoomLevel > 1 ? `scale(${zoomLevel})` : undefined,
                transformOrigin: 'center center',
              }}
            >
              <canvas
                ref={originalCanvasRef}
                className="max-w-full max-h-[70vh] object-contain block shadow-lg"
              />

              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
                }}
              >
                <canvas
                  ref={mangledCanvasRef}
                  className="w-full h-full object-contain block pixelated"
                />
              </div>

              <div
                onPointerDown={handlePointerDown}
                className="absolute top-0 bottom-0 w-1 bg-amber-400 cursor-ew-resize z-20 shadow-md group"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-900 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-xs shadow-lg cursor-grab active:cursor-grabbing">
                  ↔️
                </div>
              </div>

              <div className="absolute top-3 left-3 px-2 py-1 bg-neutral-900/90 text-neutral-300 text-[11px] font-mono rounded border border-neutral-700 pointer-events-none z-10">
                Original (Left)
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-neutral-900/90 text-amber-300 text-[11px] font-mono rounded border border-amber-500/50 pointer-events-none z-10">
                Mangled (Right)
              </div>
            </div>
          </div>
        )}

        {viewMode === 'side-by-side' && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-auto">
            <div className="relative flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded p-2 overflow-hidden">
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900 text-neutral-300 text-[11px] font-mono rounded border border-neutral-700 z-10">
                Original Image
              </div>
              <canvas
                ref={originalCanvasRef}
                className="max-w-full max-h-[60vh] object-contain block"
              />
            </div>

            <div className="relative flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded p-2 overflow-hidden">
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900 text-amber-300 text-[11px] font-mono rounded border border-amber-500/50 z-10">
                Mangled Output
              </div>
              <canvas
                ref={mangledCanvasRef}
                className="max-w-full max-h-[60vh] object-contain block pixelated"
              />
            </div>
          </div>
        )}

        {viewMode === 'mangled-only' && (
          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-auto">
            <div
              className="relative max-w-full max-h-full transition-transform"
              style={{
                transform: zoomLevel > 1 ? `scale(${zoomLevel})` : undefined,
                transformOrigin: 'center center',
              }}
            >
              <canvas
                ref={mangledCanvasRef}
                className="max-w-full max-h-[70vh] object-contain block pixelated shadow-lg"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-neutral-900/90 text-amber-300 text-[11px] font-mono rounded border border-amber-500/50 pointer-events-none">
                Mangled View
              </div>
            </div>
          </div>
        )}

        {viewMode === 'original-only' && (
          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-auto">
            <div
              className="relative max-w-full max-h-full transition-transform"
              style={{
                transform: zoomLevel > 1 ? `scale(${zoomLevel})` : undefined,
                transformOrigin: 'center center',
              }}
            >
              <canvas
                ref={originalCanvasRef}
                className="max-w-full max-h-[70vh] object-contain block shadow-lg"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-neutral-900/90 text-neutral-300 text-[11px] font-mono rounded border border-neutral-700 pointer-events-none">
                Original Pristine View
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[1px] flex items-center justify-center z-30">
            <div className="px-4 py-2 bg-neutral-900 border border-amber-500/40 rounded shadow-xl flex items-center gap-2 text-xs font-mono text-amber-300">
              <span className="text-base animate-spin select-none" aria-hidden="true">⚙️</span>
              <span>Crunching Pixels...</span>
            </div>
          </div>
        )}
      </div>

      <div id="about" className="p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-400 space-y-1">
        <div className="flex items-center justify-between text-neutral-300 font-medium">
          <span className="flex items-center gap-1.5">
            <span>💡</span> Canvas 2D Pipeline Tips
          </span>
          <span className="text-[11px] font-mono text-neutral-400">
            Zero Server Uploads
          </span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Degradation happens right in your GPU and browser memory. Resolution scaling draws to an offscreen buffer with <code className="text-amber-300 bg-neutral-950 px-1 py-0.5 rounded">imageSmoothingEnabled = false</code>. JPEG crunching loops lossy compression headers to introduce authentic discrete cosine transform (DCT) block ringing.
        </p>
      </div>
    </div>
  );
}
