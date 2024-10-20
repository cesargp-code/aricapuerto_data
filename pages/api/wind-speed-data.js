import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  console.log('API route called');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log('Attempting to fetch data from Supabase');
    const { data, error } = await supabase
      .from('arica_meteo')
      .select('created_at, WSPD')
      .order('created_at', { ascending: false })
      .limit(24);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.log('No data returned from Supabase');
      return res.status(204).json({ message: 'No data available' });
    }

    console.log(`Fetched ${data.length} records from Supabase`);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error in API route:', err);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}