import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // TEMPORARY FIX: Use data from 5 months ago due to buoy damage
  
  // Calculate current date and date 5 months ago
  const currentDate = new Date();
  const fiveMonthsAgo = new Date(currentDate);
  fiveMonthsAgo.setMonth(currentDate.getMonth() - 7);
  
  // Calculate a 24-hour window from 5 months ago
  const startDate = new Date(fiveMonthsAgo);
  const endDate = new Date(fiveMonthsAgo);
  endDate.setDate(endDate.getDate() + 1); // Add 1 day to get 24 hours of data
  
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  const { data, error } = await supabase
    .from('arica_oceano')
    .select('created_at, VAVH, VAVT, VDIR')
    .gte('created_at', startDateISO)
    .lt('created_at', endDateISO)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Sanitize data before sending it to the client
  const sanitizedData = data.map(item => ({
    created_at: item.created_at,
    VAVH: isNaN(parseFloat(item.VAVH)) ? null : parseFloat(item.VAVH),
    VAVT: isNaN(parseFloat(item.VAVT)) ? null : parseFloat(item.VAVT),
    VDIR: isNaN(parseFloat(item.VDIR)) ? null : parseFloat(item.VDIR)
  }));

  return res.status(200).json(sanitizedData);
}