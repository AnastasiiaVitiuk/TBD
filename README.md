# CliniBridge | NHS Multilingual Clinical Triage & SNOMED Grounding Mobile App
> Encode London Hackathon 2026

An AI-powered mobile app built for the UK National Health Service (NHS) that empowers patients struggling with language barriers to accurately convey their symptoms, undergo guided clinical triage in their native language, and ground their descriptions into official SNOMED CT terminology.

---

## 🎯 The Problem & Our Solution

- **The Problem:** Many patients in the UK speak English as a second language and struggle to describe acute and chronic symptoms to healthcare providers. Generic tools like Google Translate translate literal words but fail to capture clinical nuances, symptom chronologies, and red flags.
- **Our Solution:** A guided conversational clinical interview that extracts structured clinical data, grounds lay phrasing in SNOMED CT concepts via MongoDB Atlas, and generates tailored Doctor and Patient views with built-in safety guardrails.

---

## 🚀 Core Features (Per Hackathon Specification)

1. **Step 1: Multilingual Voice Intake**
   - Tap one button and speak in any language (Polish, Spanish, Ukrainian, Punjabi, Urdu, Arabic, Cantonese, Romanian, and more).
   - Conversational triage nurse interview asking follow-up questions (Location, Timeline, Severity 1-10, Triggers, Associated Symptoms, Medications/Allergies).
   - Verbatim audio capture and live speech transcription.
   - Language selector with auto-detect and manual override.

2. **Safety Guardrails & Red-Flag Interception**
   - Instant detection of emergency red flags (cardiac arrest/acute coronary syndrome, respiratory distress, stroke FAST protocol, acute internal bleeding).
   - Immediate high-priority bilingual alert instructing the patient to **Call 999** or go to the nearest A&E, with one-tap 999 dialing.
   - Mandatory clinician review label: *"AI-generated clinical summary, to be checked by a clinician"*.

3. **Step 2: Structured Clinical Extraction (Gemini 4-Argon / Flash)**
   - Strict JSON Schema enforcing Chief Complaint, History of Present Illness (HPI), Symptoms list with severity (1-10), anatomical locations, character, onset, and duration.
   - **Zero-hallucination constraint**: unstated medications and allergies are strictly marked as `"Not reported"`.
   - Ambiguities and clarification flags highlighted for the clinician.

4. **Step 3: Lay-to-Clinical Grounding with MongoDB Atlas & SNOMED CT**
   - Maps patient lay expressions (e.g. *"burning in stomach after eating"*, *"pieczenie w żołądku"*) into canonical SNOMED CT concept IDs (e.g. `25376007` Dyspepsia / Epigastric pain).
   - Prepared for MongoDB Atlas Vector Search + Hybrid search index.

5. **Step 4: Dual Outputs & Confirm-Back Step**
   - **Patient View:** Side-by-side table: *What you said* → *Official SNOMED clinical term* → *Plain language explanation in your native language*.
   - **Doctor View (English):** Standardised NHS SBAR clinical summary, audio playback, verbatim transcript, and one-click export to Electronic Patient Records (EPR).
   - **Confirm-Back Step:** Spoken audio readout in patient's native tongue (*"Did we get this right?"*) to verify accuracy before clinical review.

6. **Step 5: Doctor Follow-up Mode**
   - Doctor types/records follow-up questions in medical jargon.
   - Translates into plain English and the patient's native tongue.
   - Generates smart prompts for the patient (*"What you might want to ask your doctor"*).

---

## 🛠️ Tech Stack & Tools

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Web Speech API, Web Audio API, Mobile Phone Frame Simulator
- **Backend API:** Express.js, TypeScript (`tsx`)
- **AI Models:** Google Gemini 3.8 Live / Gemini 4-Argon / Gemini Flash via `@google/genai`
- **Database & Search:** MongoDB Atlas (`clinical_concepts`, `consultations`, Atlas Vector Search)

---

## ⚙️ Setup & Running

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and supply your API keys:
```bash
cp .env.example .env
```
Add:
```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5001
```

*(Note: CliniBridge also includes a robust local fallback engine so you can test all features and workflows immediately even before plugging in cloud keys!)*

### 2. Start the Development Server
```bash
npm run dev
```
- App UI: `http://localhost:3000`
- API Backend: `http://localhost:5001`
