import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  // TEMPORARY SOLUTION WHILE BUOY IS UNDER MAINTENANCE
  // Set to false when the buoy is fixed to return to normal operation
  const USE_HISTORICAL_DATA = true;
  
  let startDate, endDate;
  
  if (USE_HISTORICAL_DATA) {
    // Use data from 5 months ago
    const now = new Date();
    const fiveMonthsAgo = new Date(now);
    fiveMonthsAgo.setMonth(now.getMonth() - 5);
    
    endDate = new Date(fiveMonthsAgo);
    startDate = new Date(fiveMonthsAgo);
    startDate.setDate(startDate.getDate() - 1); // 24 hours before that date
    
    // Adjust timestamps to match current time patterns
    const adjustTimestamp = (timestamp) => {
      const original = new Date(timestamp);
      const adjusted = new Date();
      adjusted.setHours(original.getHours(), original.getMinutes(), original.getSeconds());
      return adjusted;
    };
    
    // Fetch historical data
    const { data, error } = await supabase
      .from('arica_oceano')
      .select('created_at, VAVH, VAVT, VDIR, VMXL')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    
    // Adjust timestamps to make them appear current
    const sanitizedData = data.map(item => ({
      created_at: adjustTimestamp(item.created_at).toISOString(),
      VAVH: isNaN(parseFloat(item.VAVH)) ? null : parseFloat(item.VAVH),
      VAVT: isNaN(parseFloat(item.VAVT)) ? null : parseFloat(item.VAVT),
      VDIR: isNaN(parseFloat(item.VDIR)) ? null : parseFloat(item.VDIR),
      VMXL: isNaN(parseFloat(item.VMXL)) ? null : parseFloat(item.VMXL)
    }));
    
    return res.status(200).json(sanitizedData);
  } else {
    // Normal operation - once the buoy is fixed
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('arica_oceano')
      .select('created_at, VAVH, VAVT, VDIR, VMXL')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    
    const sanitizedData = data.map(item => ({
      created_at: item.created_at,
      VAVH: isNaN(parseFloat(item.VAVH)) ? null : parseFloat(item.VAVH),
      VAVT: isNaN(parseFloat(item.VAVT)) ? null : parseFloat(item.VAVT),
      VDIR: isNaN(parseFloat(item.VDIR)) ? null : parseFloat(item.VDIR),
      VMXL: isNaN(parseFloat(item.VMXL)) ? null : parseFloat(item.VMXL)
    }));
    
    return res.status(200).json(sanitizedData);
  }
}