import React, { useState } from 'react';
import { Stethoscope, AlertTriangle, Play, Pause, FileText, CheckCircle, Copy, Share2, MessageSquare, ShieldAlert } from 'lucide-react';
import { SupportedLanguage, StructuredExtraction, SNOMEDGrounding } from '../types';

interface DoctorSummaryViewProps {
  patientLanguage: SupportedLanguage;
  extraction: StructuredExtraction;
  groundedTerms: SNOMEDGrounding[];
  verbatimTranscript: string;
  audioUrl?: string | null;
  onOpenFollowUp: () => void;
  onSwitchToPatientView: () => void;
}

export const DoctorSummaryView: React.FC<DoctorSummaryViewProps> = ({
  patientLanguage,
  extraction,
  groundedTerms,
  verbatimTranscript,
  audioUrl,
  onOpenFollowUp,
  onSwitchToPatientView,
}) => {
  const [copied, setCopied] = useState(false);
  const [showVerbatim, setShowVerbatim] = useState(false);

  const copyToClipboard = () => {
    const textToCopy = `=== NHS CLINICAL INTAKE SUMMARY (CliniBridge) ===
Language: ${patientLanguage.name} (${patientLanguage.nativeName})
AI Notice: AI-generated clinical summary, to be checked by a clinician.

CHIEF COMPLAINT:
${extraction.chiefComplaint}

HISTORY OF PRESENT ILLNESS:
${extraction.historyOfPresentIllness}

SYMPTOMS:
${extraction.symptoms
  .map(
    (s) =>
      `- ${s.symptom}: Location: ${s.location}, Severity: ${s.severity}/10, Onset: ${s.onset}, Duration: ${s.duration}, Nature: ${s.character || 'N/A'}`
  )
  .join('\n')}

MEDICATIONS:
${Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}

ALLERGIES:
${Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}

RED FLAGS:
${extraction.redFlags.detected ? `DETECTED: ${extraction.redFlags.symptomsTriggered.join('; ')}` : 'None detected.'}

AMBIGUITIES / CLARIFICATIONS NEEDED:
${extraction.ambiguities.map((a) => `- ${a}`).join('\n')}

SNOMED CT CODES:
${groundedTerms.map((t) => `- ${t.snomedPreferredTerm} (SNOMED ID: ${t.snomedConceptId})`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Mandatory Safety Label per SPEC */}
      <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-3 mb-3 flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-extrabold text-amber-300 uppercase tracking-wide block">
            AI-Generated Clinical Summary
          </span>
          <p className="text-slate-300 font-medium">
            To be reviewed and verified by a registered healthcare professional. Does not constitute a clinical diagnosis or treatment prescription.
          </p>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Patient Intake Language:
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base">{patientLanguage.flag}</span>
            <span className="text-sm font-bold text-white">{patientLanguage.name}</span>
            <span className="text-xs text-slate-400">({patientLanguage.nativeName})</span>
          </div>
        </div>

        {/* Triage Priority Badge */}
        <div>
          {extraction.redFlags.detected ? (
            <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-red-900/40 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              Emergency 999
            </span>
          ) : (
            <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full">
              Standard Triage
            </span>
          )}
        </div>
      </div>

      {/* Audio Playback for Clinician */}
      {audioUrl && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-nhs-blue flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Patient Voice Recording</div>
              <div className="text-[10px] text-slate-400">Verbatim intake audio in {patientLanguage.nativeName}</div>
            </div>
          </div>
          <audio src={audioUrl} controls className="h-8 max-w-[160px]" />
        </div>
      )}

      {/* Clinical SBAR / HPI Card */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 mb-3 space-y-3 shadow-md">
        {/* Chief Complaint */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-nhs-lightblue block mb-1">
            Chief Complaint (English):
          </span>
          <h3 className="text-base font-extrabold text-white">
            {extraction.chiefComplaint}
          </h3>
          <p className="text-xs text-slate-400 italic mt-0.5">
            Reported as: "{extraction.chiefComplaintInPatientLang}"
          </p>
        </div>

        {/* History of Present Illness */}
        <div className="border-t border-slate-700/60 pt-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            History of Present Illness (HPI):
          </span>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            {extraction.historyOfPresentIllness}
          </p>
        </div>

        {/* Symptoms Breakdown Table */}
        <div className="border-t border-slate-700/60 pt-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Symptom Characterisation:
          </span>
          <div className="space-y-2">
            {extraction.symptoms.map((s, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{s.symptom}</span>
                  <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px]">
                    Severity: {s.severity}/10
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 font-medium">Location: </span>
                    {s.location}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Onset: </span>
                    {s.onset}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Duration: </span>
                    {s.duration}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Character: </span>
                    {s.character || 'Not reported'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medications & Allergies (No hallucinations rule) */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-700/60 pt-2.5">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Current Medications:
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Known Allergies:
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}
            </span>
          </div>
        </div>

        {/* Ambiguities / Follow-ups Needed */}
        {extraction.ambiguities && extraction.ambiguities.length > 0 && (
          <div className="border-t border-slate-700/60 pt-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Ambiguities / Clinician Clarification Recommended:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-300 bg-amber-950/20 p-2 rounded-xl border border-amber-900/30">
              {extraction.ambiguities.map((amb, i) => (
                <li key={i}>{amb}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Grounded SNOMED CT Concepts */}
        <div className="border-t border-slate-700/60 pt-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
            Matched SNOMED CT Concepts (NHS TRUD):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {groundedTerms.map((t, idx) => (
              <div
                key={idx}
                className="bg-blue-950/60 border border-blue-700/60 px-2.5 py-1 rounded-lg text-xs text-slate-200"
              >
                <span className="font-bold text-white">{t.snomedPreferredTerm}</span>{' '}
                <span className="text-cyan-300 font-mono text-[10px] font-semibold">
                  (ID: {t.snomedConceptId})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verbatim Transcript Dropdown */}
      <div className="mb-4">
        <button
          onClick={() => setShowVerbatim(!showVerbatim)}
          className="text-xs font-bold text-nhs-lightblue hover:text-white flex items-center gap-1 mb-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showVerbatim ? 'Hide Verbatim Transcript' : 'Show Verbatim Patient Transcript'}</span>
        </button>
        {showVerbatim && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap">
            {verbatimTranscript || 'No verbatim speech recorded.'}
          </div>
        )}
      </div>

      {/* Clinician Action Buttons */}
      <div className="mt-auto pt-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl border border-slate-700 text-xs shadow-sm"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onSwitchToPatientView}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl border border-slate-700 text-xs shadow-sm"
          >
            <span>Patient View</span>
          </button>
        </div>

        <button
          onClick={onOpenFollowUp}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.99] text-sm"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Doctor Follow-up Mode (Ask Questions & Simplify Jargon)</span>
        </button>
      </div>
    </div>
  );
};
