-- ============================================================
-- Comprehensive Development Seed Data
-- ============================================================
-- PREREQUISITES:
--   1. Run both migrations (00001 + 00002)
--   2. Register at /register and complete onboarding
--   3. Run THIS script in the Supabase SQL Editor
--
-- This creates: 5 test staff (team leader + 4 staff), 4 houses,
-- 8 participants, shifts across multiple statuses, assignments,
-- case notes, incidents, notifications, availability, broadcasts,
-- and audit logs.
-- ============================================================

DO $$
DECLARE
  org_id          UUID;
  admin_id        UUID;

  -- Staff user IDs
  leader_id       UUID;
  staff1_id       UUID;
  staff2_id       UUID;
  staff3_id       UUID;
  staff4_id       UUID;

  -- House IDs
  house_elm       UUID;
  house_oak       UUID;
  house_maple     UUID;
  house_cedar     UUID;

  -- Participant IDs
  p_alex          UUID;
  p_sam           UUID;
  p_jordan        UUID;
  p_casey         UUID;
  p_riley         UUID;
  p_morgan        UUID;
  p_taylor        UUID;
  p_jamie         UUID;

  -- Shift IDs
  shift_past1     UUID;
  shift_past2     UUID;
  shift_today1    UUID;
  shift_today2    UUID;
  shift_tomorrow  UUID;
  shift_next1     UUID;
  shift_next2     UUID;
  shift_draft     UUID;
  shift_cancelled UUID;
  shift_broadcast UUID;

  -- Case note IDs
  cn1             UUID;
  cn2             UUID;
  cn3             UUID;
  cn4             UUID;
  cn5             UUID;

  -- Incident IDs
  inc1            UUID;
  inc2            UUID;
  inc3            UUID;

  -- Broadcast ID
  bc1             UUID;

  today           DATE := CURRENT_DATE;

BEGIN
  -- --------------------------------------------------------
  -- 0. Get the existing org and admin user
  -- --------------------------------------------------------
  SELECT id INTO org_id FROM organisations LIMIT 1;
  IF org_id IS NULL THEN
    RAISE NOTICE 'No organisation found. Complete onboarding first.';
    RETURN;
  END IF;

  SELECT id INTO admin_id FROM staff_profiles
    WHERE organisation_id = org_id AND role = 'super_admin' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No super_admin found. Complete onboarding first.';
    RETURN;
  END IF;

  -- --------------------------------------------------------
  -- 1. Create test auth users + staff profiles
  -- --------------------------------------------------------
  leader_id := gen_random_uuid();
  staff1_id := gen_random_uuid();
  staff2_id := gen_random_uuid();
  staff3_id := gen_random_uuid();
  staff4_id := gen_random_uuid();

  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES
    (leader_id, '00000000-0000-0000-0000-000000000000', 'leader@test.roster.dev',   crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (staff1_id, '00000000-0000-0000-0000-000000000000', 'sarah@test.roster.dev',    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (staff2_id, '00000000-0000-0000-0000-000000000000', 'michael@test.roster.dev',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (staff3_id, '00000000-0000-0000-0000-000000000000', 'priya@test.roster.dev',    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated'),
    (staff4_id, '00000000-0000-0000-0000-000000000000', 'james@test.roster.dev',    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated');

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), leader_id, leader_id, jsonb_build_object('sub', leader_id, 'email', 'leader@test.roster.dev'), 'email', now(), now(), now()),
    (gen_random_uuid(), staff1_id, staff1_id, jsonb_build_object('sub', staff1_id, 'email', 'sarah@test.roster.dev'),  'email', now(), now(), now()),
    (gen_random_uuid(), staff2_id, staff2_id, jsonb_build_object('sub', staff2_id, 'email', 'michael@test.roster.dev'),'email', now(), now(), now()),
    (gen_random_uuid(), staff3_id, staff3_id, jsonb_build_object('sub', staff3_id, 'email', 'priya@test.roster.dev'),  'email', now(), now(), now()),
    (gen_random_uuid(), staff4_id, staff4_id, jsonb_build_object('sub', staff4_id, 'email', 'james@test.roster.dev'),  'email', now(), now(), now());

  INSERT INTO staff_profiles (id, organisation_id, email, full_name, phone, role, is_active)
  VALUES
    (leader_id, org_id, 'leader@test.roster.dev',  'Maria Garcia',    '0420 100 100', 'team_leader', true),
    (staff1_id, org_id, 'sarah@test.roster.dev',   'Sarah Chen',      '0420 200 200', 'staff',       true),
    (staff2_id, org_id, 'michael@test.roster.dev',  'Michael Okonkwo', '0420 300 300', 'staff',       true),
    (staff3_id, org_id, 'priya@test.roster.dev',    'Priya Sharma',    '0420 400 400', 'staff',       true),
    (staff4_id, org_id, 'james@test.roster.dev',    'James Mitchell',  '0420 500 500', 'staff',       false); -- inactive staff member

  -- --------------------------------------------------------
  -- 2. Houses (4 houses, 1 inactive)
  -- --------------------------------------------------------
  house_elm   := gen_random_uuid();
  house_oak   := gen_random_uuid();
  house_maple := gen_random_uuid();
  house_cedar := gen_random_uuid();

  INSERT INTO houses (id, organisation_id, name, address, phone, capacity, notes, is_active)
  VALUES
    (house_elm,   org_id, 'Elm Street House',       '42 Elm Street, Sydney NSW 2000',       '02 9123 4567', 4, 'Main supported accommodation, ground floor accessible', true),
    (house_oak,   org_id, 'Oak Avenue Residence',   '15 Oak Avenue, Parramatta NSW 2150',   '02 9891 2345', 6, 'Larger house with garden and sensory room',              true),
    (house_maple, org_id, 'Maple Court',            '8 Maple Court, Chatswood NSW 2067',    '02 9412 6789', 3, 'Small group home, close to shops',                       true),
    (house_cedar, org_id, 'Cedar Lodge (Inactive)', '100 Cedar Road, Penrith NSW 2750',     '02 4701 2345', 5, 'Temporarily closed for renovations',                     false);

  -- --------------------------------------------------------
  -- 3. Participants (8 across houses)
  -- --------------------------------------------------------
  p_alex   := gen_random_uuid();
  p_sam    := gen_random_uuid();
  p_jordan := gen_random_uuid();
  p_casey  := gen_random_uuid();
  p_riley  := gen_random_uuid();
  p_morgan := gen_random_uuid();
  p_taylor := gen_random_uuid();
  p_jamie  := gen_random_uuid();

  INSERT INTO participants (id, organisation_id, house_id, full_name, date_of_birth, ndis_number, phone, emergency_contact_name, emergency_contact_phone, notes, is_active)
  VALUES
    (p_alex,   org_id, house_elm,   'Alex Thompson',   '1985-03-15', '43012345678', '0412 345 678', 'Jane Thompson',   '0412 345 679', 'Prefers morning routines. Enjoys music therapy.',                    true),
    (p_sam,    org_id, house_elm,   'Sam Wilson',       '1990-07-22', '43023456789', '0413 456 789', 'Mary Wilson',     '0413 456 780', 'Vegetarian diet. Needs medication at 8am and 8pm.',                  true),
    (p_jordan, org_id, house_oak,   'Jordan Lee',       '1988-11-08', '43034567890', '0414 567 890', 'David Lee',       '0414 567 891', 'Allergy: nuts. Uses wheelchair outdoors.',                           true),
    (p_casey,  org_id, house_oak,   'Casey Brown',      '1992-01-30', '43045678901', NULL,           'Emergency Services', '000',       'Non-verbal. Uses AAC device for communication.',                    true),
    (p_riley,  org_id, house_oak,   'Riley Nguyen',     '1995-06-12', '43056789012', '0415 678 901', 'Linh Nguyen',     '0415 678 902', 'Recently transitioned from family home. Adjusting to new environment.', true),
    (p_morgan, org_id, house_maple, 'Morgan Davis',     '1983-09-20', '43067890123', '0416 789 012', 'Peter Davis',     '0416 789 013', 'High support needs. Requires 1:1 during outings.',                  true),
    (p_taylor, org_id, house_maple, 'Taylor Williams',  '1998-12-05', '43078901234', '0417 890 123', 'Sue Williams',    '0417 890 124', NULL,                                                                true),
    (p_jamie,  org_id, house_elm,   'Jamie O''Brien',   '1987-04-18', '43089012345', '0418 901 234', 'Pat O''Brien',    '0418 901 235', 'Plan review due April 2026. Loves swimming.',                       false); -- inactive participant

  -- --------------------------------------------------------
  -- 4. Shifts (various statuses and dates)
  -- --------------------------------------------------------
  shift_past1     := gen_random_uuid();
  shift_past2     := gen_random_uuid();
  shift_today1    := gen_random_uuid();
  shift_today2    := gen_random_uuid();
  shift_tomorrow  := gen_random_uuid();
  shift_next1     := gen_random_uuid();
  shift_next2     := gen_random_uuid();
  shift_draft     := gen_random_uuid();
  shift_cancelled := gen_random_uuid();
  shift_broadcast := gen_random_uuid();

  INSERT INTO shifts (id, organisation_id, house_id, date, start_time, end_time, status, notes, created_by)
  VALUES
    -- Completed shifts (past)
    (shift_past1,     org_id, house_elm,   today - 3, (today - 3)::timestamp + '06:00'::interval, (today - 3)::timestamp + '14:00'::interval, 'completed',   'Morning shift. All tasks completed.',              admin_id),
    (shift_past2,     org_id, house_oak,   today - 2, (today - 2)::timestamp + '14:00'::interval, (today - 2)::timestamp + '22:00'::interval, 'completed',   'Afternoon shift. Jordan had a good day.',          admin_id),

    -- Today's shifts (in progress and published)
    (shift_today1,    org_id, house_elm,   today,     today::timestamp + '06:00'::interval,        today::timestamp + '14:00'::interval,        'in_progress', 'Morning shift in progress.',                       admin_id),
    (shift_today2,    org_id, house_oak,   today,     today::timestamp + '14:00'::interval,        today::timestamp + '22:00'::interval,        'published',   'Afternoon shift needs coverage.',                  admin_id),

    -- Tomorrow
    (shift_tomorrow,  org_id, house_maple, today + 1, (today + 1)::timestamp + '08:00'::interval,  (today + 1)::timestamp + '16:00'::interval,  'published',   'Standard day shift.',                              admin_id),

    -- Next week
    (shift_next1,     org_id, house_elm,   today + 5, (today + 5)::timestamp + '06:00'::interval,  (today + 5)::timestamp + '14:00'::interval,  'published',   'Morning shift next week.',                         admin_id),
    (shift_next2,     org_id, house_oak,   today + 6, (today + 6)::timestamp + '22:00'::interval,  (today + 7)::timestamp + '06:00'::interval,  'published',   'Overnight shift — sleepover required.',            admin_id),

    -- Draft shift (not yet published)
    (shift_draft,     org_id, house_maple, today + 8, (today + 8)::timestamp + '09:00'::interval,  (today + 8)::timestamp + '17:00'::interval,  'draft',       'Pending approval from team leader.',                admin_id),

    -- Cancelled shift
    (shift_cancelled, org_id, house_elm,   today + 2, (today + 2)::timestamp + '06:00'::interval,  (today + 2)::timestamp + '14:00'::interval,  'cancelled',   'Cancelled — participant hospitalised.',            admin_id),

    -- Shift for broadcast (unfilled)
    (shift_broadcast, org_id, house_oak,   today + 3, (today + 3)::timestamp + '14:00'::interval,  (today + 3)::timestamp + '22:00'::interval,  'published',   'Needs urgent coverage — staff called in sick.',   admin_id);

  -- --------------------------------------------------------
  -- 5. Shift Assignments (various statuses)
  -- --------------------------------------------------------
  INSERT INTO shift_assignments (organisation_id, shift_id, staff_id, status, assigned_by, responded_at)
  VALUES
    -- Past shift 1: completed
    (org_id, shift_past1, staff1_id, 'completed', admin_id, now() - interval '4 days'),
    (org_id, shift_past1, staff2_id, 'completed', admin_id, now() - interval '4 days'),

    -- Past shift 2: completed
    (org_id, shift_past2, staff3_id, 'completed', admin_id, now() - interval '3 days'),

    -- Today: one accepted, one pending
    (org_id, shift_today1, staff1_id, 'accepted',  admin_id, now() - interval '1 day'),
    (org_id, shift_today1, staff2_id, 'accepted',  admin_id, now() - interval '1 day'),
    (org_id, shift_today2, staff3_id, 'pending',   admin_id, NULL),

    -- Tomorrow: one accepted, one declined
    (org_id, shift_tomorrow, staff2_id, 'accepted',  leader_id, now() - interval '12 hours'),
    (org_id, shift_tomorrow, staff3_id, 'declined',  leader_id, now() - interval '6 hours'),

    -- Next week: pending
    (org_id, shift_next1, staff1_id, 'pending', admin_id, NULL),
    (org_id, shift_next2, staff3_id, 'pending', admin_id, NULL);

  -- --------------------------------------------------------
  -- 6. Case Notes (various categories, some flagged)
  -- --------------------------------------------------------
  cn1 := gen_random_uuid();
  cn2 := gen_random_uuid();
  cn3 := gen_random_uuid();
  cn4 := gen_random_uuid();
  cn5 := gen_random_uuid();

  INSERT INTO case_notes (id, organisation_id, participant_id, shift_id, house_id, author_id, content, category, is_flagged)
  VALUES
    (cn1, org_id, p_alex, shift_past1, house_elm, staff1_id,
      'Alex had an excellent morning. Completed personal hygiene independently. Enjoyed listening to music during breakfast. Engaged well with other residents during morning activities. No concerns to report.',
      'general', false),

    (cn2, org_id, p_sam, shift_past1, house_elm, staff1_id,
      'Administered morning medication at 8:05am (5 minutes late due to Sam sleeping in). Medication taken with food as prescribed. Sam reported feeling slightly nauseous after breakfast — monitored for 30 minutes, symptoms resolved. Will flag with GP if recurring.',
      'medication', true),

    (cn3, org_id, p_jordan, shift_past2, house_oak, staff3_id,
      'Jordan participated in the afternoon art group. Used adaptive equipment to paint — created a landscape piece. Mood was positive throughout. Transferred to wheelchair for garden time at 4pm. No skin integrity concerns noted.',
      'activity', false),

    (cn4, org_id, p_casey, shift_past2, house_oak, staff3_id,
      'Casey used AAC device to request "outside" and "music" during the shift. Responded well to new playlist. Some agitation noted around 6pm (dinner time) — resolved by offering choice between two meal options using visual cards. Important: Casey seems to respond better when given visual choices rather than verbal options.',
      'behaviour', true),

    (cn5, org_id, p_morgan, NULL, house_maple, staff2_id,
      'Morgan had a community outing to the local shops with 1:1 support. Purchased items independently with minimal prompting. Good awareness of road safety when crossing at lights. Duration: 1.5 hours. No incidents.',
      'activity', false);

  -- --------------------------------------------------------
  -- 7. Incidents (various severities and statuses)
  -- --------------------------------------------------------
  inc1 := gen_random_uuid();
  inc2 := gen_random_uuid();
  inc3 := gen_random_uuid();

  INSERT INTO incidents (id, organisation_id, house_id, participant_id, reported_by, title, description, severity, status, occurred_at, resolved_at, resolution_notes, reviewed_by)
  VALUES
    (inc1, org_id, house_elm, p_sam, staff1_id,
      'Medication delay — Sam Wilson',
      'Morning medication was administered 5 minutes late at 8:05am instead of the scheduled 8:00am. Sam was still asleep and took a few minutes to wake. Medication was taken with food as per protocol. No adverse effects observed. This is the second time this week medication has been late — recommend reviewing morning routine schedule.',
      'low', 'resolved', now() - interval '3 days', now() - interval '2 days',
      'Reviewed morning schedule. Alarm set for 7:45am to ensure participant is awake before medication time. Team briefed on updated protocol.',
      admin_id),

    (inc2, org_id, house_oak, p_casey, staff3_id,
      'Behavioural escalation — Casey Brown',
      'Casey became agitated during dinner transition at approximately 6pm. Started hitting the table and vocalising loudly. Possible trigger: change in usual dinner routine (new staff member was serving). De-escalation techniques applied (offered visual choices, reduced stimulation, played preferred music). Casey calmed within 15 minutes. No injury to self or others.',
      'medium', 'under_review', now() - interval '2 days', NULL, NULL, admin_id),

    (inc3, org_id, house_maple, p_morgan, staff2_id,
      'Near-miss fall during community outing',
      'During a community outing to the local shops, Morgan tripped on an uneven footpath near the shopping centre entrance. Staff member was within arm''s reach and provided immediate support — no fall occurred. Morgan was not injured and continued the outing. Location: outside Westfield Chatswood, north entrance. Recommend reporting footpath hazard to council.',
      'high', 'open', now() - interval '1 day', NULL, NULL, NULL);

  -- --------------------------------------------------------
  -- 8. Notifications (mix of types and read statuses)
  -- --------------------------------------------------------
  INSERT INTO notifications (organisation_id, user_id, title, body, type, reference_type, reference_id, is_read, created_at)
  VALUES
    (org_id, staff1_id, 'Shift assigned',          'You have been assigned to a morning shift at Elm Street House.',             'shift_assigned',   'shift', shift_today1,  true,  now() - interval '2 days'),
    (org_id, staff1_id, 'Shift assigned',          'You have been assigned to a shift next week at Elm Street House.',           'shift_assigned',   'shift', shift_next1,   false, now() - interval '1 day'),
    (org_id, staff2_id, 'Shift assigned',          'You have been assigned to a shift tomorrow at Maple Court.',                 'shift_assigned',   'shift', shift_tomorrow, false, now() - interval '12 hours'),
    (org_id, staff3_id, 'Shift assigned',          'You have been assigned to an overnight shift at Oak Avenue Residence.',      'shift_assigned',   'shift', shift_next2,   false, now() - interval '6 hours'),
    (org_id, admin_id,  'Incident reported',        'A new medium-severity incident has been reported at Oak Avenue Residence.',  'incident_created', 'incident', inc2,        false, now() - interval '2 days'),
    (org_id, admin_id,  'Incident reported',        'A high-severity near-miss has been reported at Maple Court.',               'incident_created', 'incident', inc3,        false, now() - interval '1 day'),
    (org_id, admin_id,  'Shift reminder',           'Tomorrow''s shift at Maple Court still has a declined assignment.',          'shift_reminder',   'shift', shift_tomorrow, false, now() - interval '3 hours'),
    (org_id, staff1_id, 'Case note flagged',        'Your case note about Sam Wilson''s medication has been flagged for review.', 'case_note_flagged', 'case_note', cn2,      false, now() - interval '1 day'),
    (org_id, admin_id,  'Welcome to Roster',        'Your organisation is set up. Start by adding houses and inviting staff.',   'general',          NULL,    NULL,            true,  now() - interval '7 days');

  -- --------------------------------------------------------
  -- 9. Audit Logs
  -- --------------------------------------------------------
  INSERT INTO audit_logs (organisation_id, user_id, action_type, entity_type, entity_id, metadata, created_at)
  VALUES
    (org_id, admin_id,  'create', 'shift',            shift_past1,     jsonb_build_object('house', 'Elm Street House', 'date', (today - 3)::text),          now() - interval '5 days'),
    (org_id, admin_id,  'create', 'shift',            shift_today1,    jsonb_build_object('house', 'Elm Street House', 'date', today::text),                 now() - interval '2 days'),
    (org_id, admin_id,  'assign', 'shift_assignment', gen_random_uuid(), '{"staff": "Sarah Chen", "shift_house": "Elm Street House"}'::jsonb,              now() - interval '2 days'),
    (org_id, admin_id,  'assign', 'shift_assignment', gen_random_uuid(), '{"staff": "Michael Okonkwo", "shift_house": "Elm Street House"}'::jsonb,         now() - interval '2 days'),
    (org_id, staff1_id, 'create', 'case_note',        cn1,              '{"participant": "Alex Thompson", "category": "general"}'::jsonb,                  now() - interval '3 days'),
    (org_id, staff1_id, 'create', 'case_note',        cn2,              '{"participant": "Sam Wilson", "category": "medication", "flagged": true}'::jsonb, now() - interval '3 days'),
    (org_id, staff3_id, 'create', 'incident',         inc2,             '{"title": "Behavioural escalation", "severity": "medium"}'::jsonb,                now() - interval '2 days'),
    (org_id, staff2_id, 'create', 'incident',         inc3,             '{"title": "Near-miss fall", "severity": "high"}'::jsonb,                          now() - interval '1 day'),
    (org_id, admin_id,  'update', 'incident',         inc1,             '{"status": "resolved", "previous_status": "open"}'::jsonb,                        now() - interval '2 days'),
    (org_id, leader_id, 'assign', 'shift_assignment', gen_random_uuid(), '{"staff": "Michael Okonkwo", "shift_house": "Maple Court"}'::jsonb,             now() - interval '12 hours');

  -- --------------------------------------------------------
  -- 10. Staff Availability (next 14 days)
  -- --------------------------------------------------------
  INSERT INTO staff_availability (organisation_id, staff_id, date, is_available, start_time, end_time, notes)
  VALUES
    -- Sarah Chen: available most days, specific hours
    (org_id, staff1_id, today,     true,  '06:00', '14:00', NULL),
    (org_id, staff1_id, today + 1, true,  '06:00', '14:00', NULL),
    (org_id, staff1_id, today + 2, false, NULL,    NULL,    'Personal appointment'),
    (org_id, staff1_id, today + 3, true,  '06:00', '22:00', 'Available all day'),
    (org_id, staff1_id, today + 4, true,  '06:00', '14:00', NULL),
    (org_id, staff1_id, today + 5, true,  '06:00', '14:00', NULL),
    (org_id, staff1_id, today + 6, false, NULL,    NULL,    'Weekend off'),
    (org_id, staff1_id, today + 7, false, NULL,    NULL,    'Weekend off'),

    -- Michael Okonkwo: afternoon/evening preference
    (org_id, staff2_id, today,     true,  '14:00', '22:00', NULL),
    (org_id, staff2_id, today + 1, true,  '08:00', '16:00', NULL),
    (org_id, staff2_id, today + 2, true,  '14:00', '22:00', NULL),
    (org_id, staff2_id, today + 3, false, NULL,    NULL,    'Study day'),
    (org_id, staff2_id, today + 4, true,  '14:00', '22:00', NULL),
    (org_id, staff2_id, today + 5, true,  '06:00', '22:00', 'Flexible — can do any shift'),
    (org_id, staff2_id, today + 6, true,  '14:00', '22:00', NULL),

    -- Priya Sharma: mixed availability
    (org_id, staff3_id, today,     true,  '14:00', '22:00', NULL),
    (org_id, staff3_id, today + 1, false, NULL,    NULL,    'Unavailable — family commitment'),
    (org_id, staff3_id, today + 2, true,  '06:00', '14:00', NULL),
    (org_id, staff3_id, today + 3, true,  '06:00', '22:00', 'Available all day'),
    (org_id, staff3_id, today + 4, true,  '22:00', '06:00', 'Available for overnights only'),
    (org_id, staff3_id, today + 5, true,  '06:00', '14:00', NULL),
    (org_id, staff3_id, today + 6, true,  '14:00', '22:00', NULL),
    (org_id, staff3_id, today + 7, true,  '06:00', '14:00', NULL),

    -- Team leader also sets availability
    (org_id, leader_id, today,     true,  '08:00', '17:00', NULL),
    (org_id, leader_id, today + 1, true,  '08:00', '17:00', NULL),
    (org_id, leader_id, today + 2, true,  '08:00', '17:00', NULL),
    (org_id, leader_id, today + 3, false, NULL,    NULL,    'Conference day'),
    (org_id, leader_id, today + 4, true,  '08:00', '17:00', NULL);

  -- --------------------------------------------------------
  -- 11. Shift Broadcast (open broadcast for unfilled shift)
  -- --------------------------------------------------------
  bc1 := gen_random_uuid();

  INSERT INTO shift_broadcasts (id, organisation_id, shift_id, created_by, message, status, expires_at)
  VALUES
    (bc1, org_id, shift_broadcast, admin_id,
      'Urgent: We need someone to cover the afternoon shift at Oak Avenue this Thursday. Staff member called in sick. The shift runs 2pm to 10pm. Familiarity with Casey and Jordan preferred but not required.',
      'open', (today + 3)::timestamp + '12:00'::interval);

  -- Two staff have responded
  INSERT INTO shift_broadcast_responses (organisation_id, broadcast_id, staff_id, status, responded_at)
  VALUES
    (org_id, bc1, staff1_id, 'interested', now() - interval '2 hours'),
    (org_id, bc1, staff2_id, 'interested', now() - interval '1 hour');

  -- --------------------------------------------------------
  -- Done
  -- --------------------------------------------------------
  RAISE NOTICE '✓ Seed complete!';
  RAISE NOTICE '  - 5 staff: Maria Garcia (team_leader), Sarah Chen, Michael Okonkwo, Priya Sharma, James Mitchell (inactive)';
  RAISE NOTICE '  - 4 houses: Elm Street, Oak Avenue, Maple Court, Cedar Lodge (inactive)';
  RAISE NOTICE '  - 8 participants across 3 active houses (1 inactive participant)';
  RAISE NOTICE '  - 10 shifts: 2 completed, 1 in-progress, 4 published, 1 draft, 1 cancelled, 1 for broadcast';
  RAISE NOTICE '  - 10 shift assignments across various statuses';
  RAISE NOTICE '  - 5 case notes (2 flagged) across different categories';
  RAISE NOTICE '  - 3 incidents: low/resolved, medium/under-review, high/open';
  RAISE NOTICE '  - 9 notifications (mix of read/unread)';
  RAISE NOTICE '  - 10 audit log entries';
  RAISE NOTICE '  - 29 availability entries across 4 staff over next 8 days';
  RAISE NOTICE '  - 1 open broadcast with 2 interested responses';
  RAISE NOTICE '';
  RAISE NOTICE 'Test logins (all password: password123):';
  RAISE NOTICE '  leader@test.roster.dev  — Team Leader';
  RAISE NOTICE '  sarah@test.roster.dev   — Staff';
  RAISE NOTICE '  michael@test.roster.dev — Staff';
  RAISE NOTICE '  priya@test.roster.dev   — Staff';
  RAISE NOTICE '  james@test.roster.dev   — Staff (inactive)';

END $$;
