import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// ... [Keep the existing imports and configurations] ...

function processData(fetchedData) {
  console.log(`Processing ${fetchedData.type} data`);

  const processedData = {};

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
        if (!processedData[item.date]) {
          processedData[item.date] = { created_at: item.date };
        }
        processedData[item.date][`${fetchedData.type}_${key}`] = parseFloat(item.value);
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

// ... [Keep other functions as they are] ...

export default async function handler(req, res) {
  console.log(`Received ${req.method} request`);

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('Unauthorized access attempt');
    return res.status(401).json({ message: 'Unauthorized' });
  }

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