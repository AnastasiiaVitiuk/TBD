import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';
import { RedFlagAssessment, SupportedLanguage } from '../types';

interface EmergencyBannerProps {
  redFlags: RedFlagAssessment;
  patientLanguage: SupportedLanguage;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ redFlags, patientLanguage }) => {
  if (!redFlags.detected) return null;

  return (
    <div className="bg-red-600 border-2 border-red-400 text-white p-4 rounded-2xl shadow-xl shadow-red-950/40 mb-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
          <ShieldAlert className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-black/30 text-white font-bold text-xs uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-white/20">
              NHS Emergency Red Flag
            </span>
            <span className="text-xs font-semibold bg-red-800/80 px-2 py-0.5 rounded text-white/90">
              Immediate Danger
            </span>
          </div>

          <h3 className="font-extrabold text-base leading-tight mb-1 text-white">
            {patientLanguage.code !== 'en' ? redFlags.recommendationInPatientLang : redFlags.recommendation}
          </h3>

          {patientLanguage.code !== 'en' && (
            <p className="text-xs text-red-100 font-medium mb-2 border-t border-red-500/50 pt-1.5 mt-1.5">
              <strong className="text-white">English: </strong>
              {redFlags.recommendation}
            </p>
          )}

          {redFlags.symptomsTriggered.length > 0 && (
            <div className="bg-black/25 rounded-lg p-2.5 my-2.5 text-xs border border-white/10">
              <span className="font-semibold block text-red-200 mb-1">Triggered Indicators:</span>
              <ul className="list-disc list-inside space-y-0.5 text-red-100">
                {redFlags.symptomsTriggered.map((sym, idx) => (
                  <li key={idx} className="font-medium">{sym}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <a
              href="tel:999"
              className="flex-1 flex items-center justify-center gap-2 bg-white text-red-700 hover:bg-red-50 font-black py-2.5 px-4 rounded-xl shadow-md transition-transform active:scale-95 text-sm"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              Call 999 Immediately
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
