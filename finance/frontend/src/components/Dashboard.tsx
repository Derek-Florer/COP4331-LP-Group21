import { useNavigate } from 'react-router-dom';

function Dashboard() {

    const navigate = useNavigate();

    const userDataString = localStorage.getItem('user_data');
    let firstName = '';
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            firstName = userData.firstName;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
        }
    } 

    const handleLogout = () => {
      // Clear user data
      //localStorage.removeItem('user_data');
      localStorage.clear(); // clear everything
  
      navigate('/');
    };

    const handleSubscription = () => {
        navigate('/subscriptions');
      };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {firstName}!</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <section className="account-summary">
        <h2>Account Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Balance</h3>
            <p>$999,999,450.00</p>
          </div>
          <div className="summary-card">
            <h3>Monthly Income</h3>
            <p>$4,200.00</p>
          </div>
          <div className="summary-card">
            <h3>Monthly Expenses</h3>
            <p>$2,780.00</p>
          </div>
          <div className="summary-card">
            <h3>Net Change</h3>
            <p>+$1,420.00</p>
          </div>
        </div>
      </section>

      <section className="recent-transactions">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Apr 10</td>
              <td>Grocery Store</td>
              <td>Food</td>
              <td>-$56.23</td>
            </tr>
            <tr>
              <td>Apr 9</td>
              <td>Paycheck</td>
              <td>Income</td>
              <td>+$2,100.00</td>
            </tr>
            <tr>
              <td>Apr 8</td>
              <td>Gym Membership</td>
              <td>Health</td>
              <td>-$49.99</td>
            </tr>
            {/* Add more sample rows if you want */}
          </tbody>
        </table>
      </section>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions">
          <button>Add Transaction</button>
          <button>Set Budget</button>
          <button onClick={handleSubscription}>View Subscriptions</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

