import React, { useState } from 'react';
import GoalForm from '../components/GoalForm';
import GoalList from '../components/GoalList';

const Goals = () => {
  const [goals, setGoals] = useState([]);

  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal]);
  };

  return (
    <div>
      <h2>Financial Goals</h2>
      <GoalForm addGoal={addGoal} />
      <GoalList goals={goals} />
    </div>
  );
};

export default Goals;