import React, { useState } from 'react';
import BillForm from '../components/BillForm';
import BillList from '../components/BillList';

const Bills = () => {
  const [bills, setBills] = useState([]);

  const addBill = (bill) => {
    setBills(prev => [...prev, bill]);
  };

  return (
    <div>
      <h2>Recurring Bills & Reminders</h2>
      <BillForm addBill={addBill} />
      <BillList bills={bills} />
    </div>
  );
};

export default Bills;