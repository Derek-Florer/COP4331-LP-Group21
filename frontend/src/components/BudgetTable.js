import React from 'react';

const BudgetTable = ({ budgets }) => {
  return (
    <div>
      <h3>Current Budgets</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Monthly Limit ($)</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((b, index) => (
            <tr key={index}>
              <td>{b.category}</td>
              <td>{b.limit.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;