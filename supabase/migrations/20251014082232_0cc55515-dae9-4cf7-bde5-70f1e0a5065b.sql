-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily message reset at midnight UTC
SELECT cron.schedule(
  'reset-daily-messages-midnight',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  UPDATE public.profiles
  SET messages_today = 0,
      last_message_date = CURRENT_DATE
  WHERE last_message_date < CURRENT_DATE;
  $$
);