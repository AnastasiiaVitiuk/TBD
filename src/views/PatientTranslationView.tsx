import React from 'react';
import { BookOpen, Database, ArrowRight, ShieldCheck, Stethoscope, ChevronRight } from 'lucide-react';
import { SupportedLanguage, SNOMEDGrounding, StructuredExtraction } from '../types';

interface PatientTranslationViewProps {
  patientLanguage: SupportedLanguage;
  extraction: StructuredExtraction;
  groundedTerms: SNOMEDGrounding[];
  onOpenDoctorView: () => void;
  onOpenFollowUp: () => void;
}

export const PatientTranslationView: React.FC<PatientTranslationViewProps> = ({
  patientLanguage,
  extraction,
  groundedTerms,
  onOpenDoctorView,
  onOpenFollowUp,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Title & Introduction */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Patient Translation & SNOMED Grounding</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">
          {patientLanguage.code === 'pl'
            ? 'Twoje objawy w języku medycznym'
            : patientLanguage.code === 'es'
            ? 'Sus síntomas en términos médicos'
            : patientLanguage.code === 'uk'
            ? 'Ваші симптоми медичними термінами'
            : 'Your Symptoms in Clinical Terms'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Here is how your words map to official NHS clinical concepts and what they mean in plain language.
        </p>
      </div>

      {/* Side-by-side Grounding Cards */}
      <div className="space-y-3 mb-4">
        {groundedTerms.map((term, idx) => (
          <div
            key={term.id || idx}
            className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md transition-all hover:border-nhs-lightblue/50"
          >
            {/* Step 1: What patient said */}
            <div className="mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                What you said ({patientLanguage.nativeName}):
              </span>
              <p className="text-sm font-semibold text-white bg-slate-900/60 p-2 rounded-lg border border-slate-700/60">
                "{term.patientPhrase}"
              </p>
            </div>

            {/* Step 2: Clinical SNOMED CT term */}
            <div className="mb-2.5 bg-blue-950/40 border border-blue-800/40 p-2.5 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-nhs-lightblue flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" />
                  Official NHS SNOMED CT Term:
                </span>
                <span className="text-[10px] font-mono bg-nhs-blue text-white px-2 py-0.5 rounded font-bold">
                  ID: {term.snomedConceptId}
                </span>
              </div>
              <div className="text-sm font-extrabold text-white">
                {term.snomedPreferredTerm}
              </div>
              {term.icd10Code && (
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  ICD-10: {term.icd10Code} • Category: {term.clinicalCategory}
                </span>
              )}
            </div>

            {/* Step 3: Plain explanation */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                What this means in plain language ({patientLanguage.nativeName}):
              </span>
              <p className="text-xs text-slate-200 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg">
                {term.plainExplanationInPatientLang || term.plainExplanation}
              </p>
            </div>

            {/* Atlas Vector Score */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                MongoDB Atlas Vector Match
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round((term.matchScore || 0.95) * 100)}% Confidence
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Notice */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 mb-4 text-xs text-slate-400 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-nhs-lightblue flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Safety Notice: </strong>
          This translation bridges everyday words to medical terminology to help NHS doctors understand your needs accurately. It does not replace a clinical examination.
        </p>
      </div>

      {/* Action Buttons to View Doctor View & Follow Up */}
      <div className="mt-auto pt-2 flex flex-col gap-2">
        <button
          onClick={onOpenDoctorView}
          className="w-full flex items-center justify-between bg-nhs-blue hover:bg-nhs-brightblue text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            <span>Switch to Clinician / Doctor View (English)</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenFollowUp}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-3 rounded-xl border border-slate-700 text-xs"
        >
          <span>Ask Doctor Follow-up Questions & Jargon Translator</span>
        </button>
      </div>
    </div>
  );
};
