/**
 * Header navbar adhering to the 2-zone contract.
 */

interface NavbarProps {
  onReset: () => void;
  isProcessing: boolean;
}

export function Navbar({ onReset, isProcessing }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-3 py-3 sm:px-6 bg-neutral-900 border-b border-neutral-800">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="text-lg select-none sm:text-xl" aria-hidden="true">👾</span>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-base font-bold tracking-tight text-white font-sans sm:text-lg">
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
