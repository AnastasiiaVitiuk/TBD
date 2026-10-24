# CliniBridge | NHS Multilingual Clinical Triage & SNOMED Grounding Mobile App
> Encode London Hackathon 2026 • React Native & Expo

An AI-powered mobile app built with **Expo (React Native)** for the UK National Health Service (NHS) that empowers patients struggling with language barriers to accurately convey their symptoms, undergo clinical triage in their native language, and ground their descriptions into official SNOMED CT terminology.

---

## 📱 Two Accounts & Dual Role Experience

The app features two dedicated account experiences designed for the real clinical consultation visit:

1. **👤 Patient Account (Clean, Intuitive UI/UX)**
   - **Language Selection**: Supports Polish, Spanish, Ukrainian, Punjabi, Urdu, Arabic, Romanian, Cantonese, Portuguese, Bengali, and English with native greetings.
   - **1-Tap Voice Recording**: High-visibility microphone button (`expo-av`) with real-time recording timer and audio playback.
   - **Emergency 999 Banner**: Real-time red flag interception for acute cardiac, respiratory, or stroke symptoms with 1-tap 999 dialing.
   - **Send Voice & Translation**: Transmits the patient's native audio recording and clinically extracted English translation directly to the doctor's visit dashboard.
   - **Doctor Follow-ups & Audio**: Receives follow-up questions from the clinician during the visit, simplified into plain language, translated into the patient's mother tongue, with a **🔊 Listen** button powered by `expo-speech`.

2. **🩺 Doctor Account (Clinical Software Integration)**
   - **Active Visit Dashboard**: Live patient demographics (Name, NHS ID, primary language, time).
   - **Voice Intake Audio Player**: Clinician listens directly to the patient's authentic recorded voice intake.
   - **Bilingual Verbatim & Translation**: Patient's original words side-by-side with verified clinical English translation.
   - **SNOMED CT & ICD-10 Grounding**: Exact mapping of lay terms to NHS TRUD clinical concepts with confidence scores.
   - **Structured SBAR Summary**: Chief complaint, history of present illness (HPI), symptom breakdown (onset, duration, severity, location), medications, allergies, and ambiguities.
   - **Interactive Follow-up Dispatcher**: Doctor can select 1-click clinical presets or type clinical questions; AI simplifies medical jargon and translates directly into the patient's language on their phone.

---

## 🛠️ Tech Stack

- **Mobile Framework:** React Native 0.88 & Expo SDK 58
- **Audio & Speech:** `expo-av` (native recording & playback) & `expo-speech` (multilingual TTS)
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Clinical Engine & Grounding:** Local NHS TRUD SNOMED CT Catalog + MongoDB Atlas Vector Search
- **AI Models:** Google Gemini 3.8 Live / Gemini 4-Argon / Flash via `@google/genai` (with deterministic clinical fallback engine)
- **Backend API:** Express.js, TypeScript (`tsx`)

---

## 🚀 Running the App with Expo

You can run and test the app right away without installing anything to your machine globally:

### 1. Start the Expo App
```bash
npx expo start
```
From the interactive terminal:
- Press **`i`** to open in the **iOS Simulator**
- Press **`a`** to open in the **Android Simulator**
- Press **`w`** to open in the **Web Browser**

### 2. (Optional) Run the Backend Server
```bash
npm run server
```
Or run both concurrently:
```bash
npm run dev
```

### 3. Testing the Flow in Simulator
1. In the top bar, select **Patient App**.
2. Pick a language (e.g., 🇵🇱 Polski) and tap the microphone to record your voice or select a symptom chip.
3. Tap **"Send Voice & Translation to Doctor"**.
4. In the top bar, switch to **Doctor Software**.
5. Listen to the patient's voice intake, review the English translation and SNOMED CT codes.
6. Select or type a follow-up question and tap **"Translate & Send to Patient App"**.
7. Switch back to **Patient App** and open tab **"3. Follow-ups"** to see and listen to the doctor's translated question!
