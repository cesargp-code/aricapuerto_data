import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // TEMPORARY FIX: Use data from 5 months ago due to meteorological station issues
  
  // Calculate current date and date 5 months ago
  const currentDate = new Date();
  const fiveMonthsAgo = new Date(currentDate);
  fiveMonthsAgo.setMonth(currentDate.getMonth() - 5);
  
  // Calculate a 24-hour window from 5 months ago
  const startDate = new Date(fiveMonthsAgo);
  const endDate = new Date(fiveMonthsAgo);
  endDate.setDate(endDate.getDate() + 1); // Add 1 day to get 24 hours of data
  
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, DRYT')
    .gte('created_at', startDateISO)
    .lt('created_at', endDateISO)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  const sanitizedData = data.map(item => ({
    created_at: item.created_at,
    DRYT: isNaN(parseFloat(item.DRYT)) ? null : parseFloat(item.DRYT)
  }));

  return res.status(200).json(sanitizedData)
}