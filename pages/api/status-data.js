import supabase from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { data, error } = await supabase
      .from('arica_status')
      .select('longitude_fixed, latitude_fixed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching status data:', error);
      return res.status(500).json({ message: 'Error fetching status data' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No status data found' });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error in status handler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}