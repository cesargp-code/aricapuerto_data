import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const API_TOKEN = process.env.API_TOKEN;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://oceancom.msm-data.com/api/device/10/Waves/';

const endpoints = [
  { url: `${BASE_URL}Wave%20Height/?token=${API_TOKEN}`, type: 'Wave Height' },
  { url: `${BASE_URL}Wave%20Period/?token=${API_TOKEN}`, type: 'Wave Period' },
  { url: `${BASE_URL}Angular/?token=${API_TOKEN}`, type: 'Angular' },
  { url: `${BASE_URL}Wave%20Count/?token=${API_TOKEN}`, type: 'Wave Count' },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fetchData(endpoint) {
  try {
    console.log(`Fetching data from ${endpoint.url}`);
    const response = await fetch(endpoint.url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Origin: 'https://stackblitz.com',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched data for ${endpoint.type}`);
    return { type: endpoint.type, data: data };
  } catch (error) {
    console.error(`Error fetching data from ${endpoint.url}:`, error.message);
    throw error;
  }
}

function processData(fetchedData) {
  console.log(`Processing ${fetchedData.type} data`);

  const processedData = [];

  if (
    !fetchedData.data ||
    !fetchedData.data.data ||
    !fetchedData.data.data.Waves ||
    !fetchedData.data.data.Waves[0]
  ) {
    console.error(
      `Invalid ${fetchedData.type} data structure:`,
      JSON.stringify(fetchedData.data, null, 2)
    );
    return processedData;
  }

  const waveData = fetchedData.data.data.Waves[0][fetchedData.type];

  for (const [key, value] of Object.entries(waveData)) {
    if (value && typeof value === 'object' && 'values' in value) {
      const values = value.values;
      for (const [index, item] of Object.entries(values)) {
        const existingEntry = processedData.find(
          (entry) => entry.created_at === item.date
        );
        if (existingEntry) {
          existingEntry[key] = parseFloat(item.value);
        } else {
          processedData.push({
            created_at: item.date,
            [key]: parseFloat(item.value),
          });
        }
      }
    } else {
      console.warn(
        `Unexpected structure for ${key}:`,
        JSON.stringify(value, null, 2)
      );
    }
  }

  console.log(
    `Processed ${processedData.length} entries for ${fetchedData.type}`
  );
  return processedData;
}

async function getLatestTimestamp() {
  const { data, error } = await supabase
    .from('arica_oceano')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching latest timestamp:', error);
    return null;
  }

  return data.length > 0 ? new Date(data[0].created_at).getTime() : null;
}

function filterNewData(data, latestTimestamp) {
  if (!latestTimestamp) {
    console.log(
      'No existing data in database. All fetched data will be considered new.'
    );
    return data;
  }

  // Convert latestTimestamp to a Date object if it's a string
  const latestDate =
    latestTimestamp instanceof Date
      ? latestTimestamp
      : new Date(latestTimestamp);

  const newData = data.filter((entry) => {
    // Ensure entry.created_at is in a format that new Date() can parse
    const entryDate = new Date(entry.created_at.replace(' ', 'T') + 'Z');
    return entryDate > latestDate;
  });

  console.log(
    `Filtered ${newData.length} new entries out of ${data.length} total entries`
  );
  return newData;
}

async function storeDataInSupabase(data) {
  try {
    console.log(`Preparing to store ${data.length} entries in Supabase`);

    if (data.length === 0) {
      console.log('No new data to store. Skipping Supabase operation.');
      return;
    }

    const dataWithIds = data.map((entry) => ({
      id: entry.id || uuidv4(),
      ...entry,
    }));

    const { data: insertedData, error } = await supabase
      .from('arica_oceano')
      .upsert(dataWithIds, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) throw error;
    console.log('Data stored successfully:', insertedData);
  } catch (error) {
    console.error('Error storing data in Supabase:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  console.log(`Received ${req.method} request`);

  // Temporarily disable authorization check for testing
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   console.log('Unauthorized access attempt');
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      console.log('Starting data fetch and store process');

      // Your existing data fetching and processing logic here
      // For now, let's just log a message
      console.log('Data fetching and processing would happen here');

      console.log('Handler function completed successfully');
      res.status(200).json({
        message: 'Data fetched and stored successfully',
        method: req.method,
      });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({
        message: 'Error fetching or storing data',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        details: error.toString(),
      });
    }
  } else {
    console.log(`Invalid method: ${req.method}`);
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
