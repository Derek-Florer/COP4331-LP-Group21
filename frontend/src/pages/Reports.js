import React from 'react';
import SpendingChart from '../components/SpendingChart';
import CategoryBreakdown from '../components/CategoryBreakdown';

const Reports = () => {
  return (
    <div>
      <h2>Spending Reports</h2>
      <SpendingChart />
      <CategoryBreakdown />
    </div>
  );
};

export default Reports;