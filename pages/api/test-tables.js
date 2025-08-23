import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // First, let's try to get schema information
    console.log('Testing Supabase connection and table access...');
    
    // Test 1: Try arica_status
    console.log('Testing arica_status table...');
    const { data: statusData, error: statusError } = await supabase
      .from('arica_status')
      .select('*')
      .limit(1);
    
    // Test 2: Check arica_meteo columns
    console.log('Testing arica_meteo table structure...');
    const { data: meteoData, error: meteoError } = await supabase
      .from('arica_meteo')
      .select('*')
      .limit(1);
    
    // Test 3: Check arica_oceano columns  
    console.log('Testing arica_oceano table structure...');
    const { data: oceanoData, error: oceanoError } = await supabase
      .from('arica_oceano')
      .select('*')
      .limit(1);

    const results = {
      arica_status: {
        error: statusError?.message || null,
        hasData: statusData && statusData.length > 0,
        columns: statusData && statusData.length > 0 ? Object.keys(statusData[0]) : null
      },
      arica_meteo: {
        error: meteoError?.message || null,
        hasData: meteoData && meteoData.length > 0,
        columns: meteoData && meteoData.length > 0 ? Object.keys(meteoData[0]) : null
      },
      arica_oceano: {
        error: oceanoError?.message || null,
        hasData: oceanoData && oceanoData.length > 0,
        columns: oceanoData && oceanoData.length > 0 ? Object.keys(oceanoData[0]) : null
      }
    };

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in test handler:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}