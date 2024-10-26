import React from 'react';
import Layout from '../components/Layout';
import WindSpeedChart from '../components/WindSpeedChart';
import WaveHeightChart from '../components/WaveHeightChart';

const Home = () => {
  return (
    <Layout>
      <div className="col-12">
        <WindSpeedChart />
      </div>
      <div className="col-12">
        <WaveHeightChart />
      </div>
    </Layout>
  );
};

export default Home;