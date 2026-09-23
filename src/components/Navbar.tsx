/**
 * Header navbar adhering to the 2-zone contract.
 */

interface NavbarProps {
  onReset: () => void;
  isProcessing: boolean;
}

export function Navbar({ onReset, isProcessing }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-900 border-b border-neutral-800">
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
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          hidden
          onClick={onReset}
          disabled={isProcessing}
          className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-200 hover:bg-white rounded transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <a
          href="https://github.com/Dirga36/PixelMangle"
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
