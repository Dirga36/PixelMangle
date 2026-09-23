import { MangleSettings, PRESETS } from '../utils/imageMangler';

interface ControlPanelProps {
  settings: MangleSettings;
  onChange: (newSettings: MangleSettings) => void;
  onApplyPreset: (presetId: string) => void;
  activePresetId: string | null;
}

export function ControlPanel({
  settings,
  onChange,
  onApplyPreset,
  activePresetId,
}: ControlPanelProps) {
  const updateSetting = <K extends keyof MangleSettings>(key: K, value: MangleSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div id="controls" className="space-y-4">
      {/* 1. Quick Presets Bar */}
      <div id="presets">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Degrade Presets
          </label>
          <span className="text-[11px] text-neutral-400 font-mono">1-click styles</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset.id)}
                className={`flex items-center gap-2 p-2 rounded text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-400 bg-neutral-800 ring-1 ring-amber-400 text-amber-200'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <span className="text-base select-none" aria-hidden="true">
                  {preset.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate leading-tight">
                    {preset.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Sections */}
      <div className="space-y-3 bg-neutral-900 p-3.5 rounded border border-neutral-800">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <span>🎛️</span> Effect Sliders & Tuning
          </span>
          <span className="text-[11px] text-amber-400 font-mono">Real-time Canvas</span>
        </div>

        {/* 1. Pixel Density / Pixelation Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>🧱</span> Pixel Density / Resolution
            </span>
            <span className="font-mono text-neutral-300 tabular-nums">
              {settings.pixelDensity}%
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={settings.pixelDensity}
            onChange={(e) => updateSetting('pixelDensity', Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>1% (Ultra Chunky)</span>
            <span>50%</span>
            <span>100% (Native)</span>
          </div>
        </div>

        {/* 2. JPEG Compression Quality Slider */}
        <div className="space-y-1 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>💾</span> JPEG Compression Quality
            </span>
            <span className="font-mono text-neutral-300 tabular-nums">
              {settings.jpegQuality}%
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={settings.jpegQuality}
            onChange={(e) => updateSetting('jpegQuality', Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>1% (Dial-up Crunch)</span>
            <span>50%</span>
            <span>100% (Lossless)</span>
          </div>

          {/* JPEG Re-compression passes */}
          {settings.jpegQuality < 95 && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-neutral-400">Re-compression Passes:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((pass) => (
                  <button
                    key={pass}
                    type="button"
                    onClick={() => updateSetting('jpegPasses', pass)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded border cursor-pointer ${
                      settings.jpegPasses === pass
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                        : 'border-neutral-800 bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {pass}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Color Bit-Depth (Posterization) */}
        <div className="space-y-1.5 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>🎨</span> Color Bit-Depth
            </span>
            <span className="font-mono text-neutral-300 text-[11px]">
              {settings.bitDepth === 'gameboy'
                ? 'Game Boy 4-Green'
                : settings.bitDepth === '2bit'
                ? '2-Bit (4 Levels)'
                : settings.bitDepth === '4bit'
                ? '4-Bit (16 Levels)'
                : settings.bitDepth === '8bit'
                ? '8-Bit (256 Levels)'
                : 'Full 24-Bit'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 text-[11px]">
            {[
              { id: 'full', label: 'Full', emoji: '🌈' },
              { id: '8bit', label: '8-Bit', emoji: '🕹️' },
              { id: '4bit', label: '4-Bit', emoji: '📺' },
              { id: '2bit', label: '2-Bit', emoji: '⬛' },
              { id: 'gameboy', label: 'GBoy', emoji: '🟩' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateSetting(
                    'bitDepth',
                    option.id as MangleSettings['bitDepth']
                  )
                }
                className={`py-1 px-1 rounded border text-center font-medium cursor-pointer transition-colors ${
                  settings.bitDepth === option.id
                    ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                    : 'border-neutral-800 bg-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span className="block text-xs mb-0.5">{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          {/* Dithering toggle for low bit-depth */}
          {settings.bitDepth !== 'full' && (
            <label className="flex items-center gap-2 pt-1 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.dither}
                onChange={(e) => updateSetting('dither', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Ordered Bayer Dithering (Retro dot texture)</span>
            </label>
          )}
        </div>

        {/* 4. Noise & Grain Slider */}
        <div className="space-y-1 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>✨</span> Noise & Grain Overlay
            </span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => updateSetting('noiseType', 'mono')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    settings.noiseType === 'mono'
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Mono
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('noiseType', 'color')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    settings.noiseType === 'color'
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  RGB
                </button>
              </div>
              <span className="font-mono text-neutral-300 tabular-nums">
                {settings.noise}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.noise}
            onChange={(e) => updateSetting('noise', Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
          />
        </div>

        {/* 5. Color Bleed & CRT Scanlines */}
        <div className="space-y-2 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>🌈</span> Color Bleed (Chromatic Aberration)
            </span>
            <span className="font-mono text-neutral-300 tabular-nums">
              {settings.colorBleed}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.colorBleed}
            onChange={(e) => updateSetting('colorBleed', Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
          />

          {/* CRT Scanline Toggle */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300">
                <input
                  type="checkbox"
                  checked={settings.crtEffect}
                  onChange={(e) => updateSetting('crtEffect', e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>CRT Scanlines Filter</span>
              </label>
              {settings.crtEffect && (
                <span className="font-mono text-neutral-400 text-[11px] tabular-nums">
                  {settings.crtIntensity}%
                </span>
              )}
            </div>

            {settings.crtEffect && (
              <div className="mt-1.5 pl-5">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={settings.crtIntensity}
                  onChange={(e) => updateSetting('crtIntensity', Number(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* 6. Contrast, Saturation & Deep Fried Boosters */}
        <div className="space-y-2 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>⚡</span> Contrast Boost
            </span>
            <span className="font-mono text-neutral-300 tabular-nums">
              {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={100}
            step={1}
            value={settings.contrast}
            onChange={(e) => updateSetting('contrast', Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1">
              <span>🧪</span> Saturation (Deep Fry)
            </span>
            <span className="font-mono text-neutral-300 tabular-nums">
              {settings.saturation > 0 ? `+${settings.saturation}%` : `${settings.saturation}%`}
            </span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            disabled={settings.monochrome}
            value={settings.saturation}
            onChange={(e) => updateSetting('saturation', Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer disabled:opacity-40"
          />

          {/* Monochrome & Export scale toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-neutral-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.monochrome}
                onChange={(e) => updateSetting('monochrome', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Monochrome B&W</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none" title="Upscale back to original pixel dimensions with sharp nearest-neighbor interpolation">
              <input
                type="checkbox"
                checked={settings.exportUpscaled}
                onChange={(e) => updateSetting('exportUpscaled', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>Crisp Scaled Pixels</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
