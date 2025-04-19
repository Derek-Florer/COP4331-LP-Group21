import React, { useState } from 'react';

const BillForm = ({ addBill }) => {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'Monthly'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addBill(form);
    setForm({ name: '', amount: '', dueDate: '', frequency: 'Monthly' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Bill Name" required />
      <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount ($)" required />
      <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required />
      <select name="frequency" value={form.frequency} onChange={handleChange}>
        <option value="Weekly">Weekly</option>
        <option value="Biweekly">Biweekly</option>
        <option value="Monthly">Monthly</option>
      </select>
      <button type="submit">Add Bill</button>
    </form>
  );
};

export default BillForm;