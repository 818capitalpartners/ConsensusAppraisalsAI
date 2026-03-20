import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dealsRouter } from './routes/deals';
import { healthRouter } from './routes/health';
import { contactsRouter } from './routes/contacts';
import { aiRouter } from './routes/ai';
import { appraisalsRouter } from './routes/appraisals';
import { startCronJobs } from './cron';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/appraisals', appraisalsRouter);

// Start cron jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 818 Capital API running on port ${PORT}`);
});

export default app;
