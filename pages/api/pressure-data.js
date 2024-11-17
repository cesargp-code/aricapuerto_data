import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, ATMS')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const sanitizedData = data.map(item => ({
    created_at: item.created_at,
    ATMS: isNaN(parseFloat(item.ATMS)) ? null : parseFloat(item.ATMS)
  }));

  return res.status(200).json(sanitizedData)
}