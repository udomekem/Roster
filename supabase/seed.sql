-- ============================================================
-- Development Seed Data
-- Run this AFTER migrations and AFTER creating your first account.
-- ============================================================
-- To use this seed:
-- 1. Run migrations (00001_initial_schema.sql)
-- 2. Register at /register and complete onboarding (creates your org)
-- 3. Run this seed in Supabase SQL Editor - it adds houses and
--    participants to your organisation.
-- ============================================================

DO $$
DECLARE
  org_id UUID;
  house_ids UUID[];
BEGIN
  SELECT id INTO org_id FROM organisations LIMIT 1;

  IF org_id IS NULL THEN
    RAISE NOTICE 'No organisation found. Complete onboarding first, then run this seed.';
    RETURN;
  END IF;

  -- Insert sample houses
  INSERT INTO houses (organisation_id, name, address, phone, capacity, notes, is_active)
  VALUES
    (org_id, 'Elm Street House', '42 Elm Street, Sydney NSW 2000', '02 9123 4567', 4, 'Main supported accommodation', true),
    (org_id, 'Oak Avenue Residence', '15 Oak Avenue, Parramatta NSW 2150', '02 9891 2345', 6, 'Larger house with garden', true);

  -- Get the 2 house IDs we just inserted (newest first)
  SELECT ARRAY_AGG(id ORDER BY created_at DESC) INTO house_ids
  FROM (SELECT id, created_at FROM houses WHERE organisation_id = org_id ORDER BY created_at DESC LIMIT 2) sub;

  -- Insert sample participants (house_ids[2]=Elm, house_ids[1]=Oak)
  INSERT INTO participants (organisation_id, house_id, full_name, date_of_birth, ndis_number, phone, emergency_contact_name, emergency_contact_phone, notes, is_active)
  VALUES
    (org_id, house_ids[2], 'Alex Thompson', '1985-03-15', '43012345678', '0412 345 678', 'Jane Thompson', '0412 345 679', 'Prefers morning routines', true),
    (org_id, house_ids[2], 'Sam Wilson', '1990-07-22', '43023456789', '0413 456 789', 'Mary Wilson', '0413 456 780', NULL, true),
    (org_id, house_ids[1], 'Jordan Lee', '1988-11-08', '43034567890', '0414 567 890', 'David Lee', '0414 567 891', 'Allergy: nuts', true),
    (org_id, house_ids[1], 'Casey Brown', '1992-01-30', '43045678901', NULL, 'Emergency Services', '000', NULL, true);

  RAISE NOTICE 'Seed complete: 2 houses and 4 participants added.';
END $$;
