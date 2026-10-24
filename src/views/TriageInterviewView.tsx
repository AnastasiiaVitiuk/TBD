import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Square, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface TriageInterviewViewProps {
  patientLanguage: SupportedLanguage;
  initialComplaint: string;
  onComplete: (interviewAnswers: Record<string, string>) => void;
  onBack: () => void;
}

interface QuestionDef {
  key: string;
  field: string;
  questionByLang: Record<string, string>;
  quickOptionsByLang: Record<string, string[]>;
}

const TRIAGE_QUESTIONS: QuestionDef[] = [
  {
    key: 'location',
    field: 'Location',
    questionByLang: {
      pl: 'Gdzie dokładnie Cię boli lub gdzie odczuwasz dyskomfort?',
      es: '¿Dónde le duele exactamente o en qué parte siente el malestar?',
      uk: 'Де саме у вас болить або де ви відчуваєте дискомфорт?',
      en: 'Where exactly does it hurt or where do you feel the discomfort?',
    },
    quickOptionsByLang: {
      pl: ['Górna część brzucha', 'Klatka piersiowa', 'Prawa strona głowy', 'Dolny odcinek pleców', 'Gardło'],
      es: ['Parte alta del abdomen', 'Centro del pecho', 'Un lado de la cabeza', 'Espalda baja', 'Garganta'],
      uk: ['Верхня частина живота', 'Грудна клітка', 'Правий бік голови', 'Поперек', 'Горло'],
      en: ['Upper stomach / abdomen', 'Center of chest', 'One side of head', 'Lower back', 'Throat'],
    },
  },
  {
    key: 'timeline',
    field: 'Timeline & Onset',
    questionByLang: {
      pl: 'Kiedy to się zaczęło i czy ból jest ciągły, czy pojawia się falami?',
      es: '¿Cuándo comenzó y el dolor es constante o viene en oleadas?',
      uk: 'Коли це почалося і біль постійний чи зʼявляється хвилями?',
      en: 'When did it start, and is the pain constant or does it come and go?',
    },
    quickOptionsByLang: {
      pl: ['Dziś rano nagle', 'Od 2-3 dni po jedzeniu', 'Od ponad tygodnia', 'Przychodzi falami'],
      es: ['Esta mañana de repente', 'Desde hace 2-3 días', 'Más de una semana', 'Viene y va en oleadas'],
      uk: ['Сьогодні вранці раптово', '2-3 дні тому', 'Більше тижня', 'Нападами / хвилями'],
      en: ['Suddenly this morning', '2-3 days ago after food', 'Over a week ago', 'Comes and goes in waves'],
    },
  },
  {
    key: 'severity',
    field: 'Severity (1-10)',
    questionByLang: {
      pl: 'Jak mocny jest ten ból w skali od 1 do 10? (1 = lekki, 10 = najgorszy możliwy)',
      es: '¿Qué tan fuerte es el dolor en una escala del 1 al 10? (1 = leve, 10 = insoportable)',
      uk: 'Наскільки сильний біль за шкалою від 1 до 10? (1 = слабкий, 10 = нестерпний)',
      en: 'How severe is the pain on a scale of 1 to 10? (1 = mild, 10 = unbearable)',
    },
    quickOptionsByLang: {
      pl: ['3/10 (Łagodny)', '6/10 (Umiarkowany)', '8/10 (Bardzo silny)', '10/10 (Niewyobrażalny ból)'],
      es: ['3/10 (Leve)', '6/10 (Moderado)', '8/10 (Muy fuerte)', '10/10 (Dolor insoportable)'],
      uk: ['3/10 (Помірний)', '6/10 (Середній)', '8/10 (Дуже сильний)', '10/10 (Нестерпний)'],
      en: ['3/10 (Mild)', '6/10 (Moderate)', '8/10 (Severe)', '10/10 (Worst possible)'],
    },
  },
  {
    key: 'triggers',
    field: 'Triggers & Relieving Factors',
    questionByLang: {
      pl: 'Czy cokolwiek łagodzi ten stan lub go pogarsza?',
      es: '¿Hay algo que mejore o empeore el malestar?',
      uk: 'Чи є щось, що полегшує або погіршує стан?',
      en: 'Does anything make it better or worse?',
    },
    quickOptionsByLang: {
      pl: ['Gorzej po tłustym jedzeniu', 'Lepiej po odpoczynku', 'Gorzej przy głębokim wdechu', 'Nic nie pomaga'],
      es: ['Empeora tras comer', 'Mejora descansando', 'Empeora al respirar hondo', 'Nada ayuda'],
      uk: ['Гірше після їжі', 'Краще у спокої', 'Гірше при глибокому вдиху', 'Нічого не допомагає'],
      en: ['Worse after eating', 'Better with rest', 'Worse with deep breath', 'Nothing helps'],
    },
  },
  {
    key: 'associated',
    field: 'Associated Symptoms',
    questionByLang: {
      pl: 'Czy masz inne objawy, np. gorączkę, nudności, duszność, zawroty głowy?',
      es: '¿Tiene otros síntomas como fiebre, náuseas, falta de aire o mareos?',
      uk: 'Чи є інші симптоми, наприклад температура, нудота, задишка, запаморочення?',
      en: 'Do you have any other symptoms like fever, nausea, breathlessness, or dizziness?',
    },
    quickOptionsByLang: {
      pl: ['Nudności i zgaga', 'Zawroty głowy i osłabienie', 'Gorączka i dreszcze', 'Brak innych objawów'],
      es: ['Náuseas y acidez', 'Mareos y fatiga', 'Fiebre y escalofríos', 'Sin otros síntomas'],
      uk: ['Нудота та печія', 'Запаморочення та слабкість', 'Температура', 'Інших симптомів немає'],
      en: ['Nausea and heartburn', 'Dizziness and fatigue', 'Fever and chills', 'No other symptoms'],
    },
  },
  {
    key: 'meds_allergies',
    field: 'Medications & Allergies',
    questionByLang: {
      pl: 'Czy przyjmujesz jakieś stałe leki lub masz znane alergie?',
      es: '¿Toma medicamentos de forma habitual o tiene alguna alergia?',
      uk: 'Чи приймаєте ви якісь постійні ліки або чи маєте алергії?',
      en: 'Are you taking any regular medications or do you have any allergies?',
    },
    quickOptionsByLang: {
      pl: ['Brak stałych leków i alergii', 'Leki na nadciśnienie (Ramipril)', 'Alergia na penicylinę', 'Biorę leki przeciwbólowe'],
      es: ['Sin medicamentos ni alergias', 'Medicamento de presión arterial', 'Alergia a la penicilina', 'Ibuprofeno ocasional'],
      uk: ['Без ліків та алергій', 'Препарати від тиску', 'Алергія на пеніцилін', 'Приймаю знеболювальні'],
      en: ['No regular meds or allergies', 'Blood pressure medication', 'Allergic to penicillin', 'Occasional painkillers'],
    },
  },
];

export const TriageInterviewView: React.FC<TriageInterviewViewProps> = ({
  patientLanguage,
  initialComplaint,
  onComplete,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    complaint: initialComplaint,
  });
  const [inputVal, setInputVal] = useState('');

  const currentQ = TRIAGE_QUESTIONS[currentStep];
  const langCode = patientLanguage.code;
  const questionText = currentQ.questionByLang[langCode] || currentQ.questionByLang.en;
  const questionEn = currentQ.questionByLang.en;
  const options = currentQ.quickOptionsByLang[langCode] || currentQ.quickOptionsByLang.en;

  const handleNext = () => {
    const finalAnswer = (inputVal || answers[currentQ.key] || 'Not reported').trim();
    const updated = { ...answers, [currentQ.key]: finalAnswer };
    setAnswers(updated);
    setInputVal('');

    if (currentStep < TRIAGE_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(updated);
    }
  };

  const handleSelectOption = (opt: string) => {
    setInputVal(opt);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Top Bar with Step Count */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold bg-nhs-blue/20 text-nhs-lightblue px-2.5 py-1 rounded-full border border-nhs-blue/30">
          Question {currentStep + 1} of {TRIAGE_QUESTIONS.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-nhs-lightblue to-nhs-blue h-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / TRIAGE_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Virtual Triage Nurse Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-nhs-blue to-teal-400 flex items-center justify-center flex-shrink-0 text-white shadow-md font-bold text-xs">
            NHS
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold text-nhs-lightblue uppercase tracking-wider mb-0.5">
              Triage Nurse ({currentQ.field})
            </div>
            <h3 className="font-extrabold text-base text-white leading-snug">
              {questionText}
            </h3>
            {langCode !== 'en' && (
              <p className="text-xs text-slate-400 mt-1 italic border-t border-slate-700/60 pt-1">
                English: {questionEn}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Option Buttons */}
      <div className="mb-4">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Tap Quick Answer or Type Below:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt, idx) => {
            const isSelected = inputVal === opt;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-nhs-blue border-nhs-lightblue text-white shadow-md'
                    : 'bg-slate-800/70 border-slate-700 hover:bg-slate-700/60 text-slate-200'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Freeform input */}
      <div className="mb-4">
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Or write your answer in ${patientLanguage.nativeName}...`}
          rows={2}
          className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nhs-blue"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="mt-auto pt-2 flex gap-2">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-3 rounded-xl border border-slate-700 text-xs"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-2 w-full flex items-center justify-center gap-2 bg-nhs-blue hover:bg-nhs-brightblue text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition-transform active:scale-[0.99]"
        >
          <span>{currentStep === TRIAGE_QUESTIONS.length - 1 ? 'Finish & Generate Clinical File' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
