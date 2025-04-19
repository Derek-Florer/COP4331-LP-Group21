import React, { useState } from 'react';

const GoalForm = ({ addGoal }) => {
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    deadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addGoal({ ...form, progress: 0 });
    setForm({ title: '', targetAmount: '', deadline: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Goal Title" required />
      <input name="targetAmount" type="number" value={form.targetAmount} onChange={handleChange} placeholder="Target Amount" required />
      <input name="deadline" type="date" value={form.deadline} onChange={handleChange} required />
      <button type="submit">Add Goal</button>
    </form>
  );
};

export default GoalForm;