import React from 'react';
import { Stethoscope, User, Sparkles, Database } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isDoctorMode: boolean;
  onToggleDoctorMode: () => void;
  geminiConnected?: boolean;
  atlasConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onSelectLanguage,
  isDoctorMode,
  onToggleDoctorMode,
  geminiConnected = true,
  atlasConnected = true,
}) => {
  return (
    <header className="bg-nhs-blue text-white px-4 pt-3 pb-3 border-b border-nhs-darkblue/50 shadow-md">
      <div className="flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-inner">
            <span className="font-black text-nhs-blue text-sm tracking-tighter">NHS</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base leading-none tracking-tight">CliniBridge</h1>
              <span className="text-[10px] bg-white/20 font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-nhs-lightblue font-medium leading-tight">
              Triage & SNOMED Grounding
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            onClick={onToggleDoctorMode}
            className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-2.5 rounded-full border transition-all ${
              isDoctorMode
                ? 'bg-amber-500 hover:bg-amber-600 border-amber-300 text-slate-900 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title="Toggle Clinician / Patient View"
          >
            {isDoctorMode ? (
              <>
                <Stethoscope className="w-3.5 h-3.5 text-slate-900" />
                <span>Doctor</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Patient</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <LanguageSelector
            currentLanguage={currentLanguage}
            onSelectLanguage={onSelectLanguage}
          />
        </div>
      </div>

      {/* Status Bar Indicators */}
      <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-nhs-lightblue">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span className="text-white/90 font-medium">Gemini 3.8/4-Argon</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-300" />
            <span className="text-white/90 font-medium">Atlas Vector + SNOMED</span>
          </div>
        </div>

        <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.2 rounded font-mono">
          Ready
        </span>
      </div>
    </header>
  );
};
