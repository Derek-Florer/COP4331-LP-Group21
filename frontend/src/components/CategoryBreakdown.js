import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryBreakdown = () => {
  const data = {
    labels: ['Food', 'Rent', 'Entertainment', 'Utilities'],
    datasets: [
      {
        label: 'Spending by Category',
        data: [400, 1200, 300, 200],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div>
      <h3>Category Breakdown</h3>
      <Pie data={data} />
    </div>
  );
};

export default CategoryBreakdown;