import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TransactionForm = ({ addTransaction }) => {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'General',
    date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({ ...form, id: uuidv4() });
    setForm({ description: '', amount: '', category: 'General', date: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
      <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount" required />
      <input name="date" type="date" value={form.date} onChange={handleChange} required />
      <select name="category" value={form.category} onChange={handleChange}>
        <option>General</option>
        <option>Food</option>
        <option>Rent</option>
        <option>Utilities</option>
      </select>
      <button type="submit">Add</button>
    </form>
  );
};

export default TransactionForm;