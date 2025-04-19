import React, { useState } from 'react';

const BudgetForm = ({ addBudget }) => {
  const [form, setForm] = useState({
    category: 'General',
    limit: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addBudget({ ...form, limit: parseFloat(form.limit) });
    setForm({ category: 'General', limit: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="category" value={form.category} onChange={handleChange}>
        <option value="General">General</option>
        <option value="Food">Food</option>
        <option value="Rent">Rent</option>
        <option value="Utilities">Utilities</option>
        <option value="Entertainment">Entertainment</option>
      </select>
      <input
        type="number"
        name="limit"
        placeholder="Monthly Limit"
        value={form.limit}
        onChange={handleChange}
        required
      />
      <button type="submit">Set Budget</button>
    </form>
  );
};

export default BudgetForm;