import { createClient } from '@/lib/supabase/client'

/**
 * Upload a file to a Supabase Storage bucket and insert an attachment metadata row.
 * Path convention: {org_id}/{entity_id}/{filename}
 */
async function uploadToStorage(
  bucket: string,
  orgId: string,
  entityId: string,
  file: File
): Promise<string> {
  const supabase = createClient()
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const filePath = `${orgId}/${entityId}/${safeName}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) throw error
  return filePath
}

/**
 * Upload a file as a case note attachment.
 * Uploads to storage then inserts a row into case_note_attachments.
 */
export async function uploadCaseNoteAttachment(
  orgId: string,
  caseNoteId: string,
  userId: string,
  file: File
) {
  const filePath = await uploadToStorage('case-note-attachments', orgId, caseNoteId, file)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('case_note_attachments')
    .insert({
      organisation_id: orgId,
      case_note_id: caseNoteId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type || null,
      file_size: file.size,
      uploaded_by: userId,
    } as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Upload a file as an incident attachment.
 * Uploads to storage then inserts a row into incident_attachments.
 */
export async function uploadIncidentAttachment(
  orgId: string,
  incidentId: string,
  userId: string,
  file: File
) {
  const filePath = await uploadToStorage('incident-attachments', orgId, incidentId, file)

  const supabase = createClient()
  const { data, error } = await supabase
    .from('incident_attachments')
    .insert({
      organisation_id: orgId,
      incident_id: incidentId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type || null,
      file_size: file.size,
      uploaded_by: userId,
    } as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}
