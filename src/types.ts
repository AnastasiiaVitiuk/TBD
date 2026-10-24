export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  greeting: string;
}

export interface SymptomItem {
  symptom: string;
  symptomInPatientLang: string;
  onset: string;
  duration: string;
  severity: number; // 1 to 10
  location: string;
  character?: string;
  aggravating?: string;
  relieving?: string;
}

export interface RedFlagAssessment {
  detected: boolean;
  severityLevel: 'NONE' | 'URGENT' | 'EMERGENCY_999';
  symptomsTriggered: string[];
  recommendation: string;
  recommendationInPatientLang: string;
}

export interface StructuredExtraction {
  chiefComplaint: string;
  chiefComplaintInPatientLang: string;
  historyOfPresentIllness: string;
  symptoms: SymptomItem[];
  medications: string[] | string; // or "Not reported"
  allergies: string[] | string; // or "Not reported"
  redFlags: RedFlagAssessment;
  ambiguities: string[];
  confidenceScore: number;
}

export interface SNOMEDGrounding {
  id: string;
  patientPhrase: string;
  patientLanguage: string;
  englishLayPhrase: string;
  snomedConceptId: string;
  snomedPreferredTerm: string;
  icd10Code?: string;
  clinicalCategory: 'Symptom' | 'Finding' | 'Disorder' | 'Body Structure';
  plainExplanation: string;
  plainExplanationInPatientLang: string;
  matchScore: number; // 0.0 - 1.0
  source: 'mongodb-atlas-vector' | 'snomed-ct-catalog';
}

export interface DoctorFollowUp {
  id: string;
  doctorQuestionRaw: string;
  simplifiedEnglish: string;
  translatedPatientLang: string;
  patientSuggestedQuestions: string[];
  timestamp: string;
}

export interface ConsultationSession {
  id: string;
  createdAt: string;
  patientLanguage: SupportedLanguage;
  rawAudioBlob?: Blob;
  rawAudioUrl?: string;
  verbatimTranscript: string;
  englishTranscript: string;
  structuredExtraction: StructuredExtraction;
  groundedTerms: SNOMEDGrounding[];
  confirmedByPatient: boolean;
  doctorReviewed: boolean;
  doctorNotes?: string;
  followUps: DoctorFollowUp[];
}

export type AppView =
  | 'INTAKE'          // Patient taps to talk or pick guided questions
  | 'TRIAGE_FLOW'     // Step-by-step nurse interview
  | 'CONFIRM_BACK'    // Audio readout and confirmation
  | 'PATIENT_SUMMARY' // Patient view: side-by-side lay -> SNOMED -> plain translation
  | 'DOCTOR_SUMMARY'  // Doctor view: SBAR summary, clinical codes, audio playback
  | 'DOCTOR_FOLLOWUP'; // Follow-up mode with jargon simplification
