# CliniBridge: Voice Handling & Clinical Interpretation Architecture
> **Hackathon 2026 Reference Document** • Voice Pipeline, AI Models, Clinical Grounding & Data Flow

---

## 1. Executive Summary

CliniBridge bridges the communication gap between non-English speaking NHS patients and healthcare clinicians. Rather than acting as a simple generic word translator (e.g., Google Translate), CliniBridge functions as an **intelligent clinical intake and interpretation pipeline**:

1. **Patient Speaks in Native Language**: Captures patient voice and transcripts in their mother tongue.
2. **Deterministic Safety Pre-Screening**: Immediate rule-based red flag check (999 emergency diversion).
3. **Structured Clinical Extraction**: AI transforms unstructured lay voice transcripts into an NHS SBAR clinical format.
4. **SNOMED CT Grounding**: MongoDB Atlas Vector & Hybrid Search maps multilingual lay expressions to official clinical concept IDs.
5. **Doctor Follow-Up Loop**: Clinician asks medical questions; AI strips jargon, translates into the patient's language, and provides voice readout.

---

## 2. End-to-End Workflow Diagram

```
[ Patient Voice (Any Language) ]
             │
             ▼
   [ Voice Capture & Audio ] ─── SafeAudioService (expo-speech / expo-audio / web audio)
             │
             ▼
[ Verbatim Transcript Generated ] ─── Gemini 3.5 Transcribe Live / Local Speech Recognition
             │
             ├──► [ Rule-Based Safety Check ] ─── evaluateRedFlags() ──► [ Call 999 Alert if Acute ]
             │
             ▼
[ Structured Clinical Extraction ] ─── Gemini 4-Argon / Gemini 3.8 Flash (Strict JSON Schema)
             │
             ▼
[ Lay-to-Clinical Grounding ] ─── MongoDB Atlas Vector Search + Voyage AI Embeddings
             │                     └──► SNOMED CT Concept ID (e.g., 25376007 Dyspepsia)
             │                     └──► ICD-10 Code (e.g., K30)
             │
             ▼
 ┌────────────────────────────────────────────────────────┐
 │                   Dual Outputs                         │
 ├────────────────────────────┬───────────────────────────┤
 │ 👤 Patient View            │ 🩺 Doctor View (English)  │
 │ - Original words           │ - Playable Patient Audio  │
 │ - Plain explanation        │ - SBAR Clinical Summary   │
 │ - SNOMED lay explanation   │ - SNOMED & ICD-10 Codes   │
 └────────────────────────────┴───────────────────────────┘
             │
             ▼
[ Doctor Follow-Up Mode ] ─── Clinician types/speaks clinical question
             │
             ▼
[ Jargon Simplification & Translation ] ─── Gemini 3.8 / 3.5 Live Translate
             │
             ▼
[ Patient App Audio Follow-Up ] ─── Multilingual Speech TTS (expo-speech / Gemini Flash TTS)
```

---

## 3. Voice Handling Layer

### A. Mobile Client Audio Capture (`SafeAudioService`)
- **Location**: [`src/services/safeAudio.ts`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/src/services/safeAudio.ts) & [`src/components/AudioPlayerWidget.tsx`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/src/components/AudioPlayerWidget.tsx)
- **Zero-Crash Architecture**: Uses a resilient abstraction that provides native recording when available, while guaranteeing zero-crash execution inside Expo Go, simulators, and offline environments.
- **Visual Feedback**: Real-time recording duration timer (`00:03`), animated sine-wave audio bars, and play/pause audio playback widget.

### B. Speech-to-Text & Transcription Model
- **Primary Cloud Model**: **`gemini-3.5-transcribe-live`** and **`gemini-3.8-live`**
  - Handles real-time streaming speech recognition in over 10+ languages (Polish, Spanish, Ukrainian, Arabic, Punjabi, Urdu, Romanian, Cantonese, Portuguese, Bengali, English).
  - Preserves verbatim dialect and idioms rather than forcing premature translation.
- **Language Auto-Detection & Override**:
  - Auto-identifies language dialect with manual override via [`LanguageModal.tsx`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/src/components/LanguageModal.tsx).
- **Fallback Simulation Engine**: Pre-seeded authentic patient voice recordings and deterministic language inputs for reliable testing on any machine.

### C. Text-to-Speech (TTS) Readout
- **Models**: **`expo-speech`** (on-device OS TTS) and **`gemini-3.8-flash-tts`**.
- **Role**: Speaks the doctor's translated follow-up questions aloud in the patient's native tongue for patients who struggle with literacy or visual impairments.

---

## 4. Interpretation & Structured Clinical Extraction

### A. The Core Extraction Engine
- **Location**: [`server/gemini.ts`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/server/gemini.ts) (`extractClinicalData()`) and [`src/services/clinicalService.ts`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/src/services/clinicalService.ts)
- **Model**: **`gemini-4-argon`** (fallback to **`gemini-3.8-flash`** / **`gemini-2.5-flash`**)

### B. Strict JSON Schema Enforcement
The model is constrained via strict JSON schema formatting:

```typescript
{
  chiefComplaint: string;               // e.g., "Epigastric pain / Dyspepsia"
  chiefComplaintInPatientLang: string;  // e.g., "Pieczenie w żołądku po jedzeniu"
  historyOfPresentIllness: string;     // Chronological narrative of condition
  symptoms: [
    {
      symptom: string;                 // Standardised symptom name
      symptomInPatientLang: string;    // Patient's verbatim expression
      onset: string;                   // Temporal onset (e.g., "3 days ago")
      duration: string;                // Duration of episodes
      severity: number;                // 1 to 10 scale
      location: string;                // Body anatomical region
      character: string;               // Burning, throbbing, sharp, etc.
      aggravating: string;             // Triggers (e.g., "Worse after meals")
      relieving: string;               // What alleviates symptoms
    }
  ],
  medications: string[];               // Current medications or ["Not reported"]
  allergies: string[];                 // Drug allergies or ["Not reported"]
  redFlags: {
    detected: boolean;
    severityLevel: "NONE" | "URGENT" | "EMERGENCY_999";
    symptomsTriggered: string[];
    recommendation: string;
    recommendationInPatientLang: string;
  },
  ambiguities: string[];               // Unclear details requiring GP follow-up
  confidenceScore: number;             // Model certainty score (0.0 - 1.0)
}
```

### C. The Zero-Hallucination Guardrail
- Under NHS clinical governance, AI must never guess unmentioned medications or allergies.
- Any unstated field is explicitly mandated as `"Not reported"`.

---

## 5. Lay-to-Clinical Grounding with SNOMED CT & MongoDB Atlas

### A. The Grounding Engine
- **Location**: [`server/mongo.ts`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/server/mongo.ts) & [`src/data/snomedData.ts`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/src/data/snomedData.ts)
- **Embedding Model**: **Voyage AI Medical Embeddings** (`voyage-medical-2` / MongoDB Automated Embedding)
- **Database**: **MongoDB Atlas Vector Search + Hybrid Search**

### B. Why This Beats Standard Translation
Standard translators translate "burning stomach" or Polish *"pieczenie w żołądku"* into literal words. CliniBridge grounds it directly into:
- **SNOMED CT Concept ID**: `25376007` (Preferred Term: *Dyspepsia / Epigastric pain*)
- **ICD-10 Diagnostic Code**: `K30`
- **Clinical Category**: *Symptom*
- **Traceable Clinical Match Score**: e.g., `0.98` (98% match)
- **Plain-Language Explanation**: Generates an accessible translation in the patient's language explaining what the medical term means.

---

## 6. Doctor Follow-Up & Clinical Jargon Simplifier

### A. Jargon Translation Model
- **Location**: [`server/gemini.ts`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/server/gemini.ts) (`translateDoctorJargon()`)
- **Model**: **`gemini-3.8-flash`** / **`gemini-3.5-live-translate-preview`**

### B. How It Works During the Visit
1. **Doctor Inquires**: Clinician writes or selects a clinical question:
   > *"Does the epigastric pain radiate posteriorly to the thoracic back?"*
2. **Step 1 — Jargon Stripping**: Simplifies into 8th-grade compassionate English:
   > *"Does the pain spread or shoot to your back or anywhere else?"*
3. **Step 2 — Multilingual Translation**: Translates accurately into the patient's native tongue (e.g. Polish):
   > *"Czy ten ból promieniuje lub przechodzi na plecy albo w inne miejsce?"*
4. **Step 3 — Smart Patient Prompts**: Generates 3 1-tap quick replies for the patient:
   - *"Nie, ból jest tylko w żołądku"* (No, only in my stomach)
   - *"Tak, promieniuje w stronę łopatek"* (Yes, toward my shoulder blades)
   - *"Czasami, gdy leżę"* (Only when lying down)
5. **Step 4 — Real-Time Delivery**: Pushed directly to the patient's phone screen with an instant **🔊 Listen** button.

---

## 7. Safety Guardrails & Emergency 999 Interception

1. **Rule-Based Pre-Filter**:
   - Runs deterministic keyword and pattern detection before LLM processing for emergency red flags (chest tightness, stroke symptoms, acute dyspnea, heavy bleeding).
2. **Instant Bilingual Alert**:
   - Shows [`RedFlagBanner.tsx`](file:///Users/anastasiiavitiuk/Downloads/Business/TBD/src/components/RedFlagBanner.tsx) with high-contrast red warning.
   - 1-tap **Call 999** or **NHS 111** dialing.
3. **Clinician Disclaimer**:
   - Every doctor summary includes the NHS disclaimer: *"AI-generated clinical summary, to be checked and validated by a registered healthcare professional."*

---

## 8. Summary Table of Models & Roles

| Task / Feature | Primary Model | Backup / Local Fallback |
| :--- | :--- | :--- |
| **Multilingual Voice Intake** | `gemini-3.8-live` | Safe Audio Recording (`SafeAudioService`) |
| **Speech Transcription** | `gemini-3.5-transcribe-live` | Local Speech Recognition / Seeded Transcripts |
| **Structured Clinical Extraction** | `gemini-4-argon` / `gemini-3.8-flash` | Deterministic Rule-Based Clinical Parser |
| **Vector Grounding (SNOMED CT)** | Voyage AI (`voyage-medical-2`) on MongoDB Atlas | NHS TRUD In-Memory SNOMED CT Catalog |
| **Jargon Simplification** | `gemini-3.8-flash` | Clinical regex & terminology simplifier |
| **Bilingual Follow-Up Translation** | `gemini-3.5-live-translate-preview` | Pre-mapped bilingual clinical question catalog |
| **Voice Playback / TTS** | `expo-speech` / `gemini-3.8-flash-tts` | Native Device Speech Synthesizer |
