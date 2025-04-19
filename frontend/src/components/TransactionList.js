import React from 'react';

const TransactionList = ({ transactions }) => {
  return (
    <div>
      <h3>History</h3>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>{tx.description} - ${tx.amount} - {tx.category} - {tx.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;