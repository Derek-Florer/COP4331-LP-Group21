```jsx
import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
  };

  return (
    <div>
      <h2>Transactions</h2>
      <TransactionForm addTransaction={addTransaction} />
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Transactions;
```