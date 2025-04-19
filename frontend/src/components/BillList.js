import React from 'react';

const BillList = ({ bills }) => {
  return (
    <div>
      <h3>Upcoming Bills</h3>
      <ul>
        {bills.map((bill, index) => (
          <li key={index}>
            <strong>{bill.name}</strong> — ${bill.amount} due on {bill.dueDate} ({bill.frequency})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BillList;