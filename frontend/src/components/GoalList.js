import React from 'react';

const GoalList = ({ goals }) => {
  return (
    <div>
      <h3>Goals List</h3>
      <ul>
        {goals.map((goal, index) => (
          <li key={index}>
            <strong>{goal.title}</strong> — ${goal.targetAmount} by {goal.deadline} — Progress: {goal.progress}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoalList;