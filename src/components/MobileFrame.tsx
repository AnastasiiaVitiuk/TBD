import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isFramed, setIsFramed] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 transition-colors">
      {/* Frame Mode Switcher for Desktop */}
      <div className="hidden md:flex items-center gap-2 mb-3 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1.5 shadow-lg backdrop-blur">
        <span className="text-xs font-semibold text-slate-400">Preview Mode:</span>
        <button
          onClick={() => setIsFramed(true)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
            isFramed
              ? 'bg-nhs-blue text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile Phone
        </button>
        <button
          onClick={() => setIsFramed(false)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
            !isFramed
              ? 'bg-nhs-blue text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Full Responsive
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full bg-slate-900 overflow-hidden flex flex-col transition-all duration-300 ${
          isFramed
            ? 'md:max-w-[420px] md:h-[890px] md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative'
            : 'max-w-4xl min-h-screen md:min-h-[850px] md:rounded-3xl border-slate-800 md:border shadow-2xl'
        }`}
      >
        {/* Mock Dynamic Island / Speaker notch for framed mode */}
        {isFramed && (
          <div className="hidden md:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 items-center justify-between px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 border border-slate-700/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950/60 border border-blue-500/30" />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Mock Home Indicator bar for framed mode */}
        {isFramed && (
          <div className="hidden md:flex justify-center pb-2 pt-1 bg-slate-900">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
