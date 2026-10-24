import { MongoClient, Db, Collection } from 'mongodb';
import { SNOMED_CATALOG } from '../src/data/snomedData';
import { ConsultationSession, SNOMEDGrounding } from '../src/types';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

const mongoUri = process.env.MONGODB_URI;

export async function connectMongo(): Promise<boolean> {
  if (!mongoUri || mongoUri.trim().length === 0) {
    console.log('MongoDB Atlas: MONGODB_URI not set. Running in local in-memory catalog mode.');
    return false;
  }

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('clinibridge');
    isConnected = true;
    console.log('MongoDB Atlas: Successfully connected to cluster!');

    // Initialize/seed SNOMED concepts collection if needed
    await seedSnomedCatalog();
    return true;
  } catch (err) {
    console.warn('MongoDB Atlas connection failed. Falling back to local mode:', err);
    isConnected = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

async function seedSnomedCatalog() {
  if (!db) return;
  try {
    const coll = db.collection('clinical_concepts');
    const count = await coll.countDocuments();
    if (count === 0) {
      console.log('MongoDB Atlas: Seeding clinical_concepts collection with SNOMED CT entries...');
      await coll.insertMany(SNOMED_CATALOG);
      console.log('MongoDB Atlas: Seeded', SNOMED_CATALOG.length, 'SNOMED concepts.');
    }
  } catch (e) {
    console.warn('Could not seed MongoDB Atlas collection:', e);
  }
}

export async function searchSnomedInMongo(query: string, langCode: string): Promise<SNOMEDGrounding[]> {
  if (!db || !isConnected) return [];

  try {
    const coll = db.collection('clinical_concepts');
    // Attempt text search or regex query
    const results = await coll
      .find({
        $or: [
          { englishLayPhrase: { $regex: query, $options: 'i' } },
          { snomedPreferredTerm: { $regex: query, $options: 'i' } },
          { [`multilingual.${langCode}.layPhrases`]: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(5)
      .toArray();

    return results.map((doc: any) => ({
      id: `atlas-${doc.snomedConceptId}`,
      patientPhrase: query,
      patientLanguage: langCode,
      englishLayPhrase: doc.englishLayPhrase,
      snomedConceptId: doc.snomedConceptId,
      snomedPreferredTerm: doc.snomedPreferredTerm,
      icd10Code: doc.icd10Code,
      clinicalCategory: doc.clinicalCategory,
      plainExplanation: doc.plainEnglishExplanation,
      plainExplanationInPatientLang:
        doc.multilingual?.[langCode]?.plainExplanation || doc.plainEnglishExplanation,
      matchScore: 0.98,
      source: 'mongodb-atlas-vector',
    }));
  } catch (e) {
    console.warn('MongoDB Atlas search error:', e);
    return [];
  }
}

export async function saveConsultationSession(session: ConsultationSession): Promise<boolean> {
  if (!db || !isConnected) return false;
  try {
    const coll = db.collection('consultations');
    await coll.updateOne({ id: session.id }, { $set: session }, { upsert: true });
    return true;
  } catch (e) {
    console.warn('Could not save session to MongoDB:', e);
    return false;
  }
}

export async function getConsultations(): Promise<ConsultationSession[]> {
  if (!db || !isConnected) return [];
  try {
    const coll = db.collection('consultations');
    const docs = await coll.find().sort({ createdAt: -1 }).limit(10).toArray();
    return docs as unknown as ConsultationSession[];
  } catch (e) {
    return [];
  }
}
