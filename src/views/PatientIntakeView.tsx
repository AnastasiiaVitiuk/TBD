import React, { useState } from 'react';
import { Mic, Square, ArrowRight, MessageSquareText, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { SupportedLanguage, RedFlagAssessment } from '../types';
import { AudioWaveform } from '../components/AudioWaveform';
import { EmergencyBanner } from '../components/EmergencyBanner';

interface PatientIntakeViewProps {
  patientLanguage: SupportedLanguage;
  isRecording: boolean;
  recordingTime: number;
  audioLevels: number[];
  audioUrl: string | null;
  liveSpeechTranscript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStartTriage: (initialText: string) => void;
  onAnalyzeImmediately: (text: string) => void;
  redFlags: RedFlagAssessment;
}

export const PatientIntakeView: React.FC<PatientIntakeViewProps> = ({
  patientLanguage,
  isRecording,
  recordingTime,
  audioLevels,
  audioUrl,
  liveSpeechTranscript,
  onStartRecording,
  onStopRecording,
  onStartTriage,
  onAnalyzeImmediately,
  redFlags,
}) => {
  const [manualText, setManualText] = useState('');

  // Sample prompt test presets per language
  const presetsByLang: Record<string, { label: string; text: string; isRedFlag?: boolean }[]> = {
    pl: [
      {
        label: '🔥 Pieczenie w żołądku (Dyspepsja)',
        text: 'Od trzech dni czuję mocne pieczenie w żołądku po jedzeniu, jakby palił mnie ogień. Biorę leki na nadciśnienie, nie mam alergii.',
      },
      {
        label: '🚨 Ściskający ból w klatce (Alarm 999!)',
        text: 'Nagle poczułem silny, ściskający ból w klatce piersiowej, który promieniuje do lewej ręki i brakuje mi tchu.',
        isRedFlag: true,
      },
      {
        label: '⚡ Pulsujący ból głowy (Migrena)',
        text: 'Mam pulsujący ból po prawej stronie głowy od wczoraj rano. Światło mnie bardzo razi i zbiera mi się na mdłości.',
      },
    ],
    es: [
      {
        label: '🔥 Ardor en el estómago',
        text: 'Tengo un fuego y ardor en el estómago desde hace dos días después de comer. No tomo medicamentos.',
      },
      {
        label: '🚨 Dolor opresivo en el pecho (999)',
        text: 'Siento una presión muy fuerte en el centro del pecho que se me va al brazo izquierdo y me falta el aire.',
        isRedFlag: true,
      },
      {
        label: '⚡ Dolor punzante de cabeza',
        text: 'Tengo una migraña muy fuerte desde ayer con sensibilidad extrema a la luz y mareos.',
      },
    ],
    uk: [
      {
        label: '🔥 Печіння в шлунку',
        text: 'У мене сильне печіння в шлунку вже кілька днів, особливо після їжі. Ліків постійно не приймаю.',
      },
      {
        label: '🚨 Стискає серце і груди (999)',
        text: 'Раптово почало сильно тиснути в грудях, віддає в ліву руку і німіють пальці, важко дихати.',
        isRedFlag: true,
      },
      {
        label: '⚡ Пульсує голова',
        text: 'Дуже сильно болить скроня з правого боку, світло ріже очі і паморочиться голова.',
      },
    ],
  };

  const currentPresets = presetsByLang[patientLanguage.code] || [
    {
      label: '🔥 Burning stomach / Dyspepsia',
      text: 'I have severe burning pain in my stomach after eating for the last three days. No regular meds or allergies.',
    },
    {
      label: '🚨 Crushing chest pain (Emergency 999)',
      text: 'I suddenly developed heavy crushing chest pressure radiating into my left arm and jaw, feeling breathless.',
      isRedFlag: true,
    },
    {
      label: '⚡ Throbbing one-sided headache',
      text: 'I have a throbbing headache on the right side with nausea and sensitivity to bright lights.',
    },
  ];

  const effectiveText = (liveSpeechTranscript || manualText).trim();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-slate-900 text-slate-100">
      {/* Emergency Red Flag Interceptor */}
      <EmergencyBanner redFlags={redFlags} patientLanguage={patientLanguage} />

      {/* Hero Greeting in Patient Language */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nhs-blue/20 border border-nhs-blue/40 text-nhs-lightblue text-xs font-semibold mb-2">
          <span>{patientLanguage.flag}</span>
          <span>{patientLanguage.name} Intake</span>
        </div>
        <h2 className="text-xl font-extrabold text-white leading-tight">
          {patientLanguage.greeting}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tap the microphone below and speak in your language. We will record, guide you with triage questions, and map your symptoms into official NHS clinical terms.
        </p>
      </div>

      {/* Main Big Voice Intake Button */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg mb-4">
        <div className="relative mb-3">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping-slow opacity-60" />
          )}
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95 shadow-xl ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-tr from-nhs-darkblue to-nhs-blue hover:from-nhs-blue hover:to-nhs-brightblue text-white'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Voice Intake'}
          >
            {isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
            <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">
              {isRecording ? 'Stop' : 'Tap & Speak'}
            </span>
          </button>
        </div>

        {/* Live Audio Status */}
        {isRecording ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Recording: {formatTimer(recordingTime)}
            </div>
            <AudioWaveform isRecording={isRecording} levels={audioLevels} />
            <p className="text-xs text-slate-300 italic">
              Listening in {patientLanguage.nativeName}...
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Powered by <strong className="text-nhs-lightblue">Gemini 3.8 Live & Transcribe</strong>
          </p>
        )}

        {/* Audio Playback if recorded */}
        {audioUrl && !isRecording && (
          <div className="mt-3 w-full bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-nhs-lightblue flex-shrink-0" />
            <audio src={audioUrl} controls className="w-full h-8" />
          </div>
        )}
      </div>

      {/* Live Verbatim Speech Transcript / Text Fallback */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5 text-nhs-lightblue" />
            Verbatim Patient Description:
          </label>
          {liveSpeechTranscript && (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
              Live Speech Recognized
            </span>
          )}
        </div>

        <textarea
          value={liveSpeechTranscript || manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder={`Describe your symptoms in ${patientLanguage.nativeName} or English (e.g. where it hurts, how bad it feels)...`}
          rows={3}
          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nhs-blue"
        />

        {/* Quick Test Presets */}
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Quick Test Presets ({patientLanguage.nativeName}):
          </span>
          <div className="flex flex-col gap-1.5">
            {currentPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setManualText(preset.text)}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  preset.isRedFlag
                    ? 'bg-red-950/40 border-red-800/60 text-red-200 hover:bg-red-900/50'
                    : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:bg-slate-700/70'
                }`}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{preset.text}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        <button
          onClick={() => onStartTriage(effectiveText)}
          disabled={!effectiveText}
          className="w-full flex items-center justify-center gap-2 bg-nhs-blue hover:bg-nhs-brightblue disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] text-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Start Guided Triage Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onAnalyzeImmediately(effectiveText)}
          disabled={!effectiveText}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 disabled:opacity-50"
        >
          <span>Skip Interview & Extract Clinical Summary Directly</span>
        </button>
      </div>
    </div>
  );
};
