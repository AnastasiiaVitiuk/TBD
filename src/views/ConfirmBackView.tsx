import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CheckCircle, Edit3, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { SupportedLanguage, StructuredExtraction } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface ConfirmBackViewProps {
  patientLanguage: SupportedLanguage;
  extraction: StructuredExtraction;
  onConfirm: () => void;
  onClarify: () => void;
}

export const ConfirmBackView: React.FC<ConfirmBackViewProps> = ({
  patientLanguage,
  extraction,
  onConfirm,
  onClarify,
}) => {
  const { isSpeaking, speak, stop, supported } = useSpeechSynthesis();
  const [readoutText, setReadoutText] = useState('');

  // Build the patient-friendly read-back text in their language
  useEffect(() => {
    let text = '';
    const lang = patientLanguage.code;

    if (lang === 'pl') {
      text = `Sprawdźmy, czy dobrze Cię zrozumieliśmy. Zgłaszasz: ${extraction.chiefComplaintInPatientLang}. ` +
        `Objawy trwają od niedawna, a ich nasilenie to ${extraction.symptoms[0]?.severity || 5} na 10. ` +
        `Leki: ${Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}. ` +
        `Alergie: ${Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}. ` +
        `Czy te informacje są poprawne przed przekazaniem ich lekarzowi?`;
    } else if (lang === 'es') {
      text = `Verifiquemos si lo entendimos correctamente. Su motivo de consulta es: ${extraction.chiefComplaintInPatientLang}. ` +
        `Severidad reportada: ${extraction.symptoms[0]?.severity || 5} de 10. ` +
        `Medicamentos: ${Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}. ` +
        `Alergias: ${Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}. ` +
        `¿Es correcta esta información antes de enviarla al médico?`;
    } else if (lang === 'uk') {
      text = `Перевіримо, чи все вірно записано. Ваша скарга: ${extraction.chiefComplaintInPatientLang}. ` +
        `Рівень болю: ${extraction.symptoms[0]?.severity || 5} з 10. ` +
        `Препарати: ${Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}. ` +
        `Алергії: ${Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}. ` +
        `Чи все правильно перед тим, як ми передамо це лікарю?`;
    } else {
      text = `Let's verify if we captured your symptoms correctly. Your primary concern is: ${extraction.chiefComplaint}. ` +
        `Severity rated as ${extraction.symptoms[0]?.severity || 5} out of 10. ` +
        `Medications: ${Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}. ` +
        `Allergies: ${Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}. ` +
        `Did we get this right before sharing with your clinician?`;
    }

    setReadoutText(text);
  }, [patientLanguage, extraction]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(readoutText, patientLanguage.speechCode);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 overflow-y-auto">
      {/* NHS Safety Header */}
      <div className="flex items-center gap-2 mb-3 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-300 text-xs">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span>Step 4: Confirm-Back Step (Safety Pre-Verification)</span>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-extrabold text-white">
          {patientLanguage.code === 'pl'
            ? 'Czy dobrze Cię zrozumieliśmy?'
            : patientLanguage.code === 'es'
            ? '¿Entendimos todo correctamente?'
            : patientLanguage.code === 'uk'
            ? 'Чи правильно ми вас зрозуміли?'
            : 'Did we get this right?'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Listen to the summary in your language before it is sent to the doctor.
        </p>
      </div>

      {/* Audio Read-Out Card */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 mb-4 shadow-lg flex flex-col items-center text-center">
        <button
          onClick={toggleSpeech}
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg transition-transform active:scale-95 ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : 'bg-nhs-blue hover:bg-nhs-brightblue text-white'
          }`}
          aria-label="Read back summary"
        >
          {isSpeaking ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
        </button>

        <span className="text-xs font-bold text-white mb-1">
          {isSpeaking ? 'Reading back to you now...' : 'Tap to Listen to Summary'}
        </span>
        <span className="text-[11px] text-nhs-lightblue">
          Language: {patientLanguage.nativeName} ({patientLanguage.flag})
        </span>

        {/* Written confirmation text */}
        <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 text-left text-xs text-slate-200 leading-relaxed w-full">
          {readoutText}
        </div>
      </div>

      {/* Structured Key Points */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3 mb-4 space-y-2 text-xs">
        <div className="flex justify-between border-b border-slate-700/40 pb-1.5">
          <span className="text-slate-400">Chief Complaint:</span>
          <span className="font-semibold text-white text-right max-w-[60%] truncate">
            {extraction.chiefComplaintInPatientLang || extraction.chiefComplaint}
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-700/40 pb-1.5">
          <span className="text-slate-400">Pain Severity:</span>
          <span className="font-semibold text-amber-400">
            {extraction.symptoms[0]?.severity || 5} / 10
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-700/40 pb-1.5">
          <span className="text-slate-400">Medications:</span>
          <span className="font-medium text-slate-300">
            {Array.isArray(extraction.medications) ? extraction.medications.join(', ') : extraction.medications}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Allergies:</span>
          <span className="font-medium text-slate-300">
            {Array.isArray(extraction.allergies) ? extraction.allergies.join(', ') : extraction.allergies}
          </span>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="mt-auto pt-2 flex flex-col gap-2">
        <button
          onClick={() => {
            stop();
            onConfirm();
          }}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.99] text-sm"
        >
          <CheckCircle className="w-5 h-5 text-white" />
          <span>
            {patientLanguage.code === 'pl'
              ? 'Tak, wszystko się zgadza (Przekaż lekarzowi)'
              : patientLanguage.code === 'es'
              ? 'Sí, todo está correcto (Enviar al médico)'
              : patientLanguage.code === 'uk'
              ? 'Так, все правильно (Надіслати лікарю)'
              : 'Yes, this is accurate (Submit to Doctor)'}
          </span>
        </button>

        <button
          onClick={() => {
            stop();
            onClarify();
          }}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-3 rounded-xl border border-slate-700 text-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>
            {patientLanguage.code === 'pl'
              ? 'Chcę coś doprecyzować lub poprawić'
              : patientLanguage.code === 'es'
              ? 'Quiero corregir o aclarar algo'
              : patientLanguage.code === 'uk'
              ? 'Я хочу щось уточнити або виправити'
              : 'I need to clarify or correct something'}
          </span>
        </button>
      </div>
    </div>
  );
};
