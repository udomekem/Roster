-- ============================================================
-- Migration 00002: Phase 2 — Workforce Automation
-- Adds staff availability, shift broadcasts, and AI support
-- ============================================================

-- ------------------------------------------------------------
-- 1. STAFF AVAILABILITY
-- ------------------------------------------------------------

CREATE TABLE staff_availability (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    is_available    BOOLEAN NOT NULL DEFAULT true,
    start_time      TIME,
    end_time        TIME,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(staff_id, date)
);

CREATE INDEX idx_staff_availability_org ON staff_availability(organisation_id);
CREATE INDEX idx_staff_availability_staff_date ON staff_availability(staff_id, date);
CREATE INDEX idx_staff_availability_date ON staff_availability(organisation_id, date, is_available);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON staff_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ------------------------------------------------------------
-- 2. SHIFT BROADCASTS
-- ------------------------------------------------------------

CREATE TABLE shift_broadcasts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    created_by      UUID NOT NULL REFERENCES staff_profiles(id),
    message         TEXT,
    status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'filled', 'cancelled')),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_broadcasts_org ON shift_broadcasts(organisation_id);
CREATE INDEX idx_shift_broadcasts_shift ON shift_broadcasts(shift_id);
CREATE INDEX idx_shift_broadcasts_status ON shift_broadcasts(organisation_id, status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON shift_broadcasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


CREATE TABLE shift_broadcast_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    broadcast_id    UUID NOT NULL REFERENCES shift_broadcasts(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'interested'
                    CHECK (status IN ('interested', 'accepted', 'rejected')),
    responded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(broadcast_id, staff_id)
);

CREATE INDEX idx_broadcast_responses_broadcast ON shift_broadcast_responses(broadcast_id);
CREATE INDEX idx_broadcast_responses_staff ON shift_broadcast_responses(staff_id);


-- ------------------------------------------------------------
-- 3. SHIFT SUMMARIES (AI-generated)
-- ------------------------------------------------------------

CREATE TABLE shift_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    summary         TEXT NOT NULL,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    generated_by    UUID REFERENCES staff_profiles(id),
    is_approved     BOOLEAN NOT NULL DEFAULT false,
    approved_by     UUID REFERENCES staff_profiles(id),
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_summaries_shift ON shift_summaries(shift_id);
CREATE INDEX idx_shift_summaries_org ON shift_summaries(organisation_id);


-- ------------------------------------------------------------
-- 4. RLS POLICIES
-- ------------------------------------------------------------

-- staff_availability
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view availability"
    ON staff_availability FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can manage own availability"
    ON staff_availability FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND staff_id = auth.uid()
    );

CREATE POLICY "Staff can update own availability"
    ON staff_availability FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND (staff_id = auth.uid() OR get_user_role() IN ('super_admin', 'team_leader'))
    );

CREATE POLICY "Staff can delete own availability"
    ON staff_availability FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND (staff_id = auth.uid() OR get_user_role() IN ('super_admin', 'team_leader'))
    );


-- shift_broadcasts
ALTER TABLE shift_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view broadcasts"
    ON shift_broadcasts FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Admins and leaders can create broadcasts"
    ON shift_broadcasts FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Admins and leaders can update broadcasts"
    ON shift_broadcasts FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );


-- shift_broadcast_responses
ALTER TABLE shift_broadcast_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view broadcast responses"
    ON shift_broadcast_responses FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can respond to broadcasts"
    ON shift_broadcast_responses FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND staff_id = auth.uid()
    );

CREATE POLICY "Staff can update own response"
    ON shift_broadcast_responses FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND staff_id = auth.uid()
    );


-- shift_summaries
ALTER TABLE shift_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view shift summaries"
    ON shift_summaries FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Admins and leaders can manage summaries"
    ON shift_summaries FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Admins and leaders can update summaries"
    ON shift_summaries FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );
