-- ============================================================================
-- TOP10 CRON SCHEDULER & RANKING SCORE RECOMPUTATION (pg_cron + pg_net)
-- ============================================================================

-- 1. Enable required extensions for scheduled HTTP invocations
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Stored Procedure: Recompute Ranking Scores
-- Formula: score = 0.4 * popularity + 0.3 * recency + 0.2 * growth + 0.1 * manual_boost
CREATE OR REPLACE FUNCTION recompute_tool_scores_and_ranks()
RETURNS void AS $$
DECLARE
  r_list RECORD;
BEGIN
  -- Update tool scores based on upvotes, last_checked recency, and activity
  UPDATE tools
  SET score = ROUND(
    LEAST(100.0, GREATEST(40.0,
      -- Popularity (0-100 normalized by upvotes, capped at 4000)
      (0.40 * LEAST(100.0, (upvotes::numeric / 40.0) * 100.0)) +
      -- Recency (days since last_checked, decaying smoothly)
      (0.30 * GREATEST(50.0, 100.0 - (EXTRACT(DAY FROM (now() - last_checked)) * 2.0))) +
      -- Growth factor
      (0.20 * 92.0) +
      -- Manual boost baseline
      (0.10 * 90.0)
    )), 1
  )
  WHERE status = 'approved';

  -- Re-rank list_items based on tool scores for each active list
  FOR r_list IN SELECT id FROM lists LOOP
    WITH ranked AS (
      SELECT
        li.list_id,
        li.tool_id,
        ROW_NUMBER() OVER (ORDER BY t.score DESC, t.upvotes DESC) as new_rank
      FROM list_items li
      JOIN tools t ON li.tool_id = t.id
      WHERE li.list_id = r_list.id AND t.status = 'approved'
    )
    UPDATE list_items li
    SET rank = ranked.new_rank
    FROM ranked
    WHERE li.list_id = ranked.list_id AND li.tool_id = ranked.tool_id AND ranked.new_rank <= 10;
  END LOOP;

  -- Update lists updated_at timestamp
  UPDATE lists SET updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Stored Procedure: Trigger Edge Function fetch-tools via pg_net
CREATE OR REPLACE FUNCTION trigger_fetch_tools_edge_function()
RETURNS void AS $$
DECLARE
  project_ref TEXT := current_setting('app.settings.project_ref', true);
  anon_key TEXT := current_setting('app.settings.anon_key', true);
BEGIN
  PERFORM net.http_post(
    url := 'https://' || COALESCE(project_ref, 'your-project-ref') || '.supabase.co/functions/v1/fetch-tools',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(anon_key, '')
    ),
    body := jsonb_build_object('mode', 'daily_crawl')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Stored Procedure: Weekly Health Check
CREATE OR REPLACE FUNCTION trigger_weekly_health_check()
RETURNS void AS $$
DECLARE
  project_ref TEXT := current_setting('app.settings.project_ref', true);
  anon_key TEXT := current_setting('app.settings.anon_key', true);
BEGIN
  PERFORM net.http_post(
    url := 'https://' || COALESCE(project_ref, 'your-project-ref') || '.supabase.co/functions/v1/fetch-tools',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(anon_key, '')
    ),
    body := jsonb_build_object('mode', 'health_check')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEDULED CRON JOBS
-- ============================================================================

-- Daily at 02:00 AM UTC: Run autonomous tool discovery
SELECT cron.schedule(
  'daily-fetch-tools',
  '0 2 * * *',
  'SELECT trigger_fetch_tools_edge_function();'
);

-- Every 6 hours: Recompute scores and update rankings
SELECT cron.schedule(
  'recompute-ranks-every-6-hours',
  '0 */6 * * *',
  'SELECT recompute_tool_scores_and_ranks();'
);

-- Weekly on Sunday at 04:00 AM UTC: Run URL health check
SELECT cron.schedule(
  'weekly-url-health-check',
  '0 4 * * 0',
  'SELECT trigger_weekly_health_check();'
);
