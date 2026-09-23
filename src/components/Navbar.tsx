/**
 * Header navbar adhering to the 3-zone contract.
 * Uses emojis instead of SVG icons and avoids gradients.
 */

interface NavbarProps {
  onReset: () => void;
  isProcessing: boolean;
}

export function Navbar({ onReset, isProcessing }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-900 border-b border-neutral-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-xl select-none" aria-hidden="true">👾</span>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            PixelMangle
          </span>
          <span className="hidden sm:inline text-xs text-neutral-400 font-mono">
            Client-Side Downgrade Lab
          </span>
        </div>
        {isProcessing && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] animate-pulse">
            ⏳ Processing...
          </span>
        )}
      </div>

      {/* Zone 2: Navigation / Info Anchors */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
        <a href="#presets" className="hover:text-amber-400 transition-colors">
          Presets
        </a>
        <a href="#controls" className="hover:text-amber-400 transition-colors">
          Degrade Controls
        </a>
        <a href="#viewport" className="hover:text-amber-400 transition-colors">
          Comparison View
        </a>
        <a href="#about" className="hover:text-amber-400 transition-colors">
          How It Works
        </a>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded border border-neutral-700 transition-colors whitespace-nowrap cursor-pointer"
          title="Reset all settings to default"
        >
          🔄 Reset
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-200 hover:bg-white rounded transition-colors whitespace-nowrap"
        >
          🌐 GitHub
        </a>
      </div>
    </header>
  );
}
