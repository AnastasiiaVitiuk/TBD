import React, { useState } from 'react';
import { Header } from './components/Header';
import { MobileFrame } from './components/MobileFrame';
import { PatientIntakeView } from './views/PatientIntakeView';
import { TriageInterviewView } from './views/TriageInterviewView';
import { ConfirmBackView } from './views/ConfirmBackView';
import { PatientTranslationView } from './views/PatientTranslationView';
import { DoctorSummaryView } from './views/DoctorSummaryView';
import { DoctorFollowUpView } from './views/DoctorFollowUpView';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { SUPPORTED_LANGUAGES, evaluateRedFlags, groundLayTermsToSNOMED } from './data/snomedData';
import { AppView, SupportedLanguage, StructuredExtraction, SNOMEDGrounding, DoctorFollowUp, RedFlagAssessment } from './types';
import { Mic, ClipboardList, CheckCircle, BookOpen, Stethoscope, MessageSquare } from 'lucide-react';

export function App() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]); // Polish default
  const [currentView, setCurrentView] = useState<AppView>('INTAKE');
  const [isDoctorMode, setIsDoctorMode] = useState<boolean>(false);
  const [activeComplaint, setActiveComplaint] = useState<string>('');

  // Red Flags state
  const [redFlags, setRedFlags] = useState<RedFlagAssessment>({
    detected: false,
    severityLevel: 'NONE',
    symptomsTriggered: [],
    recommendation: 'No acute emergency red flags detected.',
    recommendationInPatientLang: 'Brak ostrych objawów zagrożenia życia.',
  });

  // Audio Recorder Hook
  const audioRecorder = useAudioRecorder(currentLanguage.speechCode);

  // Structured Clinical Extraction State
  const [extraction, setExtraction] = useState<StructuredExtraction>({
    chiefComplaint: 'Burning stomach / Epigastric pain',
    chiefComplaintInPatientLang: 'Pieczenie w żołądku po jedzeniu',
    historyOfPresentIllness: 'Patient reports severe burning sensations in the epigastric region for the past 3 days, exacerbated after food intake.',
    symptoms: [
      {
        symptom: 'Epigastric burning / Dyspepsia',
        symptomInPatientLang: 'Pieczenie w żołądku',
        onset: '3 days ago',
        duration: 'Intermittent episodes lasting 1-2 hours',
        severity: 7,
        location: 'Epigastrium / Upper abdomen',
        character: 'Burning / Acid reflux',
        aggravating: 'Worse after meals',
        relieving: 'Not reported',
      },
    ],
    medications: ['Ramipril (for blood pressure)'],
    allergies: ['Not reported'],
    redFlags: {
      detected: false,
      severityLevel: 'NONE',
      symptomsTriggered: [],
      recommendation: 'No acute red flags.',
      recommendationInPatientLang: 'Brak ostrych objawów zagrożenia życia.',
    },
    ambiguities: ['Exact timing of meals in relation to symptom onset'],
    confidenceScore: 0.94,
  });

  // Grounded SNOMED CT concepts
  const [groundedTerms, setGroundedTerms] = useState<SNOMEDGrounding[]>([
    {
      id: 'sn-25376007',
      patientPhrase: 'pieczenie w żołądku',
      patientLanguage: 'pl',
      englishLayPhrase: 'burning stomach / indigestion / acid heartburn',
      snomedConceptId: '25376007',
      snomedPreferredTerm: 'Dyspepsia / Epigastric pain',
      icd10Code: 'K30',
      clinicalCategory: 'Symptom',
      plainExplanation: 'Irritation or burning sensation in the upper digestive tract or stomach.',
      plainExplanationInPatientLang: 'Uczucie pieczenia lub kwasowości w górnej części żołądka.',
      matchScore: 0.98,
      source: 'snomed-ct-catalog',
    },
  ]);

  // Doctor follow-ups list
  const [followUps, setFollowUps] = useState<DoctorFollowUp[]>([]);

  // Verbatim transcript
  const [verbatimTranscript, setVerbatimTranscript] = useState<string>(
    'Od trzech dni czuję mocne pieczenie w żołądku po jedzeniu, jakby palił mnie ogień. Biorę leki na nadciśnienie, nie mam alergii.'
  );

  // Switch language
  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    // Re-evaluate red flags under new language
    if (verbatimTranscript) {
      setRedFlags(evaluateRedFlags(verbatimTranscript, lang.code));
    }
  };

  // Toggle Doctor / Patient Mode
  const handleToggleDoctorMode = () => {
    const nextDoctorMode = !isDoctorMode;
    setIsDoctorMode(nextDoctorMode);
    if (nextDoctorMode) {
      setCurrentView('DOCTOR_SUMMARY');
    } else {
      setCurrentView('PATIENT_SUMMARY');
    }
  };

  // Start guided triage from intake text
  const handleStartTriage = (initialText: string) => {
    setActiveComplaint(initialText);
    setVerbatimTranscript(initialText);
    const flags = evaluateRedFlags(initialText, currentLanguage.code);
    setRedFlags(flags);
    setCurrentView('TRIAGE_FLOW');
  };

  // Complete guided triage interview
  const handleTriageComplete = async (answers: Record<string, string>) => {
    const compiled = `Chief Complaint: ${answers.complaint || activeComplaint}. Location: ${answers.location || 'Reported'}. Timeline: ${answers.timeline || 'Recent'}. Severity: ${answers.severity || 'Moderate'}. Triggers: ${answers.triggers || 'None'}. Other symptoms: ${answers.associated || 'None'}. Medications/Allergies: ${answers.meds_allergies || 'None reported'}.`;
    setVerbatimTranscript(compiled);

    await processClinicalExtraction(compiled);
    setCurrentView('CONFIRM_BACK');
  };

  // Fast-track analysis directly
  const handleAnalyzeImmediately = async (text: string) => {
    setVerbatimTranscript(text);
    await processClinicalExtraction(text);
    setCurrentView('CONFIRM_BACK');
  };

  // Core extraction & SNOMED CT grounding routine
  const processClinicalExtraction = async (text: string) => {
    const evaluatedRedFlags = evaluateRedFlags(text, currentLanguage.code);
    setRedFlags(evaluatedRedFlags);

    try {
      // 1. Send to structured extraction API
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          languageName: currentLanguage.name,
          languageCode: currentLanguage.code,
        }),
      });

      if (extractRes.ok) {
        const extractedData = await extractRes.json();
        setExtraction(extractedData);
      }

      // 2. Query SNOMED CT / Atlas grounding
      const groundRes = await fetch('/api/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          languageCode: currentLanguage.code,
        }),
      });

      if (groundRes.ok) {
        const groundData = await groundRes.json();
        if (groundData.groundedConcepts && groundData.groundedConcepts.length > 0) {
          setGroundedTerms(groundData.groundedConcepts);
        }
      }
    } catch (e) {
      // Offline fallback
      const localGrounding = groundLayTermsToSNOMED(text, currentLanguage.code);
      setGroundedTerms(localGrounding);
    }
  };

  const handleAddFollowUp = (fu: DoctorFollowUp) => {
    setFollowUps((prev) => [fu, ...prev]);
  };

  return (
    <MobileFrame>
      {/* App Header */}
      <Header
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isDoctorMode={isDoctorMode}
        onToggleDoctorMode={handleToggleDoctorMode}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentView === 'INTAKE' && (
          <PatientIntakeView
            patientLanguage={currentLanguage}
            isRecording={audioRecorder.isRecording}
            recordingTime={audioRecorder.recordingTime}
            audioLevels={audioRecorder.audioLevels}
            audioUrl={audioRecorder.audioUrl}
            liveSpeechTranscript={audioRecorder.liveSpeechTranscript}
            onStartRecording={audioRecorder.startRecording}
            onStopRecording={audioRecorder.stopRecording}
            onStartTriage={handleStartTriage}
            onAnalyzeImmediately={handleAnalyzeImmediately}
            redFlags={redFlags}
          />
        )}

        {currentView === 'TRIAGE_FLOW' && (
          <TriageInterviewView
            patientLanguage={currentLanguage}
            initialComplaint={activeComplaint}
            onComplete={handleTriageComplete}
            onBack={() => setCurrentView('INTAKE')}
          />
        )}

        {currentView === 'CONFIRM_BACK' && (
          <ConfirmBackView
            patientLanguage={currentLanguage}
            extraction={extraction}
            onConfirm={() => setCurrentView(isDoctorMode ? 'DOCTOR_SUMMARY' : 'PATIENT_SUMMARY')}
            onClarify={() => setCurrentView('INTAKE')}
          />
        )}

        {currentView === 'PATIENT_SUMMARY' && (
          <PatientTranslationView
            patientLanguage={currentLanguage}
            extraction={extraction}
            groundedTerms={groundedTerms}
            onOpenDoctorView={() => {
              setIsDoctorMode(true);
              setCurrentView('DOCTOR_SUMMARY');
            }}
            onOpenFollowUp={() => setCurrentView('DOCTOR_FOLLOWUP')}
          />
        )}

        {currentView === 'DOCTOR_SUMMARY' && (
          <DoctorSummaryView
            patientLanguage={currentLanguage}
            extraction={extraction}
            groundedTerms={groundedTerms}
            verbatimTranscript={verbatimTranscript}
            audioUrl={audioRecorder.audioUrl}
            onOpenFollowUp={() => setCurrentView('DOCTOR_FOLLOWUP')}
            onSwitchToPatientView={() => {
              setIsDoctorMode(false);
              setCurrentView('PATIENT_SUMMARY');
            }}
          />
        )}

        {currentView === 'DOCTOR_FOLLOWUP' && (
          <DoctorFollowUpView
            patientLanguage={currentLanguage}
            followUps={followUps}
            onAddFollowUp={handleAddFollowUp}
            onBack={() => setCurrentView(isDoctorMode ? 'DOCTOR_SUMMARY' : 'PATIENT_SUMMARY')}
          />
        )}
      </main>

      {/* Accessible Bottom Mobile Navigation */}
      <nav className="bg-slate-950 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-30">
        <button
          onClick={() => setCurrentView('INTAKE')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentView === 'INTAKE' ? 'text-nhs-lightblue' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>Intake</span>
        </button>

        <button
          onClick={() => setCurrentView('TRIAGE_FLOW')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentView === 'TRIAGE_FLOW' ? 'text-nhs-lightblue' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Triage</span>
        </button>

        <button
          onClick={() => setCurrentView('CONFIRM_BACK')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentView === 'CONFIRM_BACK' ? 'text-nhs-lightblue' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>Verify</span>
        </button>

        <button
          onClick={() => {
            setIsDoctorMode(false);
            setCurrentView('PATIENT_SUMMARY');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentView === 'PATIENT_SUMMARY' && !isDoctorMode
              ? 'text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Patient</span>
        </button>

        <button
          onClick={() => {
            setIsDoctorMode(true);
            setCurrentView('DOCTOR_SUMMARY');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentView === 'DOCTOR_SUMMARY' || isDoctorMode
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-5 h-5" />
          <span>Doctor</span>
        </button>

        <button
          onClick={() => setCurrentView('DOCTOR_FOLLOWUP')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
            currentView === 'DOCTOR_FOLLOWUP' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Follow-up</span>
        </button>
      </nav>
    </MobileFrame>
  );
}
