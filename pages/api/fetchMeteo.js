import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const API_TOKEN = process.env.API_TOKEN;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://oceancom.msm-data.com/api/device/10/EMA/';

const endpoints = [
  { url: `${BASE_URL}Atmospheric%20Pressure/?token=${API_TOKEN}`, type: 'Atmospheric Pressure' },
  { url: `${BASE_URL}Wind%20Speed/?token=${API_TOKEN}`, type: 'Wind Speed' },
  { url: `${BASE_URL}Wind%20Gust/?token=${API_TOKEN}`, type: 'Wind Gust' },
  { url: `${BASE_URL}Angular/?token=${API_TOKEN}`, type: 'Angular' },
  { url: `${BASE_URL}Temperature/?token=${API_TOKEN}`, type: 'Temperature' },
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

  const processedData = {};

  if (
    !fetchedData.data ||
    !fetchedData.data.data ||
    !fetchedData.data.data.EMA ||
    !fetchedData.data.data.EMA[0]
  ) {
    console.error(
      `Invalid ${fetchedData.type} data structure:`,
      JSON.stringify(fetchedData.data, null, 2)
    );
    return processedData;
  }

  const EMAData = fetchedData.data.data.EMA[0][fetchedData.type];

  for (const [key, value] of Object.entries(EMAData)) {
    if (value && typeof value === 'object' && 'values' in value) {
      const values = value.values;
      for (const [index, item] of Object.entries(values)) {
        if (!processedData[item.date]) {
          processedData[item.date] = { created_at: item.date };
        }
        // Use only the original key name, without prefixing with fetchedData.type
        processedData[item.date][key] = parseFloat(item.value);
      }
    } else {
      console.warn(
        `Unexpected structure for ${key}:`,
        JSON.stringify(value, null, 2)
      );
    }
  }

  console.log(
    `Processed ${Object.keys(processedData).length} entries for ${fetchedData.type}`
  );
  return Object.values(processedData);
}

async function getLatestTimestamp() {
  const { data, error } = await supabase
    .from('arica_meteo')
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

  const latestDate = new Date(latestTimestamp);

  const newData = data.filter((entry) => {
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
      .from('arica_meteo')
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

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('Authorization failed');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('Authorization successful');

  if (req.method === 'GET' || req.method === 'POST') {
    try {
      console.log('Starting data fetch and store process');

      const latestTimestamp = await getLatestTimestamp();
      console.log('Latest timestamp in database:', latestTimestamp);

      // Fetch data from all endpoints
      console.log('Fetching data from endpoints');
      const fetchPromises = endpoints.map((endpoint) => fetchData(endpoint));
      const fetchedDataArray = await Promise.all(fetchPromises);
      console.log('Data fetched successfully');

      // Process all fetched data
      console.log('Processing fetched data');
      const processedDataArray = fetchedDataArray.map((fetchedData) => processData(fetchedData));
      console.log('Data processed successfully');

      // Merge all processed data
      console.log('Merging processed data');
      const mergedData = processedDataArray.reduce((acc, curr) => {
        curr.forEach(item => {
          const existingEntry = acc.find(entry => entry.created_at === item.created_at);
          if (existingEntry) {
            Object.assign(existingEntry, item);
          } else {
            acc.push(item);
          }
        });
        return acc;
      }, []);
      console.log(`Merged data: ${mergedData.length} entries`);

      // Filter new data
      console.log('Filtering new data');
      const newData = filterNewData(mergedData, latestTimestamp);
      console.log(`New data to be stored: ${newData.length} entries`);

      // Store the new data in Supabase
      if (newData.length > 0) {
        console.log('Storing new data in Supabase');
        await storeDataInSupabase(newData);
        console.log('Data stored successfully');
      } else {
        console.log('No new data to store');
      }

      console.log('Handler function completed successfully');
      res.status(200).json({
        message: 'Data fetched and stored successfully',
        newDataCount: newData.length,
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