import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // Calculate current 24-hour window
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - 1); // Get last 24 hours
  
  const startDateISO = startDate.toISOString();
  const endDateISO = currentDate.toISOString();

  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, WSPD, WDIR')
    .gte('created_at', startDateISO)
    .lt('created_at', endDateISO)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const sanitizedData = data.map(item => ({
    created_at: item.created_at,
    WSPD: isNaN(parseFloat(item.WSPD)) ? null : parseFloat(item.WSPD),
    WDIR: isNaN(parseFloat(item.WDIR)) ? null : parseFloat(item.WDIR)
  }));

  return res.status(200).json(sanitizedData)
}