-- Backfill existing user profile
INSERT INTO public.profiles (user_id, full_name)
VALUES ('03aebbf2-f9e6-4fbb-9d91-93264b00a754', 'User')
ON CONFLICT (user_id) DO NOTHING;

-- Backfill existing user timeline
INSERT INTO public.timeline (user_id, car_position, completed_tasks)
VALUES ('03aebbf2-f9e6-4fbb-9d91-93264b00a754', 0, 0)
ON CONFLICT (user_id) DO NOTHING;