import { query } from '../src/lib/database';

async function spawnRepeatedTasks(): Promise<void> {
  await query('SELECT procedures.spawn_repeated_tasks()');
}

async function markOverdueAndReturnToAssigner(): Promise<void> {
  await query('SELECT procedures.mark_overdue_and_return_to_assigner()');
}

async function purgeExpiredPhotos(): Promise<void> {
  // Obtain retention setting (months) from settings table
  const res = await query("SELECT value FROM settings WHERE key = 'photoRetentionMonths'");
  const months = parseInt(res.rows?.[0]?.value, 10) || 0;

  if (months > 0) {
    await query(
      `DELETE FROM attachments
       WHERE type = 'photo'
         AND created_at < NOW() - ($1 * INTERVAL '1 month')`,
      [months]
    );
  }
}

async function recalcLeaderboards(): Promise<void> {
  await query('SELECT procedures.recalc_leaderboards()');
}

export function startCron(): void {
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  // Hourly tasks
  setInterval(spawnRepeatedTasks, hour);
  setInterval(markOverdueAndReturnToAssigner, hour);

  // Daily tasks
  setInterval(purgeExpiredPhotos, day);
  setInterval(recalcLeaderboards, day);
}

// Start cron jobs if run directly
if (require.main === module) {
  startCron();
}
