import { createClient } from '@/lib/supabase/client'

export async function getNotifications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export async function getUnreadCount() {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  if (error) throw error
  return count ?? 0
}

export async function markAsRead(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  if (error) throw error
}

export async function markAllAsRead() {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) throw error
}
