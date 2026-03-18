-- ============================================================
-- Migration 00003: Timesheets & Employment Types
-- Adds fortnightly shift submissions and staff employment category
-- ============================================================

-- ------------------------------------------------------------
-- 1. Employment type on staff_profiles
-- ------------------------------------------------------------

ALTER TABLE staff_profiles
  ADD COLUMN employment_type TEXT NOT NULL DEFAULT 'casual'
  CHECK (employment_type IN ('full_time', 'casual', 'agency'));

CREATE INDEX idx_staff_profiles_employment ON staff_profiles(organisation_id, employment_type);


-- ------------------------------------------------------------
-- 2. Shift submissions (fortnightly confirmation)
-- ------------------------------------------------------------

CREATE TABLE shift_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
    submitted_at    TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES staff_profiles(id),
    reviewed_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(staff_id, period_start, period_end)
);

CREATE INDEX idx_shift_submissions_org ON shift_submissions(organisation_id);
CREATE INDEX idx_shift_submissions_staff ON shift_submissions(staff_id);
CREATE INDEX idx_shift_submissions_period ON shift_submissions(organisation_id, period_start, period_end);
CREATE INDEX idx_shift_submissions_status ON shift_submissions(organisation_id, status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON shift_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ------------------------------------------------------------
-- 3. RLS POLICIES
-- ------------------------------------------------------------

ALTER TABLE shift_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view submissions"
    ON shift_submissions FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can create own submissions"
    ON shift_submissions FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND staff_id = auth.uid()
    );

CREATE POLICY "Staff can update own pending submissions"
    ON shift_submissions FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND (
            (staff_id = auth.uid() AND status = 'pending')
            OR get_user_role() IN ('super_admin', 'team_leader')
        )
    );
