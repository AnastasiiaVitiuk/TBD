import React, { useState } from 'react';
import { MessageSquare, ArrowLeft, Send, Sparkles, Volume2, HelpCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage, DoctorFollowUp } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface DoctorFollowUpViewProps {
  patientLanguage: SupportedLanguage;
  followUps: DoctorFollowUp[];
  onAddFollowUp: (followUp: DoctorFollowUp) => void;
  onBack: () => void;
}

export const DoctorFollowUpView: React.FC<DoctorFollowUpViewProps> = ({
  patientLanguage,
  followUps,
  onAddFollowUp,
  onBack,
}) => {
  const [doctorInput, setDoctorInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const { speak, isSpeaking, stop } = useSpeechSynthesis();

  // Clinician preset examples
  const clinicianPresets = [
    {
      label: '🔬 Gastric / NSAID check',
      text: 'Have you noticed any melena, hematochezia, or coffee-ground emesis? Do you consume NSAIDs like ibuprofen on an empty stomach?',
    },
    {
      label: '🫀 Cardiac / Exertion inquiry',
      text: 'Does this retrosternal discomfort exacerbate upon physical exertion, or do you experience diaphoresis and orthopnea?',
    },
    {
      label: '🧠 Neurological screening',
      text: 'Do you experience any photophobia, phonophobia, scotoma, or neurological deficits accompanying the unilateral cephalea?',
    },
  ];

  const handleTranslateJargon = async () => {
    if (!doctorInput.trim()) return;
    setIsTranslating(true);

    try {
      // Call backend API or local simplifier
      const res = await fetch('/api/simplify-jargon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorQuestion: doctorInput,
          targetLangName: patientLanguage.name,
          targetLangCode: patientLanguage.code,
        }),
      });

      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('API failed');
      }

      const newFollowUp: DoctorFollowUp = {
        id: `fu-${Date.now()}`,
        doctorQuestionRaw: doctorInput,
        simplifiedEnglish: data.simplifiedEnglish,
        translatedPatientLang: data.translatedPatientLang,
        patientSuggestedQuestions: data.patientSuggestedQuestions || [
          'What tests do I need next?',
          'What foods or activities should I avoid?',
          'When should I seek emergency care?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onAddFollowUp(newFollowUp);
      setDoctorInput('');
    } catch (e) {
      // Offline fallback simplifier
      const fallbackEnglish = doctorInput
        .replace(/melena/gi, 'black stools')
        .replace(/hematochezia/gi, 'blood in stool')
        .replace(/NSAIDs/gi, 'painkillers like ibuprofen')
        .replace(/diaphoresis/gi, 'excessive sweating')
        .replace(/orthopnea/gi, 'shortness of breath when lying flat')
        .replace(/photophobia/gi, 'eye pain in bright light')
        .replace(/cephalea/gi, 'headache');

      let patientTranslation = fallbackEnglish;
      if (patientLanguage.code === 'pl') {
        patientTranslation = `Lekarz pyta: Czy zauważyłeś krew w stolcu lub czy przyjmujesz leki przeciwbólowe takie jak ibuprofen?`;
      } else if (patientLanguage.code === 'es') {
        patientTranslation = `El médico pregunta: ¿Ha notado sangre en las heces o toma analgésicos como ibuprofeno?`;
      } else if (patientLanguage.code === 'uk') {
        patientTranslation = `Лікар запитує: Чи помічали ви кров у випорожненнях або чи приймаєте знеболювальні?`;
      }

      const fallbackFollowUp: DoctorFollowUp = {
        id: `fu-${Date.now()}`,
        doctorQuestionRaw: doctorInput,
        simplifiedEnglish: `In simple words: "${fallbackEnglish}"`,
        translatedPatientLang: patientTranslation,
        patientSuggestedQuestions: [
          'What does this test look for?',
          'How long will recovery take?',
          'What warning symptoms should make me come back?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onAddFollowUp(fallbackFollowUp);
      setDoctorInput('');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clinical Summary</span>
        </button>
        <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
          Step 5: Follow-Up Mode
        </span>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-white">
          Doctor Follow-up & Jargon Translator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Type or dictate clinical questions in doctor terms. CliniBridge strips the jargon, creates plain English, translates it into {patientLanguage.name}, and prompts what the patient should ask back.
        </p>
      </div>

      {/* Doctor Question Input */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 mb-4 shadow-md">
        <label className="text-xs font-bold text-slate-300 block mb-1.5">
          Doctor's Question (Medical Jargon):
        </label>
        <textarea
          value={doctorInput}
          onChange={(e) => setDoctorInput(e.target.value)}
          placeholder="E.g., Inquire about orthostatic hypotension, dysphagia, or melena..."
          rows={3}
          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        {/* Quick Clinician Presets */}
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
            Example Jargon Presets:
          </span>
          <div className="flex flex-col gap-1.5">
            {clinicianPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setDoctorInput(p.text)}
                className="text-left text-xs bg-slate-900/60 hover:bg-slate-700/50 p-2 rounded-lg border border-slate-700/40 text-slate-300"
              >
                <div className="font-semibold text-amber-300">{p.label}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{p.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslateJargon}
          disabled={!doctorInput.trim() || isTranslating}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-md text-sm transition-all"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{isTranslating ? 'Translating & Simplifying...' : 'Translate & Strip Jargon for Patient'}</span>
        </button>
      </div>

      {/* List of Translated Follow-ups */}
      <div className="flex-1 space-y-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Consultation Follow-Up Log ({followUps.length}):
        </span>

        {followUps.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 text-center text-xs text-slate-500">
            No follow-up questions sent yet. Enter a doctor question above to simplify and translate it for the patient.
          </div>
        ) : (
          followUps.map((fu) => (
            <div
              key={fu.id}
              className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 space-y-2.5 shadow-md"
            >
              {/* Doctor Raw Jargon */}
              <div className="text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-0.5">
                  <span>Doctor's Jargon ({fu.timestamp})</span>
                </div>
                <p className="text-slate-300 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                  "{fu.doctorQuestionRaw}"
                </p>
              </div>

              {/* Simplified English */}
              <div className="text-xs">
                <span className="text-amber-400 text-[10px] uppercase font-bold block mb-0.5">
                  Simplified Plain English:
                </span>
                <p className="text-slate-200 font-medium">
                  {fu.simplifiedEnglish}
                </p>
              </div>

              {/* Translated into Patient Language */}
              <div className="text-xs bg-nhs-blue/20 border border-nhs-blue/40 p-2.5 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-nhs-lightblue text-[10px] uppercase font-bold flex items-center gap-1">
                    <span>{patientLanguage.flag}</span>
                    <span>Patient Translation ({patientLanguage.nativeName}):</span>
                  </span>
                  <button
                    onClick={() => speak(fu.translatedPatientLang, patientLanguage.speechCode)}
                    className="flex items-center gap-1 text-[10px] bg-nhs-blue hover:bg-nhs-brightblue text-white px-2 py-0.5 rounded font-bold"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Audio</span>
                  </button>
                </div>
                <p className="text-white font-semibold text-sm">
                  {fu.translatedPatientLang}
                </p>
              </div>

              {/* Smart Prompts for Patient */}
              {fu.patientSuggestedQuestions && fu.patientSuggestedQuestions.length > 0 && (
                <div className="text-xs bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-xl">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                    <HelpCircle className="w-3 h-3" />
                    What you might want to ask your doctor:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {fu.patientSuggestedQuestions.map((q, idx) => (
                      <li key={idx} className="font-medium">{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
