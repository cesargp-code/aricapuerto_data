import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, WSPD')
    .order('created_at', { ascending: false })
    .limit(24)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}