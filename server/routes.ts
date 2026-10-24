import { Router } from 'express';
import { extractClinicalData, translateDoctorJargon, isGeminiConnected } from './gemini';
import { isMongoConnected, searchSnomedInMongo, saveConsultationSession, getConsultations } from './mongo';
import { groundLayTermsToSNOMED, evaluateRedFlags } from '../src/data/snomedData';
import { ConsultationSession } from '../src/types';

export const apiRouter = Router();

// In-memory consultations cache for offline/instant mode
const memoryConsultations: ConsultationSession[] = [];

// Service health & integrations status
apiRouter.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      gemini: {
        connected: isGeminiConnected(),
        model: 'gemini-2.5-flash / gemini-3.8-live / gemini-4-argon',
      },
      mongodbAtlas: {
        connected: isMongoConnected(),
        features: ['Atlas Vector Search', 'Atlas Search Text', 'Hybrid Search', 'Voyage AI Embeddings'],
      },
    },
  });
});

// Step 2: Structured Clinical Extraction
apiRouter.post('/extract', async (req, res) => {
  try {
    const { transcript, languageName, languageCode } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const extraction = await extractClinicalData(
      transcript,
      languageName || 'Polish',
      languageCode || 'pl'
    );

    res.json(extraction);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Clinical extraction failed' });
  }
});

// Step 3: Grounding lay terms into SNOMED CT
apiRouter.post('/grounding', async (req, res) => {
  try {
    const { text, languageCode } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text query is required' });
    }

    // Try MongoDB Atlas first if connected
    let results = await searchSnomedInMongo(text, languageCode || 'en');

    // If no results or Atlas not connected, use the local SNOMED catalog
    if (!results || results.length === 0) {
      results = groundLayTermsToSNOMED(text, languageCode || 'en');
    }

    res.json({
      query: text,
      languageCode,
      groundedConcepts: results,
      totalMatches: results.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Grounding failed' });
  }
});

// Step 5: Doctor follow-up jargon translation
apiRouter.post('/simplify-jargon', async (req, res) => {
  try {
    const { doctorQuestion, targetLangName, targetLangCode } = req.body;
    if (!doctorQuestion) {
      return res.status(400).json({ error: 'Doctor question is required' });
    }

    const simplified = await translateDoctorJargon(
      doctorQuestion,
      targetLangName || 'Polish',
      targetLangCode || 'pl'
    );

    res.json(simplified);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Jargon translation failed' });
  }
});

// Save consultation
apiRouter.post('/consultations', async (req, res) => {
  try {
    const session = req.body as ConsultationSession;
    if (!session || !session.id) {
      return res.status(400).json({ error: 'Valid consultation session required' });
    }

    // Save in memory
    const existingIdx = memoryConsultations.findIndex((s) => s.id === session.id);
    if (existingIdx >= 0) {
      memoryConsultations[existingIdx] = session;
    } else {
      memoryConsultations.unshift(session);
    }

    // Save to Atlas if available
    await saveConsultationSession(session);

    res.json({ success: true, id: session.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent consultations
apiRouter.get('/consultations', async (req, res) => {
  try {
    const mongoDocs = await getConsultations();
    if (mongoDocs && mongoDocs.length > 0) {
      return res.json(mongoDocs);
    }
    res.json(memoryConsultations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
