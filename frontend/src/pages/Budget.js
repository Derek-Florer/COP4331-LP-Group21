import React, { useState } from 'react';
import BudgetForm from '../components/BudgetForm';
import BudgetTable from '../components/BudgetTable';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);

  const addBudget = (budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  return (
    <div>
      <h2>Monthly Budget</h2>
      <BudgetForm addBudget={addBudget} />
      <BudgetTable budgets={budgets} />
    </div>
  );
};

export default Budget;
