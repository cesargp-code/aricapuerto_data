import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, WSPD, WDIR, GSPD, GDIR')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const sanitizedData = data.map(item => ({
    created_at: item.created_at,
    WSPD: isNaN(parseFloat(item.WSPD)) ? null : parseFloat(item.WSPD),
    WDIR: isNaN(parseFloat(item.WDIR)) ? null : parseFloat(item.WDIR),
    GSPD: isNaN(parseFloat(item.GSPD)) ? null : parseFloat(item.GSPD),
    GDIR: isNaN(parseFloat(item.GDIR)) ? null : parseFloat(item.GDIR)
  }));

  return res.status(200).json(sanitizedData)
}