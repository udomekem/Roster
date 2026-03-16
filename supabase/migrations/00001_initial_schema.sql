-- ============================================================
-- Migration 00001: Initial Schema
-- NDIS Workforce & Care Management Platform
-- ============================================================

-- ------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------

-- organisations (tenant root — no organisation_id on itself)
CREATE TABLE organisations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    abn             TEXT,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    logo_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organisations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- staff_profiles (extends auth.users with org membership and role)
CREATE TABLE staff_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    phone           TEXT,
    role            TEXT NOT NULL CHECK (role IN ('super_admin', 'team_leader', 'staff')),
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_profiles_org ON staff_profiles(organisation_id);
CREATE INDEX idx_staff_profiles_role ON staff_profiles(organisation_id, role);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON staff_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- houses
CREATE TABLE houses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    address         TEXT,
    phone           TEXT,
    capacity        INTEGER,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_houses_org ON houses(organisation_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- participants
CREATE TABLE participants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id         UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    house_id                UUID REFERENCES houses(id) ON DELETE SET NULL,
    full_name               TEXT NOT NULL,
    date_of_birth           DATE,
    ndis_number             TEXT,
    phone                   TEXT,
    email                   TEXT,
    emergency_contact_name  TEXT,
    emergency_contact_phone TEXT,
    notes                   TEXT,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_participants_org ON participants(organisation_id);
CREATE INDEX idx_participants_house ON participants(house_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- shifts
CREATE TABLE shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    house_id        UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')),
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES staff_profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shifts_org ON shifts(organisation_id);
CREATE INDEX idx_shifts_house_date ON shifts(house_id, date);
CREATE INDEX idx_shifts_status ON shifts(organisation_id, status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- shift_assignments
CREATE TABLE shift_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'no_show')),
    assigned_by     UUID NOT NULL REFERENCES staff_profiles(id),
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(shift_id, staff_id)
);

CREATE INDEX idx_shift_assignments_org ON shift_assignments(organisation_id);
CREATE INDEX idx_shift_assignments_staff ON shift_assignments(staff_id, status);
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shift_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON shift_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- case_notes
CREATE TABLE case_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    shift_id        UUID REFERENCES shifts(id) ON DELETE SET NULL,
    house_id        UUID REFERENCES houses(id) ON DELETE SET NULL,
    author_id       UUID NOT NULL REFERENCES staff_profiles(id),
    content         TEXT NOT NULL,
    category        TEXT CHECK (category IN ('general', 'health', 'behaviour', 'medication', 'activity', 'other')),
    is_flagged      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_notes_org ON case_notes(organisation_id);
CREATE INDEX idx_case_notes_participant ON case_notes(participant_id);
CREATE INDEX idx_case_notes_author ON case_notes(author_id);
CREATE INDEX idx_case_notes_shift ON case_notes(shift_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON case_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- case_note_attachments
CREATE TABLE case_note_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    case_note_id    UUID NOT NULL REFERENCES case_notes(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_type       TEXT,
    file_size       INTEGER,
    uploaded_by     UUID NOT NULL REFERENCES staff_profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_note_attachments_note ON case_note_attachments(case_note_id);


-- incidents
CREATE TABLE incidents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id  UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    house_id         UUID REFERENCES houses(id) ON DELETE SET NULL,
    participant_id   UUID REFERENCES participants(id) ON DELETE SET NULL,
    reported_by      UUID NOT NULL REFERENCES staff_profiles(id),
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    severity         TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status           TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    occurred_at      TIMESTAMPTZ NOT NULL,
    resolved_at      TIMESTAMPTZ,
    resolution_notes TEXT,
    reviewed_by      UUID REFERENCES staff_profiles(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_org ON incidents(organisation_id);
CREATE INDEX idx_incidents_house ON incidents(house_id);
CREATE INDEX idx_incidents_severity ON incidents(organisation_id, severity);
CREATE INDEX idx_incidents_status ON incidents(organisation_id, status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- incident_attachments
CREATE TABLE incident_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_type       TEXT,
    file_size       INTEGER,
    uploaded_by     UUID NOT NULL REFERENCES staff_profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_attachments_incident ON incident_attachments(incident_id);


-- notifications
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    body            TEXT,
    type            TEXT NOT NULL
                    CHECK (type IN ('shift_assigned', 'shift_updated', 'shift_reminder',
                                    'case_note_flagged', 'incident_created', 'general')),
    reference_type  TEXT,
    reference_id    UUID,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_org ON notifications(organisation_id);


-- audit_logs
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES staff_profiles(id),
    action_type     TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organisation_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);


-- ------------------------------------------------------------
-- 3. RLS HELPER FUNCTIONS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_user_organisation_id()
RETURNS UUID AS $$
    SELECT organisation_id FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY POLICIES
-- ------------------------------------------------------------

-- organisations
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organisation"
    ON organisations FOR SELECT
    USING (id = get_user_organisation_id());

CREATE POLICY "Super admins can update own organisation"
    ON organisations FOR UPDATE
    USING (id = get_user_organisation_id() AND get_user_role() = 'super_admin');


-- staff_profiles
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view staff profiles"
    ON staff_profiles FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Super admins can insert staff profiles"
    ON staff_profiles FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() = 'super_admin'
    );

CREATE POLICY "Users can update own profile or super admins can update any"
    ON staff_profiles FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND (id = auth.uid() OR get_user_role() = 'super_admin')
    );


-- houses
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view houses"
    ON houses FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Admins and leaders can create houses"
    ON houses FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Admins and leaders can update houses"
    ON houses FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Super admins can delete houses"
    ON houses FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() = 'super_admin'
    );


-- participants
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view participants"
    ON participants FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Admins and leaders can create participants"
    ON participants FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Admins and leaders can update participants"
    ON participants FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Super admins can delete participants"
    ON participants FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() = 'super_admin'
    );


-- shifts
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view shifts"
    ON shifts FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Admins and leaders can create shifts"
    ON shifts FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Admins and leaders can update shifts"
    ON shifts FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Admins and leaders can delete shifts"
    ON shifts FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );


-- shift_assignments
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff see own assignments or admins see all"
    ON shift_assignments FOR SELECT
    USING (
        organisation_id = get_user_organisation_id()
        AND (
            get_user_role() IN ('super_admin', 'team_leader')
            OR staff_id = auth.uid()
        )
    );

CREATE POLICY "Admins and leaders can create assignments"
    ON shift_assignments FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );

CREATE POLICY "Staff can respond or admins can update assignments"
    ON shift_assignments FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND (
            get_user_role() IN ('super_admin', 'team_leader')
            OR staff_id = auth.uid()
        )
    );

CREATE POLICY "Admins and leaders can delete assignments"
    ON shift_assignments FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );


-- case_notes
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view case notes"
    ON case_notes FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can create case notes"
    ON case_notes FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND author_id = auth.uid()
    );

CREATE POLICY "Authors and admins can update case notes"
    ON case_notes FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND (author_id = auth.uid() OR get_user_role() IN ('super_admin', 'team_leader'))
    );


-- case_note_attachments
ALTER TABLE case_note_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view case note attachments"
    ON case_note_attachments FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can upload case note attachments"
    ON case_note_attachments FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND uploaded_by = auth.uid()
    );

CREATE POLICY "Admins can delete case note attachments"
    ON case_note_attachments FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );


-- incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view incidents"
    ON incidents FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can report incidents"
    ON incidents FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND reported_by = auth.uid()
    );

CREATE POLICY "Reporters and admins can update incidents"
    ON incidents FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND (reported_by = auth.uid() OR get_user_role() IN ('super_admin', 'team_leader'))
    );


-- incident_attachments
ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view incident attachments"
    ON incident_attachments FOR SELECT
    USING (organisation_id = get_user_organisation_id());

CREATE POLICY "Staff can upload incident attachments"
    ON incident_attachments FOR INSERT
    WITH CHECK (
        organisation_id = get_user_organisation_id()
        AND uploaded_by = auth.uid()
    );

CREATE POLICY "Admins can delete incident attachments"
    ON incident_attachments FOR DELETE
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() IN ('super_admin', 'team_leader')
    );


-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        organisation_id = get_user_organisation_id()
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can mark own notifications as read"
    ON notifications FOR UPDATE
    USING (
        organisation_id = get_user_organisation_id()
        AND user_id = auth.uid()
    );


-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        organisation_id = get_user_organisation_id()
        AND get_user_role() = 'super_admin'
    );


-- ------------------------------------------------------------
-- 5. STORAGE BUCKETS
-- ------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('case-note-attachments', 'case-note-attachments', false),
    ('incident-attachments', 'incident-attachments', false);

CREATE POLICY "Org members can read case note files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'case-note-attachments'
        AND (storage.foldername(name))[1]::uuid = get_user_organisation_id()
    );

CREATE POLICY "Authenticated users can upload case note files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'case-note-attachments'
        AND (storage.foldername(name))[1]::uuid = get_user_organisation_id()
    );

CREATE POLICY "Org members can read incident files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'incident-attachments'
        AND (storage.foldername(name))[1]::uuid = get_user_organisation_id()
    );

CREATE POLICY "Authenticated users can upload incident files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'incident-attachments'
        AND (storage.foldername(name))[1]::uuid = get_user_organisation_id()
    );
