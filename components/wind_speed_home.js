import React, { useState, useEffect } from 'react';
import mockWindData from '../mocks/mockWindData.json';  // Adjust the path as necessary

// Import Tabler components
import { Card } from '@tabler/core';
import Chart from 'react-apexcharts';

const WindSpeedChart = () => {
  const [windData, setWindData] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (process.env.NODE_ENV === 'development') {
      // Use mock data in development
      setWindData(mockWindData);
    } else {
      // Use real data in production
      initializeSupabaseAndFetchData();
    }
  }, []);

  const initializeSupabaseAndFetchData = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or Key is missing. Please check your environment variables.');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      await fetchWindData(supabase);
    } catch (err) {
      console.error('Error initializing Supabase:', err);
      setError(err.message);
    }
  };

  const fetchWindData = async (supabase) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('arica_meteo')
      .select('created_at, WSPD')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching wind data:', error);
      setError('Failed to fetch wind data. Please try again later.');
    } else {
      setWindData(data);
    }
  };

  const chartOptions = {
    chart: {
      id: 'wind-speed-chart',
      type: 'line',
    },
    xaxis: {
      categories: windData.map(d => new Date(d.created_at).toLocaleTimeString()),
    },
    yaxis: {
      title: {
        text: 'Wind Speed (m/s)',
      },
    },
  };

  const chartSeries = [
    {
      name: 'Wind Speed',
      data: windData.map(d => d.WSPD),
    },
  ];

  if (!isClient) return null; // Return null on server-side

  if (error) {
    return (
      <Card>
        <Card.Body>
          <p>Error: {error}</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Wind Speed (Last 24 Hours)</Card.Title>
      </Card.Header>
      <Card.Body>
        {windData.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={300}
          />
        ) : (
          <p>Loading wind data...</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default WindSpeedChart;