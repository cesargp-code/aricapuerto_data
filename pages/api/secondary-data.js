import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // TEMPORARY FIX: Use data from 5 months ago due to meteorological station issues
  
  // Calculate date 5 months ago
  const currentDate = new Date();
  const fiveMonthsAgo = new Date(currentDate);
  fiveMonthsAgo.setMonth(currentDate.getMonth() - 5);
  
  // Convert to ISO string
  const targetDateISO = fiveMonthsAgo.toISOString();
  
  // Find the record closest to the target date
  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, ATMS, DRYT, DEWT')
    .gte('created_at', targetDateISO)
    .order('created_at')  // Ascending order to get the closest after the target
    .limit(1)
    .single()

  if (error) {
    // If no data found after the target date, try to get one before
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('arica_meteo')
      .select('created_at, ATMS, DRYT, DEWT')
      .lt('created_at', targetDateISO)
      .order('created_at', { ascending: false })  // Descending to get closest before target
      .limit(1)
      .single()
      
    if (fallbackError) return res.status(500).json({ error: fallbackError.message })
    
    const sanitizedData = {
      created_at: fallbackData.created_at,
      ATMS: isNaN(parseFloat(fallbackData.ATMS)) ? null : parseFloat(fallbackData.ATMS),
      DRYT: isNaN(parseFloat(fallbackData.DRYT)) ? null : parseFloat(fallbackData.DRYT),
      DEWT: isNaN(parseFloat(fallbackData.DEWT)) ? null : parseFloat(fallbackData.DEWT)
    };
    
    return res.status(200).json(sanitizedData)
  }

  const sanitizedData = {
    created_at: data.created_at,
    ATMS: isNaN(parseFloat(data.ATMS)) ? null : parseFloat(data.ATMS),
    DRYT: isNaN(parseFloat(data.DRYT)) ? null : parseFloat(data.DRYT),
    DEWT: isNaN(parseFloat(data.DEWT)) ? null : parseFloat(data.DEWT)
  };

  return res.status(200).json(sanitizedData)
}