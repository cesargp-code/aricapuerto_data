import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../../lib/authMiddleware';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Attempting to fetch status data from arica_status table');
    const { data, error } = await supabase
      .from('arica_status')
      .select('longitude_fixed, latitude_fixed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase error details:', error);
      return res.status(500).json({ 
        message: 'Error fetching status data',
        error: error.message,
        details: error
      });
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

export default withAuth(handler);