/**
 * Manual lender sync script.
 * Usage: npm run sync:lenders
 *
 * Pulls all lenders from Monday.com Lender Profiles board
 * and upserts them into the local Postgres database.
 */
import 'dotenv/config';
import { syncLenders } from '../cron/lenderSync';

async function main() {
  console.log('Starting manual lender sync...');
  const result = await syncLenders();
  console.log(`Done! ${result.synced} lenders synced, ${result.errors} errors.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
