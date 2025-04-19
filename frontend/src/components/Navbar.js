```jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <h2>Finance Manager</h2>
      <ul>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/budget">Budget</Link></li>
        <li><Link to="/goals">Goals</Link></li>
        <li><Link to="/bills">Bills</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
```