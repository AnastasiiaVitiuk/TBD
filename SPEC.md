HACKATHON PROJECT 2026

Idea: many people in the UK come form other countries and they struggle when it comes to describing their sumptoms and health state due to language barrier. Google translator is not ideal and doesn't work properly. we want to find a solution.

Solution: an app that a patient is using when they have some health concerns, symptoms, problems, etc, record a voice and answer some follow-up questions to develop a file and audio for a clinician to listen. the feature to highlight here is that it shoudl be able to using SNOMED to tranlate they native language and simple wordin to the scientific-friendly terms in brackets nad make pidction before the doctor even reason through their probles. then a doscor listens, asks a follow-up questiosn recording their scienetific questions, and AI translate to patient's language and simple wording. 

The main point is to split it into a guided interview and a structured extraction, rather than a plain “record and translate” box. That’s where we beat Google Translate: it translates words, but we’re building something that understands what a clinician needs to know.

Step 1: Voice intake in the patient’s own language

The patient taps one button and talks. Use gemini-3.8-live as a conversational interviewer. It speaks and listens in the patient’s language and asks simple follow-ups the way a triage nurse would: where does it hurt, when did it start, how bad is it from 1 to 10, does anything make it better or worse, any other symptoms, any medication or allergies.
Use gemini-3.5-transcribe-live to keep a verbatim transcript in the original language. Keep this transcript, because the doctor and patient can always go back to the exact words.
Add a language auto-detect with a manual override, since accents and dialects will trip detection.

Step 2: Structured clinical extraction

Send the transcript to gemini-4-argon with a strict JSON schema: chief complaint, history of present illness, symptoms (each with onset, duration, severity, location), medications, allergies, red flags, and a confidence/ambiguity field for anything the patient was vague about.
Never let it invent. Anything not said should be “not reported”, not guessed.

Step 3: Grounding lay terms in clinical terms with MongoDB Atlas
This is the part that scores points with the hackathon’s MongoDB requirement and is genuinely useful:

Build a collection of clinical concepts (a subset of SNOMED CT or ICD-10, plus common lay-phrase mappings in several languages). SNOMED is available free for UK use via NHS TRUD, but check the licence terms.
Embed them with Voyage AI and use Atlas Vector Search so “my stomach is burning” maps to something like epigastric pain / dyspepsia, even when the wording is unusual.
Use Hybrid Search (vector plus Atlas Search text) so exact medical terms and drug names still match precisely.
This stops the LLM from freelancing clinical terms and makes every mapping traceable to a real concept.

Step 4: The three outputs

Doctor view (English): a concise clinical summary.
Patient view: side-by-side table of what you said → clinical term → plain explanation in your language.
Confirm-back step: read the summary back to the patient in their language (“Did we get this right?”). This catches errors before the doctor ever sees it.

Step 5: Doctor follow-up mode

Record or type the doctor’s questions, using transcription again.
Detect jargon and translate it into simple language the patient understands, using gemini-3.5-live-translate-preview.
Generate “what you might want to ask” prompts, such as “ask what this test is for” or “ask how long recovery takes”.
Store follow-ups in Atlas against the patient’s visit so they can replay them later.

Safety guardrails

The app must not diagnose or give treatment advice. It summarises and translates, and the doctor decides.
Add red-flag detection (chest pain, trouble breathing, stroke symptoms, severe bleeding) that immediately tells the patient to call 999 or go to A&E, in their language, regardless of the rest of the flow.
Show a clear “AI-generated, to be checked by a clinician” label on the doctor summary.

Tools we can to use: 
Lead reasoning, coding, 3D/WebGPU and orchestration: gemini-4-argon
Autonomous sandbox execution: antigravity-preview-09-2026 (Antigravity Managed Agent)
Fast parallel subagents and routing: gemini-3.8-flash, gemini-3.5-flash-lite
Deep web research with citations: deep-research-preview-04-2026
Real-time voice, camera, transcription and translation: gemini-3.8-live, gemini-3.8-live-extended-thinking, gemini-3.5-transcribe-live, gemini-3.5-live-translate-preview, gemini-3.8-flash-tts
Images, video with sound and music: gemini-nano-banana-2.1, gemini-omni-1.1-flash, lyria-3.5
Open models, cloud or on-device: gemma-4-31b-it (plus the local E2B and E4B sizes)

MongoDB Atlas features:
Atlas Search for text search
Atlas Vector Search
Hybrid Search
Automated Embedding
Atlas Stream Processing
Voyage AI by MongoDB models (some of these are already part of Automated Embedding)