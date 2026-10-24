import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/snomedData';
import { SupportedLanguage } from '../types';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold py-1.5 px-3 rounded-full border border-white/20 transition-all shadow-sm"
        aria-label="Select Patient Language"
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        <span className="max-w-[70px] truncate">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5">
            <div className="px-3 py-2 border-b border-slate-700/80 bg-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-nhs-lightblue" />
                Select Patient Language
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-700/30">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLanguage.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-nhs-blue text-white font-semibold'
                        : 'hover:bg-slate-700/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <div>
                        <div className="leading-snug">{lang.nativeName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{lang.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
