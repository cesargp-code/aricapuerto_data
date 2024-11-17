import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('arica_meteo')
    .select('created_at, ATMS, DRYT, DEWT')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return res.status(500).json({ error: error.message })

  const sanitizedData = {
    created_at: data.created_at,
    ATMS: isNaN(parseFloat(data.ATMS)) ? null : parseFloat(data.ATMS),
    DRYT: isNaN(parseFloat(data.DRYT)) ? null : parseFloat(data.DRYT),
    DEWT: isNaN(parseFloat(data.DEWT)) ? null : parseFloat(data.DEWT)
  };

  return res.status(200).json(sanitizedData)
}