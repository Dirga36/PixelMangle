/**
 * Header navbar adhering to the 2-zone contract.
 */


export function Navbar() {
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
      </div>

      {/* Zone 2: GitBub */}
      <div className="flex items-center gap-2">
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
