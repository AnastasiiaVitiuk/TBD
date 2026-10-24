import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes';
import { connectMongo } from './mongo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Start server and initialize Mongo
app.listen(PORT, async () => {
  console.log(`CliniBridge API Server running on http://localhost:${PORT}`);
  await connectMongo();
});
