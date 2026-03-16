import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types'

export async function getHouses(): Promise<Tables<'houses'>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getHouse(id: string): Promise<Tables<'houses'>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createHouse(house: InsertTables<'houses'>): Promise<Tables<'houses'>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('houses')
    .insert(house as Record<string, unknown>)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHouse(id: string, updates: UpdateTables<'houses'>): Promise<Tables<'houses'>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('houses')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHouse(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('houses')
    .delete()
    .eq('id', id)

  if (error) throw error
}
