import React from 'react';
import Layout from '../components/Layout';
import WindSpeedChart from '../components/WindSpeedChart';

const Home = () => {
  return (
    <Layout>
      <div className="col-12">
        <WindSpeedChart />
      </div>
    </Layout>
  );
};

export default Home;