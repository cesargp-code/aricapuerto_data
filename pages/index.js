import React from 'react';
import Layout from '../components/Layout';
import WindSpeedChart from '../components/WindSpeedChart';
import WaveHeightChart from '../components/WaveHeightChart';
import SecondaryDataHome from '../components/SecondaryDataHome';

const Home = () => {
  return (
    <Layout>
      <div className="col-12">
        <WindSpeedChart />
      </div>
      <div className="col-12">
        <WaveHeightChart />
      </div>
      <div className="col-12">
        <SecondaryDataHome />
      </div>
    </Layout>
  );
};

export default Home;