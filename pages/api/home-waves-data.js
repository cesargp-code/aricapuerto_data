import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // Calculate timestamp for 24 hours ago
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('arica_oceano')
    .select('created_at, VAVH, VAVT, VDIR')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  // Sanitize data before sending it to the client
  const sanitizedData = data.map(item => ({
    created_at: item.created_at,
    VAVH: isNaN(parseFloat(item.VAVH)) ? null : parseFloat(item.VAVH),
    VAVT: isNaN(parseFloat(item.VAVT)) ? null : parseFloat(item.VAVT),
    VDIR: isNaN(parseFloat(item.VDIR)) ? null : parseFloat(item.VDIR)
  }));

  return res.status(200).json(sanitizedData)
}