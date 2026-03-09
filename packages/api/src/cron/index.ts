import cron from 'node-cron';
import { syncLenders } from './lenderSync';
import { postLeadSummary } from './leadSummary';

export function startCronJobs() {
  // Sync lenders from Monday.com every night at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Running nightly lender sync...');
    try {
      const result = await syncLenders();
      console.log(`[Cron] Lender sync complete: ${result.synced} synced, ${result.errors} errors`);
    } catch (err) {
      console.error('[Cron] Lender sync failed:', err);
    }
  });

  console.log('[Cron] Scheduled: Lender sync at 2:00 AM daily');

  // Daily lead summary at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily lead summary...');
    try {
      await postLeadSummary();
    } catch (err) {
      console.error('[Cron] Lead summary failed:', err);
    }
  });

  console.log('[Cron] Scheduled: Lead summary at 8:00 AM daily');
}
