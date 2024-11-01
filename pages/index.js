import React from 'react';
import Layout from '../components/Layout';
import HomeWindChart from '../components/HomeWind';
import HomeWavesChart from '../components/HomeWaves';
import HomeSecondary from '../components/HomeSecondary';

const Home = () => {
  return (
    <Layout>
      <div className="col-12">
        <HomeWindChart />
      </div>
      <div className="col-12">
        <HomeWavesChart />
      </div>
      <div className="col-12">
        <HomeSecondary />
      </div>
    </Layout>
  );
};

export default Home;