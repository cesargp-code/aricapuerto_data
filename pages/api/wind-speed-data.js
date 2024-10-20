import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const debugInfo = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    queryResult: null,
    error: null
  };

  try {
    const { data, error, count } = await supabase
      .from('arica_meteo')
      .select('created_at, WSPD', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(24);

    debugInfo.queryResult = { 
      dataLength: data ? data.length : 0,
      count,
      firstRow: data && data.length > 0 ? data[0] : null,
      lastRow: data && data.length > 0 ? data[data.length - 1] : null
    };

    if (error) {
      debugInfo.error = error.message;
      return res.status(500).json({ error: error.message, debugInfo });
    }

    return res.status(200).json({ data, debugInfo });
  } catch (err) {
    debugInfo.error = err.message;
    return res.status(500).json({ error: 'An unexpected error occurred', debugInfo });
  }
}